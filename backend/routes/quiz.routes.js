import { Router } from "express";
import {
  getQuizByIdController,
  createQuizController,
} from "../controllers/quiz.controller.js";

const router = Router();

//Todo: 加middleware auth
//router.get("/", getQuizzes);
router.post("/", createQuizController);
router.get("/:quizId", getQuizByIdController);
//router.delete("/:quizId", deleteQuiz);

//router.get("/:quizId/results", getQuizResults);
//router.post("/:quizId/submissions", submitQuiz);

export default router;
