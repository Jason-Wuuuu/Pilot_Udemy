import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import quizRoutes from "../routes/quiz.routes.js";
import quizSubmissionRoutes from "../routes/quizSubmission.routes.js";
import aiRoutes from "../routes/ai.routes.js";
import authRoutes from "../routes/auth.routes.js";
import userRoutes from "../routes/user.routes.js";
import homeworkRoutes from "../routes/homeworkRoutes.js";
import submissionRoutes from "../routes/submissionRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

app.use("/api/quizzes", quizRoutes);
app.use("/api/submissions", quizSubmissionRoutes);
app.use("/api/ai", aiRoutes);


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

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
  console.log(`Server running on ${PORT}`);
});
