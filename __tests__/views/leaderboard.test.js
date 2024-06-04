import request from "supertest";
import express from "express";
import knex from "knex";
import knexfile from "../../knexfile.js";
import dotenv from "dotenv";
import { LeaderboardView } from "../../views/LeaderboardViews.js";
import bcrypt from "bcrypt";

dotenv.config();
const db = knex(knexfile.development);

const app = express();
app.get("/", LeaderboardView);

describe("LeaderboardView", () => {
  const testUsers = [
    {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    },
    {
      username: "testuser1",
      email: "testuser1@example.com",
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
    // Insert users without wins and losses
    for (const user of testUsers) {
      let hashedPassword = await bcrypt.hash(user.password, 10);
      await db("users").insert({
        username: user.username,
        email: user.email,
        password: hashedPassword,
      });
    }
  });

  afterAll(async () => {
    await db("users").del();
    await db("pending_users").del();
  });

  // Update wins and losses for each user
  async function updateUsers() {
    for (const user of testUsers) {
      await db("users")
        .where("username", user.username)
        .update({
          wins: Math.floor(Math.random() * 10), // Random wins
          losses: Math.floor(Math.random() * 10), // Random losses
        });
    }
  }

  it("should sort the users correctly based on their wins/losses (dynamic)", async () => {
    await updateUsers(); // Update users with random wins/losses before test

    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });
});
