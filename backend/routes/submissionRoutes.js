import { Router } from "express";
import {
  getSubmissionById,
  updateSubmission,
  updateSubmissionContent,
  gradeSubmission,
  deleteSubmission,
} from "../controllers/submissionController.js";

const router = Router();

// /api/submissions/:id
router.get("/:id", getSubmissionById);
router.put("/:id/content", updateSubmissionContent); // Student
router.put("/:id/grade", gradeSubmission); // Admin
router.delete("/:id", deleteSubmission);

export default router;
