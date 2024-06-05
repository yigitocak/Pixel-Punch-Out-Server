import express from "express";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";
import auth from "./routes/auth.js";
import profiles from "./routes/profile.js";
import leaderboard from "./routes/leaderboard.js";
import oauth from "./routes/oauth.js";
import discord from "./routes/discord.js";
import session from "express-session";

const app = express();
const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.SECRET_KEY;
const NODE_ENV = process.env.NODE_ENV;

const allowedOrigins = ["https://ppo-online.com", "https://dev.ppo-online.com"];

// Allow localhost only in development or test environments
if (NODE_ENV === "development" || NODE_ENV === "test") {
  allowedOrigins.push("http://localhost");
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.static("public"));

app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  }),
);

app.use("/auth", auth);
app.use("/profiles", profiles);
app.use("/leaderboard", leaderboard);
app.use("/oauth", oauth);
app.use("/discord", discord);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
