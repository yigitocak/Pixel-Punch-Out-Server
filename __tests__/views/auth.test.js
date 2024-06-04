import request from "supertest";
import express from "express";
import knex from "knex";
import knexfile from "../../knexfile.js";
import dotenv from "dotenv";
import {
  DecodeView,
  LoginView,
  SignUpView,
  VerifyView,
} from "../../views/AuthViews.js";
import bcrypt from "bcrypt";
import authenticateToken from "../../middlewares/authenticateToken.js";

dotenv.config();

const environment = process.env.NODE_ENV || "development";
const config =
  environment === "test" ? knexfile.development : knexfile.production;
const db = knex(config);

const app = express();
app.use(express.json());
app.post("/signup", SignUpView);
app.post("/verify", VerifyView);
app.post("/login", LoginView);
app.get("/decode", authenticateToken, DecodeView);

// SIGNUP TESTS
describe("AuthViews - SignUpView", () => {
  it("should create a field in the pending_users table", async () => {
    const response = await request(app).post("/signup").send({
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const pendingUser = await db("pending_users")
      .where({ email: "testuser@example.com" })
      .first();

    expect(pendingUser).not.toBeUndefined();
    expect(pendingUser).toHaveProperty("username", "testuser");
    expect(pendingUser).toHaveProperty("email", "testuser@example.com");
  });
});

// VERIFY TESTS
describe("AuthViews - VerifyView", () => {
  afterAll(async () => {
    await db("users").where("email", "testuser@example.com").del();
  });

  it("should verify a user and move them from pending_users to users table", async () => {
    const pendingUser = await db("pending_users")
      .where({ email: "testuser@example.com" })
      .first();

    const response = await request(app).post("/verify").send({
      email: "testuser@example.com",
      code: pendingUser.verification_code,
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);

    const user = await db("users")
      .where({ email: "testuser@example.com" })
      .first();

    expect(user).not.toBeUndefined();
  });

  it("should have all the fields correct in moved user inside 'users' table", async () => {
    const user = await db("users")
      .where({ email: "testuser@example.com" })
      .first();

    expect(user).toHaveProperty("username", "testuser");
    expect(user).toHaveProperty("email", "testuser@example.com");
    expect(user).toHaveProperty("wins", 0);
    expect(user).toHaveProperty("losses", 0);
    expect(user).toHaveProperty("comments", []);
    expect(user).toHaveProperty(
      "photoUrl",
      "https://api.ppo-online.com/profilePhotos/default.jpeg",
    );
    expect(user).toHaveProperty("resetKey", null);
    expect(user).toHaveProperty("oAuth2", 0);
    expect(user).toHaveProperty("username_last_changed", null);
    expect(user).toHaveProperty("discordID", null);
    expect(user).toHaveProperty("oauthMethod", null);
    expect(user).toHaveProperty("admin", 0);
  });

  it("the user should not still be in pending users table", async () => {
    const stillPendingUser = await db("pending_users")
      .where({ email: "testuser@example.com" })
      .first();

    expect(stillPendingUser).toBeUndefined();
  });
});

// LOGIN TESTS
describe("AuthViews - LoginView", () => {
  const testUser = {
    username: "testuser",
    email: "testuser@example.com",
    password: "password123",
  };

  beforeEach(async () => {
    // Clean up the db
    await db("users").del();
    await db("pending_users").del();

    // Manually put user
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await db("users").insert({
      username: testUser.username,
      email: testUser.email,
      password: hashedPassword,
    });
  });

  afterAll(async () => {
    await db("users").del();
    await db("pending_users").del();
  });

  it("should login a verified user", async () => {
    const response = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
      rememberMe: true,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.username).toBe(testUser.username);
  });

  it("should not login with incorrect password", async () => {
    const response = await request(app).post("/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Incorrect password");
  });

  it("should send a new verification code if the user is in pending_users", async () => {
    // Manually make a pending user
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await db("pending_users").insert({
      username: "pendinguser",
      email: "pendinguser@example.com",
      password: hashedPassword,
      verification_code: "123456",
    });

    // Attempt to login the pending user
    const response = await request(app).post("/login").send({
      email: "pendinguser@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "A new verification code has been sent to your email. Please verify your account.",
    );
  });

  it("should return 404 for a non-existent user", async () => {
    const response = await request(app).post("/login").send({
      email: "nonexistent@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("User not found");
  });
});

describe("AuthViews - DecodeView", () => {
  const testUser = {
    username: "testuser",
    email: "testuser@example.com",
    password: "password123",
  };
  beforeEach(async () => {
    // Clean up the db
    await db("users").del();
    await db("pending_users").del();

    // Manually put user
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await db("users").insert({
      username: testUser.username,
      email: testUser.email,
      password: hashedPassword,
    });
  });
  afterAll(async () => {
    await db("users").del();
    await db("pending_users").del();
  });
  it("Should return correct data for token", async () => {
    const loginResponse = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    const token = loginResponse.body.token;

    const response = await request(app)
      .get("/decode")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.decoded.username).toBe(testUser.username);
    expect(response.body.decoded.email).toBe(testUser.email);
  });
});
