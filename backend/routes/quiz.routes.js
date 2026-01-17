import { Router } from "express";
import {
  getQuizByIdController,
  createQuizController,
  updateQuizByIdController,
  getQuizzesByUserIdController,
  deleteQuizByIdController,
} from "../controllers/quiz.controller.js";
import {
  getQuizSubmissionsByUserController,
  submitQuizController,
} from "../controllers/quizSubmission.controller.js";

const router = Router();



//Todo: 加middleware auth
router.get("/", getQuizzesByUserIdController);
router.post("/", createQuizController);
router.get("/:quizId", getQuizByIdController);
router.put("/:quizId", updateQuizByIdController);
router.delete("/:quizId", deleteQuizByIdController);

//Submission
router.post("/:quizId/submissions", submitQuizController);

export default router;
