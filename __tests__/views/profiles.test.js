import express from "express";
import knex from "knex";
import knexfile from "../../knexfile.js";
import "dotenv/config";
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
} from "../../views/ProfileViews.js";
import bcrypt from "bcrypt";
import { LoginView } from "../../views/AuthViews.js";
import request from "supertest";
import authenticateToken from "../../middlewares/authenticateToken.js";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = knex(knexfile.development);
const app = express();
app.use(express.json());
app.post("/login", LoginView);
app.post("/username", authenticateToken, ChangeUsernameView);
app.delete("/:username", authenticateToken, DeleteProfileView);
app.post("/:username/wins", IncrementWinsView);
app.post("/:username/losses", IncrementLossesView);
app.get("/users", FetchAllUsersView);
app.post(
  "/:username/photo",
  authenticateToken,
  multer().single("file"),
  UploadPhotoView,
);
app.post("/:username/comments", authenticateToken, AddCommentView);
app.delete(
  "/:username/comments/:commentId",
  authenticateToken,
  DeleteCommentView,
);
app.get("/users/:username", FetchSpecificUser);

// CHANGE USERNAME TEST
describe("ProfileViews - ChangeUsernameView", () => {
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
  it("should change username successfully and return a new jwt token", async () => {
    const loginResponse = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    const token = loginResponse.body.token;

    const response = await request(app)
      .post("/username")
      .send({
        newUsername: "newusername",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).not.toBe(null);
  });
});

// DELETE PROFILE TEST
describe("ProfileViews - DeleteProfileView", () => {
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
  afterEach(async () => {
    await db("users").del();
    await db("pending_users").del();
  });
  it("should delete a current profile", async () => {
    const loginResponse = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    const token = loginResponse.body.token;

    const response = await request(app)
      .delete("/testuser")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    const dbUser = await db("users")
      .where("username", testUser.username)
      .first();

    expect(dbUser).toBeUndefined();
  });
  it("should return 404 for non-existent user", async () => {
    const loginResponse = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    const token = loginResponse.body.token;

    const response = await request(app)
      .delete("/wrongusername")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
  });
  it("should return 403 for wrong token", async () => {
    const loginResponse = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    const token = loginResponse.body.token;

    const response = await request(app)
      .delete("/notoken")
      .set("Authorization", `Bearer Not REAL TOKEN`);
    expect(response.statusCode).toBe(403);
  });
});

// TEST FOR INCREMENTING USER WINS
describe("ProfileViews - IncrementWinsView", () => {
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
  afterEach(async () => {
    await db("users").del();
    await db("pending_users").del();
  });
  it("should increment users wins with secret key", async () => {
    const response = await request(app).post("/testuser/wins").send({
      secret: process.env.SECRET_KEY,
    });

    expect(response.statusCode).toBe(200);

    const dbUser = await db("users")
      .select("wins")
      .where("username", testUser.username)
      .first();

    expect(dbUser.wins).toBe(1);
  });
  it("should return 403 if secret key is wrong", async () => {
    const response = await request(app).post("/testuser/wins").send({
      secret: "wrongsecret",
    });

    expect(response.statusCode).toBe(403);
  });
});

// TEST FOR INCREMENT LOSSES
describe("ProfileViews - IncrementLossesView", () => {
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
  afterEach(async () => {
    await db("users").del();
    await db("pending_users").del();
  });
  it("should increment users losses with secret key", async () => {
    const response = await request(app).post("/testuser/losses").send({
      secret: process.env.SECRET_KEY,
    });

    expect(response.statusCode).toBe(200);

    const dbUser = await db("users")
      .select("losses")
      .where("username", testUser.username)
      .first();

    expect(dbUser.losses).toBe(1);
  });
  it("should return 403 if secret key is wrong", async () => {
    const response = await request(app).post("/testuser/losses").send({
      secret: "wrongsecret",
    });

    expect(response.statusCode).toBe(403);
  });
});

// TEST FOR FETCHING ALL USERS
describe("ProfileViews - FetchAllUsersView", () => {
  const testUsers = [
    {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    },
    {
      username: "testuser2",
      email: "testuser2@example.com",
      password: "password123",
    },
    {
      username: "testuser3",
      email: "testuser3@example.com",
      password: "password123",
    },
  ];

  beforeEach(async () => {
    // Clean up the db
    await db("users").del();
    await db("pending_users").del();

    // Manually put user
    for (const testUser of testUsers) {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await db("users").insert({
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword,
      });
    }
  });
  afterEach(async () => {
    await db("users").del();
    await db("pending_users").del();
  });
  it("should correctly return all users", async () => {
    const response = await request(app).get("/users");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(testUsers.length);
  });
});

// Test for changing profile picture view
describe("ProfileViews - UploadPhotoView", () => {
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

  afterEach(async () => {
    await db("users").del();
    await db("pending_users").del();
  });
  it("should return 400 if no file is uploaded", async () => {
    const loginResponse = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    const token = loginResponse.body.token;

    const response = await request(app)
      .post(`/testuser/photo`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("No file uploaded");
  });
});

// TEST FOR ADDING COMMENTS
describe("ProfileViews - AddCommentView", () => {
  const targetUser = {
    username: "targetuser",
    email: "targetuser@example.com",
    password: "password123",
  };

  const commentUser = {
    username: "commentuser",
    email: "commentuser@example.com",
    password: "password123",
  };

  beforeEach(async () => {
    // Clean up the db
    await db("users").del();
    await db("pending_users").del();

    // Manually put users
    const hashedPasswordTarget = await bcrypt.hash(targetUser.password, 10);
    await db("users").insert({
      username: targetUser.username,
      email: targetUser.email,
      password: hashedPasswordTarget,
      comments: JSON.stringify([]), // Initialize comments as an empty JSON array
    });

    const hashedPasswordComment = await bcrypt.hash(commentUser.password, 10);
    await db("users").insert({
      username: commentUser.username,
      email: commentUser.email,
      password: hashedPasswordComment,
      comments: JSON.stringify([]),
    });
  });

  afterEach(async () => {
    await db("users").del();
    await db("pending_users").del();
  });

  it("should add a comment successfully", async () => {
    const loginResponse = await request(app).post("/login").send({
      email: commentUser.email,
      password: commentUser.password,
    });

    const token = loginResponse.body.token;

    const response = await request(app)
      .post(`/targetuser/comments`)
      .send({
        commentUsername: commentUser.username,
        comment: "This is a test comment",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Comment Added");

    const dbUser = await db("users")
      .where("username", targetUser.username)
      .first();

    const comments = dbUser.comments || "[]";
    expect(comments).toHaveLength(1);
    expect(comments[0].comment).toBe("This is a test comment");
  });

  it("should return 400 if commentUsername or comment is missing", async () => {
    const loginResponse = await request(app).post("/login").send({
      email: commentUser.email,
      password: commentUser.password,
    });

    const token = loginResponse.body.token;

    const response = await request(app)
      .post(`/targetuser/comments`)
      .send({
        comment: "This is a test comment without username",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Both commentUsername and comment are required");
  });
});

// TEST FOR DELETING COMMENTS
describe("ProfileViews - DeleteCommentView", () => {
  const targetUser = {
    username: "targetuser",
    email: "targetuser@example.com",
    password: "password123",
  };

  const commentUser = {
    username: "commentuser",
    email: "commentuser@example.com",
    password: "password123",
  };

  beforeEach(async () => {
    // Clean up the db
    await db("users").del();
    await db("pending_users").del();

    // Manually put users
    const hashedPasswordTarget = await bcrypt.hash(targetUser.password, 10);
    await db("users").insert({
      username: targetUser.username,
      email: targetUser.email,
      password: hashedPasswordTarget,
      comments: JSON.stringify([
        {
          commentId: "12345",
          commentUsername: commentUser.username,
          comment: "This is a test comment",
          timestamp: Date.now(),
        },
      ]),
    });

    const hashedPasswordComment = await bcrypt.hash(commentUser.password, 10);
    await db("users").insert({
      username: commentUser.username,
      email: commentUser.email,
      password: hashedPasswordComment,
      comments: JSON.stringify([]),
    });
  });

  afterEach(async () => {
    await db("users").del();
    await db("pending_users").del();
  });

  it("should delete a comment successfully", async () => {
    const loginResponse = await request(app).post("/login").send({
      email: commentUser.email,
      password: commentUser.password,
    });

    const token = loginResponse.body.token;

    const response = await request(app)
      .delete(`/targetuser/comments/12345`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Comment Deleted Successfully");

    const dbUser = await db("users")
      .where("username", targetUser.username)
      .first();

    const comments = dbUser.comments || "[]";
    expect(comments).toHaveLength(0);
  });

  it("should return 404 if comment is not found", async () => {
    const loginResponse = await request(app).post("/login").send({
      email: commentUser.email,
      password: commentUser.password,
    });

    const token = loginResponse.body.token;

    const response = await request(app)
      .delete(`/targetuser/comments/99999`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Comment Not Found");
  });

  it("should return 404 if user is not found", async () => {
    const loginResponse = await request(app).post("/login").send({
      email: commentUser.email,
      password: commentUser.password,
    });

    const token = loginResponse.body.token;

    const response = await request(app)
      .delete(`/wronguser/comments/12345`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("User Not Found");
  });
});

// TEST FOR FETCHING A SPECIFIC USER
describe("ProfileViews - FetchSpecificUser", () => {
  const testUser = {
    username: "testuser",
    email: "testuser@example.com",
    password: "password123",
    wins: 5,
    losses: 3,
    photoUrl: "http://example.com/photo.jpg",
    discordID: "1234567890",
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
      wins: testUser.wins,
      losses: testUser.losses,
      photoUrl: testUser.photoUrl,
      discordID: testUser.discordID,
      comments: JSON.stringify([]),
    });
  });

  afterEach(async () => {
    await db("users").del();
    await db("pending_users").del();
  });

  it("should fetch a specific user successfully", async () => {
    const response = await request(app).get(`/users/${testUser.username}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.profile).toMatchObject({
      username: testUser.username,
      wins: testUser.wins,
      losses: testUser.losses,
      photoUrl: testUser.photoUrl,
      discordID: testUser.discordID,
      comments: [],
    });
  });

  it("should return 404 if user is not found", async () => {
    const response = await request(app).get("/users/nonexistentuser");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("User not found");
  });
});
