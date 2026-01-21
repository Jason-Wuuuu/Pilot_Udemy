import { Router } from "express";
import {
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
} from "../controllers/submissionController.js";

const router = Router();

// /api/submissions/:id
router.get("/:id", getSubmissionById);
router.put("/:id", updateSubmission);
router.delete("/:id", deleteSubmission);

export default router;
