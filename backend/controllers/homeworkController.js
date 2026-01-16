import * as homeworkService from "../services/homeworkService.js";

// GET /api/homeworks
export const getAllHomeworks = (req, res) => {
  const { tutorId, courseId } = req.query;
  const result = homeworkService.getAllHomeworks({ tutorId, courseId });
  res.json(result);
};

// GET /api/homeworks/:id
export const getHomeworkById = (req, res) => {
  const { id } = req.params;
  const result = homeworkService.getHomeworkById(id);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.json({ data: result.data });
};

// POST /api/homeworks
export const createHomework = (req, res) => {
  const result = homeworkService.createHomework(req.body);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(201).json({ data: result.data });
};

// PUT /api/homeworks/:id
export const updateHomework = (req, res) => {
  const { id } = req.params;
  const result = homeworkService.updateHomework(id, req.body);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.json({ data: result.data });
};

// DELETE /api/homeworks/:id
export const deleteHomework = (req, res) => {
  const { id } = req.params;
  const { tutorId } = req.body;
  const result = homeworkService.deleteHomework(id, tutorId);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(204).send();
};
