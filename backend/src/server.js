import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import quizRoutes from "../routes/quiz.routes.js";
import quizSubmissionRoutes from "../routes/quizSubmission.routes.js";
import aiRoutes from "../routes/ai.routes.js";
import authRoutes from "../routes/auth.routes.js";
import userRoutes from "../routes/user.routes.js";

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

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
