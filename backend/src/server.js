import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import quizRoutes from "../routes/quiz.routes.js";
import quizSubmissionRoutes from "../routes/quizSubmission.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/quizzes", quizRoutes);
app.use("/api/submissions", quizSubmissionRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
