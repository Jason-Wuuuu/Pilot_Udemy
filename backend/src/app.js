// app.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/status", (req, res) => {
  res.json({ message: "Backend is live!", version: "1.0.0" });
});

// Auth routes
app.use("/api/auth", authRoutes);

export default app;
