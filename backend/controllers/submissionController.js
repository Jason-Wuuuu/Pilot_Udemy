import { homeworks, submissions, generateId } from "../data/homeworkData.js";

// GET /api/homeworks/:homeworkId/submissions
export const getSubmissionsByHomework = (req, res) => {
  const { homeworkId } = req.params;

  const homework = homeworks.find((hw) => hw.id === homeworkId);
  if (!homework) {
    return res.status(404).json({ error: "Homework not found" });
  }

  const result = submissions.filter((sub) => sub.homeworkId === homeworkId);

  res.json({ data: result, count: result.length });
};

// GET /api/submissions/:id
export const getSubmissionById = (req, res) => {
  const { id } = req.params;
  const submission = submissions.find((sub) => sub.id === id);

  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  res.json({ data: submission });
};

// POST /api/homeworks/:homeworkId/submissions
export const createSubmission = (req, res) => {
  const { homeworkId } = req.params;
  const { studentId, text, fileUrl } = req.body;

  const homework = homeworks.find((hw) => hw.id === homeworkId);
  if (!homework) {
    return res.status(404).json({ error: "Homework not found" });
  }

  if (!studentId) {
    return res.status(400).json({ error: "studentId is required" });
  }

  // at least one of text or fileUrl is required
  if (!text && !fileUrl) {
    return res.status(400).json({ error: "text or fileUrl is required" });
  }

  const newSubmission = {
    id: generateId("sub"),
    studentId,
    homeworkId,
    text: text || "",
    fileUrl: fileUrl || null,
    score: null,
    feedback: null,
    submittedAt: new Date(),
  };

  submissions.push(newSubmission);

  // add submission reference to homework
  homework.submissions.push(newSubmission.id);
  homework.updatedAt = new Date();

  res.status(201).json({ data: newSubmission });
};

// PUT /api/submissions/:id (grading)
export const updateSubmission = (req, res) => {
  const { id } = req.params;
  const { score, feedback } = req.body;

  const index = submissions.findIndex((sub) => sub.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Submission not found" });
  }

  const updatedSubmission = {
    ...submissions[index],
    ...(score !== undefined && { score }),
    ...(feedback !== undefined && { feedback }),
  };

  submissions[index] = updatedSubmission;

  res.json({ data: updatedSubmission });
};

// DELETE /api/submissions/:id
export const deleteSubmission = (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;

  const index = submissions.findIndex((sub) => sub.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Submission not found" });
  }
  if (!studentId) {
    return res.status(400).json({ error: "studentId is required" });
  }

  if (studentId !== submissions[index].studentId) {
    return res.status(400).json({ error: "studentId does not match" });
  }

  const submission = submissions[index];

  // Remove submission reference from homework
  const homework = homeworks.find((hw) => hw.id === submission.homeworkId);
  if (homework) {
    homework.submissions = homework.submissions.filter((subId) => subId !== id);
    homework.updatedAt = new Date();
  }

  submissions.splice(index, 1);

  res.status(204).send();
};
