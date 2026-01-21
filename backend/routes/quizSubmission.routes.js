import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";

import {
  getQuizSubmissionsByUserController,
  getSubmissionsByQuizController,
  getSubmissionByIdController,
} from "../controllers/quizSubmission.controller.js";

const router = Router();

//Submission
router.get("/", authenticate, getQuizSubmissionsByUserController); //todo: /应该是既能看到有分数 又能看到没分数
router.get("/by-quiz/:quizId", authenticate, getSubmissionsByQuizController);
router.get("/:submissionId", authenticate, getSubmissionByIdController);

export default router;
