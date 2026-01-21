import { Router } from "express";
import {
  getQuizByIdController,
  createQuizController,
  getMyQuizzesController,
  updateQuizByIdController,
  deleteQuizByIdController,
  aiGenerateQuizController,
  getCourseQuizzesController,
} from "../controllers/quiz.controller.js";
import {
  getQuizSubmissionsByUserController,
  submitQuizController,
} from "../controllers/quizSubmission.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

//Ai
router.post("/aigenerate", authenticate, aiGenerateQuizController);

//Todo: 加middleware auth
router.get("/me", authenticate, getMyQuizzesController);
router.post("/", authenticate, createQuizController);
router.get("/:quizId", authenticate, getQuizByIdController);
router.put("/:quizId", authenticate, updateQuizByIdController);
router.delete("/:quizId", authenticate, deleteQuizByIdController);
// GET /api/courses/:courseId/quizzes
router.get(
  "/courses/:courseId/quizzes",
  authenticate,
  getCourseQuizzesController
);

//Submission
router.post("/:quizId/submissions", authenticate, submitQuizController);

export default router;
