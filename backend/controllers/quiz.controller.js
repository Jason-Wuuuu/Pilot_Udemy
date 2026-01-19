import {
  getQuizByIdService,
  createQuizService,
  updateQuizByIdService,
  getQuizzesByUserIdService,
  deleteQuizByIdService,
  aiGenerateQuizService,
} from "../services/quiz.service.js";
import { CreateQuizSchema, UpdateQuizSchema } from "../models/quiz.model.js";

export const getQuizByIdController = async (req, res) => {
  try {
    //Parse the role
    const role = req.query.role || "student";

    const quiz = await getQuizByIdService(req.params.quizId, role);
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

export const deleteQuizByIdController = async (req, res) => {
  try {
    await deleteQuizByIdService(req.params.quizId);
    res.status(204).send();
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
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

export const aiGenerateQuizController = async (req, res) => {
  try {
    const preview = await aiGenerateQuizService(req.body);
    res.json(preview);
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
};
