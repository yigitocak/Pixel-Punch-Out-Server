import express from "express";
import "dotenv/config";
import authenticateToken from "../middlewares/authenticateToken.js";
import {
  SignUpView,
  VerifyView,
  LoginView,
  DecodeView,
  ResetView,
  ValidateResetView,
  ResetPasswordView,
} from "../views/AuthViews.js";

const auth = express();
auth.use(express.json());

auth.post("/signup", SignUpView);

auth.post("/verify", VerifyView);

auth.post("/login", LoginView);

auth.get("/", authenticateToken, DecodeView);

auth.post("/reset", ResetView);

auth.post("/validateReset", ValidateResetView);

auth.post("/resetPassword", ResetPasswordView);

export default auth;
