import express from "express";
import knex from "knex";
import knexfile from "../knexfile.js";
import "dotenv/config";
import authenticateToken from "../middlewares/authenticateToken.js";
import multer from "multer";
import path from "path";
const BACKEND_URL = process.env.BACKEND_URL;

// Configuration for storing uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "public/profilePhotos");
  },
  filename: function (req, file, callback) {
    const extension = path.extname(file.originalname);
    const username = req.params.username;
    callback(null, username + extension);
  },
});

// Create multer instance for handling file uploads
const upload = multer({ storage: storage });

// Initialize database connection using configuration
const db = knex(knexfile.development);

// Create express router for profile operations
const profile = express();
profile.use(express.json());

// Route to fetch all user profiles
profile.get("/", async (req, res) => {
  try {
    const users = await db("users").select(
      "id",
      "username",
      "wins",
      "losses",
      "photoUrl",
    );

    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route for uploading a user photo
profile.post(
  "/:username/uploadPhoto",
  authenticateToken,
  upload.single("photo"),
  async (req, res) => {
    const { username } = req.params;

    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }
    try {
      const photoUrl = `${BACKEND_URL}profilePhotos/${req.file.filename}`;

      await db("users").where({ username }).update({ photoUrl });

      res.status(200).json({
        success: true,
        message: "Photo uploaded successfully",
        photoUrl: photoUrl,
      });
    } catch (error) {
      console.error("Error saving photo URL to the database:", error);
      res.status(500).send("Internal server error");
    }
  },
);

// Route for adding a comment to a user profile
profile.post("/:username/comments", authenticateToken, async (req, res) => {
  const { username } = req.params;
  const { commentUsername, comment } = req.body;

  if (!comment || !commentUsername) {
    return res
      .status(400)
      .send("Both commentUsername and comment are required");
  }

  try {
    const user = await db("users").where({ username }).first();

    if (!user) {
      return res.status(404).send("User not found");
    }

    const newComment = {
      commentId: crypto.randomUUID(),
      username: commentUsername,

      comment: comment,
      timestamp: Date.now(),
    };

    const currentComments = user.comments || [];
    const updatedComments = [...currentComments, newComment];

    await db("users")
      .where({ username })
      .update({
        comments: JSON.stringify(updatedComments),
      });

    res.status(201).json({ message: "Comment Added" });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send("Internal server error");
  }
});

// Route to delete a comment from a user profile
profile.delete(
  `/:username/comments/:commentId`,
  authenticateToken,
  async (req, res) => {
    const { username, commentId } = req.params;

    try {
      const user = await db("users").where({ username }).first();

      if (!user) {
        return res.status(404).json({ message: "User Not Found" });
      }

      const currentComments = user.comments || [];

      const updatedComments = currentComments.filter(
        (comment) => comment.commentId !== commentId,
      );

      if (updatedComments.length === currentComments.length) {
        return res.status(404).json({ message: "Comment Not Found" });
      }

      await db("users")
        .where({ username })
        .update({
          comments: JSON.stringify(updatedComments),
        });

      res.status(200).json({ message: "Comment Deleted Successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  },
);

// Route to fetch a specific user profile
profile.get("/:username", authenticateToken, async (req, res) => {
  const { username } = req.params;

  try {
    const user = await db("users").where({ username }).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { password, email, ...userDetails } = user;

    res.json({
      success: true,
      profile: userDetails,
      message: "User profile fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default profile;