import {
  getQuizByIdService,
  createQuizService,
  updateQuizByIdService,
  getQuizzesByUserIdService,
} from "../services/quiz.service.js";
import { CreateQuizSchema, UpdateQuizSchema } from "../models/quiz.model.js";

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

export const updateQuizByIdController = async (req, res) => {
  try {
    const payload = UpdateQuizSchema.parse(req.body);
    const quiz = await updateQuizByIdService(req.params.quizId, payload);
    res.json(quiz);
  } catch (e) {
    res.status(e.statusCode || 400).json({ error: e.message });
  }
};

export const getQuizzesByUserIdController = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const quizzes = await getQuizzesByUserIdService(userId);
    res.json(quizzes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
