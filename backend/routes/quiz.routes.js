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
import multer from "multer";

const router = Router();
const upload = multer({ dest: "tmp/" });
//Ai
router.post(
  "/aigenerate",
  authenticate,
  upload.single("file"),
  aiGenerateQuizController
);

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
