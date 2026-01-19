import { Router } from "express";

import {
  getQuizSubmissionsByUserController,
  getSubmissionsByQuizController,
  getSubmissionByIdController,
} from "../controllers/quizSubmission.controller.js";

const router = Router();

//Submission
router.get("/", getQuizSubmissionsByUserController); //todo: /应该是既能看到有分数 又能看到没分数
router.get("/by-quiz/:quizId", getSubmissionsByQuizController);
router.get("/:submissionId", getSubmissionByIdController);

export default router;
