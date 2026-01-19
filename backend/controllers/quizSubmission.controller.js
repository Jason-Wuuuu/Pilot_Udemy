import { CreateSubmissionSchema } from "../models/quizSubmission.model.js";
import {
  getQuizSubmissionsByUserService,
  submitQuizService,
  getSubmissionsByQuizService,
  getSubmissionByIdService,
} from "../services/quizSubmission.service.js";

// Student: Get own submission history
export const getQuizSubmissionsByUserController = async (req, res) => {
  try {
    const result = await getQuizSubmissionsByUserService({
      user: req.user,
    });

    res.json(result);
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
};

// Admin: Get all submissions for a quiz
export const getSubmissionsByQuizController = async (req, res) => {
  try {
    const result = await getSubmissionsByQuizService({
      user: req.user,
      quizId: req.params.quizId,
    });

    res.json(result);
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
};

// Get single submission (student own OR admin)
export const getSubmissionByIdController = async (req, res) => {
  try {
    const result = await getSubmissionByIdService({
      user: req.user,
      submissionId: req.params.submissionId,
    });

    res.json(result);
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
};

// Student: Submit quiz
export const submitQuizController = async (req, res) => {
  try {
    const payload = CreateSubmissionSchema.parse(req.body);

    const result = await submitQuizService({
      user: req.user,
      quizId: req.params.quizId,
      payload,
    });

    res.status(201).json(result);
  } catch (e) {
    res.status(e.statusCode || 400).json({ error: e.message });
  }
};
