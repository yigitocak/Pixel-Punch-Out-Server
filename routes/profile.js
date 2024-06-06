import express from "express";
import knex from "knex";
import knexfile from "../knexfile.js";
import "dotenv/config";
import authenticateToken from "../middlewares/authenticateToken.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import {
  AddCommentView,
  ChangeUsernameView,
  DeleteCommentView,
  DeleteProfileView,
  FetchAllUsersView,
  FetchSpecificUser,
  IncrementLossesView,
  IncrementWinsView,
  UploadPhotoView,
  FetchSpecificUserWithId,
} from "../views/ProfileViews.js";

const environment = process.env.NODE_ENV || "development";
const config =
  environment === "test" ? knexfile.development : knexfile.production;
const db = knex(config);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profilePhotos",
    format: async (req, file) => path.extname(file.originalname).slice(1),
    public_id: (req, file) => req.params.username,
  },
});

const upload = multer({ storage: storage });

// Create express router for profile operations
const profile = express();
profile.use(express.json());

// route to update a username
profile.post("/username", authenticateToken, ChangeUsernameView);

// Route to delete a user profile.
profile.delete("/:username", authenticateToken, DeleteProfileView);

// Route to increment user's wins
profile.post("/:username/wins", IncrementWinsView);

// Route to increment user's losses
profile.post("/:username/losses", IncrementLossesView);

// Route to fetch all user profiles
profile.get("/", FetchAllUsersView);

// Route to fetch spesific user with id
profile.get("/id/:id", FetchSpecificUserWithId);

// Route for uploading a user photo
profile.post(
  "/:username/uploadPhoto",
  authenticateToken,
  upload.single("photo"),
  UploadPhotoView,
);

// Route for adding a comment to a user profile
profile.post("/:username/comments", authenticateToken, AddCommentView);

// Route to delete a comment from a user profile
profile.delete(
  `/:username/comments/:commentId`,
  authenticateToken,
  DeleteCommentView,
);

// Route to fetch a specific user profile
profile.get("/:username", authenticateToken, FetchSpecificUser);

export default profile;
