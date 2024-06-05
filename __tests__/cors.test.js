import request from "supertest";
import express from "express";
import cors from "cors";
import "dotenv/config";
import session from "express-session";

const SECRET_KEY = process.env.SECRET_KEY;

const createApp = (nodeEnv) => {
  const app = express();

  const allowedOrigins = [
    "https://ppo-online.com",
    "https://dev.ppo-online.com",
  ];

  if (nodeEnv === "development" || nodeEnv === "test") {
    allowedOrigins.push("http://localhost");
  }

  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.static("public"));

  app.use(
    session({
      secret: SECRET_KEY,
      resave: false,
      saveUninitialized: true,
    }),
  );

  app.get("/test", (req, res) => {
    res.send("CORS test endpoint");
  });

  // Custom error handler for testing
  app.use((err, req, res, next) => {
    if (err) {
      if (process.env.NODE_ENV === "test") {
        // Suppress the error in test environment
        res.status(500).json({ message: err.message });
      } else {
        next(err);
      }
    } else {
      next();
    }
  });

  return app;
};

describe("CORS Configuration", () => {
  it("should allow localhost in development environment", async () => {
    process.env.NODE_ENV = "test";
    const app = createApp(process.env.NODE_ENV);
    const response = await request(app)
      .get("/test")
      .set("Origin", "http://localhost");

    expect(response.statusCode).toBe(200);
  });

  it("should not allow localhost in production environment", async () => {
    process.env.NODE_ENV = "production";
    const app = createApp(process.env.NODE_ENV);
    const response = await request(app)
      .get("/test")
      .set("Origin", "http://localhost");

    expect(response.statusCode).toBe(500);
  });

  it("should allow ppo-online.com in any environment", async () => {
    process.env.NODE_ENV = "production";
    const app = createApp(process.env.NODE_ENV);
    const response = await request(app)
      .get("/test")
      .set("Origin", "https://ppo-online.com");

    expect(response.statusCode).toBe(200);
  });

  it("should not allow unknown origins", async () => {
    process.env.NODE_ENV = "production";
    const app = createApp(process.env.NODE_ENV);
    const response = await request(app)
      .get("/test")
      .set("Origin", "http://unknown-origin.com");

    expect(response.statusCode).toBe(500);
  });
});
