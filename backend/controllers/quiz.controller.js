import {
  getQuizByIdService,
  createQuizService,
} from "../services/quiz.service.js";
import { CreateQuizSchema } from "../models/quiz.model.js";

export const getQuizByIdController = async (req, res) => {
  try {
    const quiz = await getQuizByIdService(req.params.quizId);
    res.json(quiz);
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
};

export const createQuizController = async (req, res) => {
  try {
    const payload = CreateQuizSchema.parse(req.body);
    const quiz = await createQuizService(payload);
    res.status(201).json(quiz);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
