import { CreateSubmissionSchema } from "../models/quizSubmission.model.js";
import {
  getQuizSubmissionsByUserService,
  submitQuizService,
} from "../services/quizSubmission.service.js";

//Get Submission History
export const getQuizSubmissionsByUserController = async (req, res) => {
  try {
    const userId = req.query.userId;

    const result = await getQuizSubmissionsByUserService(userId);
    res.json(result);
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
};

//Submit Quiz
export const submitQuizController = async (req, res) => {
  try {
    const payload = CreateSubmissionSchema.parse(req.body);
    const result = await submitQuizService(req.params.quizId, payload);
    res.status(201).json(result);
  } catch (e) {
    res.status(e.statusCode || 400).json({ error: e.message });
  }
};
