import express from "express";
import { LeaderboardView } from "../views/LeaderboardViews.js";

const lb = express();

lb.get("/", LeaderboardView);

export default lb;
