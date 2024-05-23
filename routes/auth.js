import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import knex from "knex";
import knexfile from "../knexfile.js";
import "dotenv/config";
import authenticateToken from "../middlewares/authenticateToken.js";
import { sendEmail } from "../emailSender.js";

const db = knex(knexfile.development);
const SECRET_KEY = process.env.SECRET_KEY;
const auth = express();
auth.use(express.json());

auth.post("/signup", async (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.username) {
    return res.status(400).json({
      success: false,
      message: "Bad request body.",
    });
  }
  const { username, email, password } = req.body;
  try {
    // Check if the email or username already exists in the `users` table
    const existingUser = await db("users")
      .where({ email })
      .orWhere({ username })
      .first();
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists in users table",
      });
    }

    // Check if the email or username already exists in the `pending_users` table
    const existingPendingUser = await db("pending_users")
      .where({ email })
      .orWhere({ username })
      .first();
    if (existingPendingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists in pending users table",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const verificationCode = sendEmail(email, "Your Verification Code", 1); // Send email and get verification code

    // Temporarily store user data and verification code in the database
    await db("pending_users").insert({
      username,
      email,
      password: hashedPassword,
      verification_code: verificationCode,
      created_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Error in sign-up:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

auth.post("/verify", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: "Bad request body.",
    });
  }
  try {
    const pendingUser = await db("pending_users").where({ email }).first();

    if (!pendingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (pendingUser.verification_code !== code) {
      return res.status(401).json({
        success: false,
        message: "Incorrect verification code",
      });
    }

    // Move user from pending_users to users table
    const { username, password } = pendingUser;
    await db.transaction(async (trx) => {
      await trx("users").insert({
        username,
        email,
        password,
        comments: JSON.stringify([]),
      });
      await trx("pending_users").where({ email }).del();
    });

    res.status(201).json({
      success: true,
      message: "User verified and created successfully",
    });
  } catch (error) {
    console.error("Error in verification:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
auth.post("/login", async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      success: false,
      message: "Bad request body.",
    });
  }

  const { email, password, rememberMe } = req.body;

  try {
    // Check if the user exists in the `users` table
    const user = await db("users").where({ email }).first();
    if (user) {
      if (user.oAuth2) {
        return res.status(401).json({
          success: false,
          message: "oAuth2 Required"
        });
      } else {
        // Ensure password and user.password are defined
        if (password && user.password) {
          const match = await bcrypt.compare(password, user.password);
          if (!match) {
            return res.status(401).json({
              success: false,
              message: "Incorrect password",
            });
          }

          const expiresIn = rememberMe ? "7d" : "12h";
          const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            SECRET_KEY,
            { expiresIn },
          );

          return res.status(200).json({
            success: true,
            token,
            message: rememberMe ? "Logged in for 7d" : "Logged in for 1h",
            username: user.username,
          });
        } else {
          return res.status(500).json({
            success: false,
            message: "Server error: Missing password data.",
          });
        }
      }
    }

    // If user not found in `users`, check the `pending_users` table
    const pendingUser = await db("pending_users").where({ email }).first();
    if (pendingUser) {
      // Ensure password and pendingUser.password are defined
      if (password && pendingUser.password) {
        const match = await bcrypt.compare(password, pendingUser.password);
        if (!match) {
          return res.status(401).json({
            success: false,
            message: "Incorrect password",
          });
        }

        // Generate a new verification code
        const newVerificationCode = sendEmail(email, "Your Verification Code", 1);

        // Update the verification code in the `pending_users` table
        await db("pending_users")
          .where({ email })
          .update({ verification_code: newVerificationCode });

        return res.status(200).json({
          success: true,
          message:
            "A new verification code has been sent to your email. Please verify your account.",
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Server error: Missing password data.",
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
auth.get("/", authenticateToken, (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  const decoded = jwt.verify(token, SECRET_KEY);

  return res.status(200).json({
    decoded: decoded,
    success: true,
  });
});

auth.post("/reset", async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({
      success: false,
      message: "Bad request body",
    });
  }

  const email = req.body.email;
  try {
    // Check if the user exists in the `users` table
    const user = await db("users").where({ email }).first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.oAuth2){
      return res.status(401).json({
        success: false,
        message: "oAuth2"
      })
    }

    // Generate a reset key
    const resetKey = sendEmail(email, "Password Reset", 2);

    // Update the user's `resetKey` column
    await db("users").where({ email }).update({ resetKey });

    res.status(200).json({
      success: true,
      message: "An email has been sent",
    });
  } catch (err) {
    console.error("Error in reset:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

auth.post("/validateReset", async (req, res) => {
  if (!req.body.email || !req.body.code) {
    return res.status(400).json({
      success: false,
      message: "Bad request body",
    });
  }

  const { email, code } = req.body;

  try {
    // Check if the user exists in the `users` table
    const user = await db("users").where({ email }).first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.resetKey === code) {
      return res.sendStatus(200);
    } else {
      return res.sendStatus(403);
    }
  } catch (error) {
    console.error("Error in validateReset:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

auth.post("/resetPassword", async (req, res) => {
  if (!req.body.email || !req.body.newPassword || !req.body.secret) {
    return res.status(400).json({
      success: false,
      message: "Bad request body",
    });
  }

  if (req.body.secret !== SECRET_KEY) {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  const { email, newPassword } = req.body;

  try {
    // Check if the user exists in the `users` table
    const user = await db("users").where({ email }).first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await db("users").where({ email }).update("resetKey", null);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await db("users").where({ email }).update("password", hashedPassword);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default auth;
