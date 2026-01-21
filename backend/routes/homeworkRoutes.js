import { Router } from "express";
import {
  getAllHomeworks,
  getHomeworkById,
  createHomework,
  updateHomework,
  deleteHomework,
} from "../controllers/homeworkController.js";
import {
  getSubmissionsByHomework,
  createSubmission,
  getMySubmission,
} from "../controllers/submissionController.js";

const router = Router();

// /api/homeworks
router.get("/", getAllHomeworks);
router.get("/:id", getHomeworkById);
router.post("/", createHomework);
router.put("/:id", updateHomework);
router.delete("/:id", deleteHomework);

// /api/homeworks/:homeworkId/submissions
router.get("/:homeworkId/submissions/my", getMySubmission); 
router.get("/:homeworkId/submissions", getSubmissionsByHomework);
router.post("/:homeworkId/submissions", createSubmission);

export default router;
