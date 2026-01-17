import { Router } from "express";
import { aiGenerateQuiz } from "../ai/genminiUtils.js";
import {
  getQuizByIdController,
  createQuizController,
  updateQuizByIdController,
  getQuizzesByUserIdController,
  deleteQuizByIdController,
  aiGenerateQuizController,
} from "../controllers/quiz.controller.js";
import {
  getQuizSubmissionsByUserController,
  submitQuizController,
} from "../controllers/quizSubmission.controller.js";

const router = Router();

//Ai
router.post("/generate", aiGenerateQuizController);

//Todo: 加middleware auth
router.get("/", getQuizzesByUserIdController);
router.post("/", createQuizController);
router.get("/:quizId", getQuizByIdController);
router.put("/:quizId", updateQuizByIdController);
router.delete("/:quizId", deleteQuizByIdController);

//Submission
router.post("/:quizId/submissions", submitQuizController);

export default router;
