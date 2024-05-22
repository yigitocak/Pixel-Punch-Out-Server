import express from "express";
import jwt from "jsonwebtoken";
import knex from "knex";
import knexfile from "../knexfile.js";
import "dotenv/config";
import { OAuth2Client } from "google-auth-library";

const db = knex(knexfile.development);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SECRET_KEY = process.env.SECRET_KEY;
const oauth = express();
oauth.use(express.json());

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

oauth.get("/google", (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
  });
  res.redirect(url);
});

oauth.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { sub, email, name, picture } = payload;

    // Check if the user exists in the database
    let user = await db("users").where({ email }).first();

    if (!user) {
      // If the user does not exist, create a new user
      const username = name;
      const photoUrl = picture;

      await db("users").insert({
        username,
        email,
        password: null, // Google OAuth users won't have a password
        photoUrl,
        comments: JSON.stringify([]),
      });

      user = await db("users").where({ email }).first();
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      success: true,
      token,
      message: "Logged in successfully",
      username: user.username,
      photoUrl: user.photoUrl,
    });
  } catch (error) {
    console.error("Error during Google login:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default oauth;
