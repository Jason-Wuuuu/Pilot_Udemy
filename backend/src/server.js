import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import homeworkRoutes from "../routes/homeworkRoutes.js";
import submissionRoutes from "../routes/submissionRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/api/status", (req, res) => {
  res.json({ message: "Backend is live!", version: "1.0.0" });
});

// Routes
app.use("/api/homeworks", homeworkRoutes);
app.use("/api/submissions", submissionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
