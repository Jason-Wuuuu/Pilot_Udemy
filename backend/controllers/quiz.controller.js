import {
  getQuizByIdService,
  createQuizService,
  updateQuizByIdService,
  deleteQuizByIdService,
  aiGenerateQuizService,
} from "../services/quiz.service.js";
import { CreateQuizSchema, UpdateQuizSchema } from "../models/quiz.model.js";

// GET /api/quizzes/:quizId
export const getQuizByIdController = async (req, res) => {
  try {
    const quiz = await getQuizByIdService({
      user: req.user,
      quizId: req.params.quizId,
    });

    res.json(quiz);
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
};

// POST /api/quizzes
export const createQuizController = async (req, res) => {
  try {
    const payload = CreateQuizSchema.parse(req.body);

    const quiz = await createQuizService({
      user: req.user,
      payload,
    });

    res.status(201).json(quiz);
  } catch (e) {
    res.status(e.statusCode || 400).json({ error: e.message });
  }
};

// PUT /api/quizzes/:quizId
export const updateQuizByIdController = async (req, res) => {
  try {
    const payload = UpdateQuizSchema.parse(req.body);

    const quiz = await updateQuizByIdService({
      user: req.user,
      quizId: req.params.quizId,
      payload,
    });

    res.json(quiz);
  } catch (e) {
    res.status(e.statusCode || 400).json({ error: e.message });
  }
};

// DELETE /api/quizzes/:quizId
export const deleteQuizByIdController = async (req, res) => {
  try {
    await deleteQuizByIdService({
      user: req.user,
      quizId: req.params.quizId,
    });

    res.status(204).send();
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
};

// GET /api/quizzes/me
export const getMyQuizzesController = async (req, res) => {
  try {
    const quizzes = await getMyQuizzesService({
      user: req.user,
    });

    res.json(quizzes);
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
};

// POST /api/quizzes/ai/preview
export const aiGenerateQuizController = async (req, res) => {
  try {
    const preview = await aiGenerateQuizService({
      user: req.user,
      payload: req.body,
    });

    res.json(preview);
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
};
