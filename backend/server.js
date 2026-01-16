import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import courseRoutes from "./routes/courseRoutes.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use("/api", courseRoutes);

app.get("/api/status", (req, res) => {
  res.json({ message: "Backend is live!", version: "1.0.0" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
