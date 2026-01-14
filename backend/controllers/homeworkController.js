import { homeworks, generateId } from "../data/homeworkData.js";

// GET /api/homeworks
export const getAllHomeworks = (req, res) => {
  const { tutorId, courseId } = req.query;

  let result = homeworks;

  if (tutorId) {
    result = result.filter((hw) => hw.tutorId === tutorId);
  }

  if (courseId) {
    result = result.filter((hw) => hw.courseId === courseId);
  }

  res.json({ data: result, count: result.length });
};

// GET /api/homeworks/:id
export const getHomeworkById = (req, res) => {
  const { id } = req.params;
  const homework = homeworks.find((hw) => hw.id === id);

  if (!homework) {
    return res.status(404).json({ error: "Homework not found" });
  }

  res.json({ data: homework });
};

// POST /api/homeworks
export const createHomework = (req, res) => {
  const { tutorId, courseId, title, description, dueDate } = req.body;

  if (!tutorId || !courseId || !title) {
    return res.status(400).json({
      error:
        "Missing required fields: tutorId, courseId, and title are required",
    });
  }

  const now = new Date();
  const newHomework = {
    id: generateId("hw"),
    tutorId,
    courseId,
    title,
    description: description || "",
    dueDate: dueDate || null,
    submissions: [],
    createdAt: now,
    updatedAt: now,
  };

  homeworks.push(newHomework);

  res.status(201).json({ data: newHomework });
};

// PUT /api/homeworks/:id
export const updateHomework = (req, res) => {
  const { id } = req.params;
  const { tutorId, title, description, dueDate } = req.body;

  if (!tutorId) {
    return res.status(400).json({ error: "tutorId is required" });
  }

  const index = homeworks.findIndex((hw) => hw.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Homework not found" });
  }

  if (tutorId !== homeworks[index].tutorId) {
    return res.status(400).json({ error: "tutorId does not match" });
  }

  const updatedHomework = {
    ...homeworks[index],
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(dueDate !== undefined && { dueDate }),
    updatedAt: new Date(),
  };

  homeworks[index] = updatedHomework;

  res.json({ data: updatedHomework });
};

// DELETE /api/homeworks/:id
export const deleteHomework = (req, res) => {
  const { id } = req.params;
  const { tutorId } = req.body;

  if (!tutorId) {
    return res.status(400).json({ error: "tutorId is required" });
  }

  const homework = homeworks.find((hw) => hw.id === id);
  if (!homework) {
    return res.status(404).json({ error: "Homework not found" });
  }

  if (tutorId !== homework.tutorId) {
    return res.status(400).json({ error: "tutorId does not match" });
  }

  const index = homeworks.findIndex((hw) => hw.id === id);
  homeworks.splice(index, 1);

  res.status(204).send();
};
