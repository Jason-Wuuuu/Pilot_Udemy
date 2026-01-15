import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import quizRoutes from "../routes/quiz.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/quizzes", quizRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
