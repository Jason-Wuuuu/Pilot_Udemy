import * as submissionService from "../services/submissionService.js";

// GET /api/homeworks/:homeworkId/submissions
export const getSubmissionsByHomework = async (req, res) => {
  try {
    const { homeworkId } = req.params;
    const result = await submissionService.getSubmissionsByHomework(homeworkId);

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

// GET /api/submissions/:id
export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await submissionService.getSubmissionById(id);

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.json({ data: result.data });
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
};

// POST /api/homeworks/:homeworkId/submissions
export const createSubmission = async (req, res) => {
  try {
    const { homeworkId } = req.params;
    const result = await submissionService.createSubmission(
      homeworkId,
      req.body
    );

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.status(201).json({ data: result.data });
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({ error: "Failed to create submission" });
  }
};

// PUT /api/submissions/:id (grading)
export const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await submissionService.updateSubmission(id, req.body);

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.json({ data: result.data });
  } catch (error) {
    console.error("Error updating submission:", error);
    res.status(500).json({ error: "Failed to update submission" });
  }
};

// DELETE /api/submissions/:id
export const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    const result = await submissionService.deleteSubmission(id, studentId);

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({ error: "Failed to delete submission" });
  }
};

// GET /api/homeworks/:homeworkId/submissions/my?studentId=xxx
export const getMySubmission = async (req, res) => {
  try {
    const { homeworkId } = req.params;
    const { studentId } = req.query;
    const result = await submissionService.getStudentSubmissionForHomework(
      homeworkId,
      studentId
    );

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.json({ data: result.data });
  } catch (error) {
    console.error("Error fetching student submission:", error);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
};

// PUT /api/submissions/:id/content
export const updateSubmissionContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, text, fileUrl } = req.body;
    const result = await submissionService.updateSubmissionContent(id, studentId, {
      text,
      fileUrl,
    });

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.json({ data: result.data });
  } catch (error) {
    console.error("Error updating submission content:", error);
    res.status(500).json({ error: "Failed to update submission" });
  }
};

// PUT /api/submissions/:id/grade
export const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;
    const result = await submissionService.gradeSubmission(id, { score, feedback });

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.json({ data: result.data });
  } catch (error) {
    console.error("Error grading submission:", error);
    res.status(500).json({ error: "Failed to grade submission" });
  }
};
