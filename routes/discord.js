import express from "express";
import jwt from "jsonwebtoken";
import knex from "knex";
import knexfile from "../knexfile.js";
import "dotenv/config";
import axios from "axios";

const environment = process.env.NODE_ENV || "development";
const config =
  environment === "test" ? knexfile.development : knexfile.production;
const db = knex(config);

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const SECRET_KEY = process.env.SECRET_KEY;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;
const discord = express();
discord.use(express.json());

//Route to get discord user data
discord.post("/getuserdata", async (req, res) => {
  const { discordId } = req.body;
  try {
    const response = await axios.get(
      `https://discord.com/api/v10/users/${discordId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_TOKEN}`,
        },
      },
    );
    res.status(200).json(response.data);
  } catch (err) {
    console.log("Error During Discord Data fetching", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Redirect to Discord OAuth2 URL for account verification
discord.get("/verify", (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "No User Id",
    });
  }

  req.session.userId = userId;
  const url =
    "https://discord.com/oauth2/authorize?client_id=1241809773762969640&response_type=code&redirect_uri=https%3A%2F%2Fapi.ppo-online.com%2Fdiscord%2Fverify%2Fcallback&scope=identify+email+guilds";
  res.redirect(url);
});

discord.get("/verify/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.redirect(`${BACKEND_URL}login`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `${BACKEND_URL}discord/verify/callback`,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Encoded: true,
        },
      },
    );

    const accessToken = tokenResponse.data.access_token;

    // Fetch user information from Discord
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { id, email, username, avatar } = userResponse.data;
    const userId = req.session.userId;
    let user = await db("users").where("username", userId).first();

    if (user) {
      // Update user's Discord ID if found
      await db("users").where("username", userId).update({ discordID: id });
      user = await db("users").where("username", userId).first(); // Fetch updated user info

      // Redirect to user profile after verification
      return res.redirect(`${FRONTEND_URL}profiles/${userId}`);
    } else {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error during OAuth verification:", error);
    return res.redirect(`${FRONTEND_URL}login?error=unexpected`);
  }
});

// Redirect to Discord OAuth2 URL for authentication
discord.get("/oauth/login", (req, res) => {
  const url =
    "https://discord.com/oauth2/authorize?client_id=1241809773762969640&response_type=code&redirect_uri=https%3A%2F%2Fapi.ppo-online.com%2Fdiscord%2Foauth%2Fcallback&scope=identify+email+guilds";
  res.redirect(url);
});

// Handle Discord OAuth2 callback for authentication
discord.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.redirect(`${BACKEND_URL}login`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `${BACKEND_URL}discord/oauth/callback`,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const accessToken = tokenResponse.data.access_token;

    // Fetch user information from Discord
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { id, email, username, avatar } = userResponse.data;

    // Check if the user exists in the database
    let user = await db("users").where({ email }).first();

    if (!user) {
      // If the user does not exist, create a new user
      await db("users").insert({
        username: username,
        email: email,
        password: null, // Discord OAuth users won't have a password
        photoUrl: `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`,
        comments: JSON.stringify([]),
        oAuth2: true,
        discordID: id,
        oauthMethod: "Discord",
      });

      user = await db("users").where({ email }).first();
    }

    if (user.oauthMethod !== "Discord") {
      return res.status(403).json({
        success: false,
        message: "Wrong authentication method",
      });
    }

    const jwtToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      SECRET_KEY,
      { expiresIn: "12h" },
    );

    // Redirect frontend with the token, username, and photoUrl
    res.redirect(
      `${FRONTEND_URL}login?token=${jwtToken}&username=${user.username}&photoUrl=${user.photoUrl}`,
    );
  } catch (error) {
    console.error("Error during Discord login:", error);
    res.redirect(`${FRONTEND_URL}login?error=discordConflict`);
  }
});

export default discord;
