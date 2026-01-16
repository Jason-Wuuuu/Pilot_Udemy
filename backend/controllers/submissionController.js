import * as submissionService from "../services/submissionService.js";

// GET /api/homeworks/:homeworkId/submissions
export const getSubmissionsByHomework = (req, res) => {
  const { homeworkId } = req.params;
  const result = submissionService.getSubmissionsByHomework(homeworkId);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.json(result);
};

// GET /api/submissions/:id
export const getSubmissionById = (req, res) => {
  const { id } = req.params;
  const result = submissionService.getSubmissionById(id);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.json({ data: result.data });
};

// POST /api/homeworks/:homeworkId/submissions
export const createSubmission = (req, res) => {
  const { homeworkId } = req.params;
  const result = submissionService.createSubmission(homeworkId, req.body);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(201).json({ data: result.data });
};

// PUT /api/submissions/:id (grading)
export const updateSubmission = (req, res) => {
  const { id } = req.params;
  const result = submissionService.updateSubmission(id, req.body);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.json({ data: result.data });
};

// DELETE /api/submissions/:id
export const deleteSubmission = (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;
  const result = submissionService.deleteSubmission(id, studentId);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(204).send();
};
