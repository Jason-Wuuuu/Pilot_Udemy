import { Router } from "express";

import {
  getQuizSubmissionsByUserController,
  getSubmissionsByQuizController,
} from "../controllers/quizSubmission.controller.js";

const router = Router();

//Submission
router.get("/", getQuizSubmissionsByUserController); //todo: /应该是既能看到有分数 又能看到没分数
router.get("/by-quiz/:quizId", getSubmissionsByQuizController);

export default router;
