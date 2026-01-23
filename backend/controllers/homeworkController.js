import * as homeworkService from "../services/homeworkService.js";

// GET /api/homeworks
export const getAllHomeworks = async (req, res) => {
  try {
    const { tutorId, courseId } = req.query;
    const result = await homeworkService.getAllHomeworks({ tutorId, courseId });
    res.json(result);
  } catch (error) {
    console.error("Error fetching homeworks:", error);
    res.status(500).json({ error: "Failed to fetch homeworks" });
  }
};

// GET /api/homeworks/:id
export const getHomeworkById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await homeworkService.getHomeworkById(id);

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.json({ data: result.data });
  } catch (error) {
    console.error("Error fetching homework:", error);
    res.status(500).json({ error: "Failed to fetch homework" });
  }
};

// POST /api/homeworks
export const createHomework = async (req, res) => {
  try {
    const result = await homeworkService.createHomework(req.body);

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.status(201).json({ data: result.data });
  } catch (error) {
    console.error("Error creating homework:", error);
    res.status(500).json({ error: "Failed to create homework" });
  }
};

// PUT /api/homeworks/:id
export const updateHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await homeworkService.updateHomework(id, req.body);

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.json({ data: result.data });
  } catch (error) {
    console.error("Error updating homework:", error);
    res.status(500).json({ error: "Failed to update homework" });
  }
};

// DELETE /api/homeworks/:id
export const deleteHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const { tutorId } = req.body;
    const result = await homeworkService.deleteHomework(id, tutorId);

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting homework:", error);
    res.status(500).json({ error: "Failed to delete homework" });
  }
};

// GET /api/homeworks/student/:studentId
export const getHomeworksByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { notOverdue } = req.query;
    const result = await homeworkService.getHomeworksByStudentId(
      studentId,
      notOverdue === "true",
    );

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching homeworks by studentId:", error);
    res.status(500).json({ error: "Failed to fetch homeworks" });
  }
};
