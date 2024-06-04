import express from "express";
import knex from "knex";
import knexfile from "../knexfile.js";
import "dotenv/config";

const environment = process.env.NODE_ENV || "development";
const config =
  environment === "test" ? knexfile.development : knexfile.production;
const db = knex(config);

const lb = express();

lb.get("/", async (req, res) => {
  try {
    const users = await db("users")
      .select("username", "wins", "losses")
      .orderByRaw("COALESCE(wins / NULLIF(losses, 0), wins) DESC")
      .limit(10)
      .then((results) => {
        return results
          .map((user) => {
            let winrate;
            if (user.wins === 0 && user.losses === 0) {
              winrate = "0%";
            } else if (user.losses === 0) {
              winrate = "100%";
            } else {
              winrate = `${Math.round((user.wins / (user.wins + user.losses)) * 100)}%`;
            }

            return {
              ...user,
              winrate,
            };
          })
          .sort((a, b) => {
            const ratioA = a.losses === 0 ? a.wins : a.wins / a.losses;
            const ratioB = b.losses === 0 ? b.wins : b.wins / b.losses;
            return ratioB - ratioA;
          });
      });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching leaderboard");
  }
});

export default lb;
