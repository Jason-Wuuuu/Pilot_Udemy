import * as homeworkRepository from "../repositories/homeworkRepository.js";

export const getAllHomeworks = (filters) => {
  let result = homeworkRepository.findAll();

  if (filters.tutorId) {
    result = result.filter((hw) => hw.tutorId === filters.tutorId);
  }

  if (filters.courseId) {
    result = result.filter((hw) => hw.courseId === filters.courseId);
  }

  return { data: result, count: result.length };
};

export const getHomeworkById = (id) => {
  const homework = homeworkRepository.findById(id);
  if (!homework) {
    return { error: "Homework not found", status: 404 };
  }
  return { data: homework };
};

export const createHomework = (homeworkData) => {
  const { tutorId, courseId, title, description, dueDate } = homeworkData;

  if (!tutorId || !courseId || !title) {
    return {
      error:
        "Missing required fields: tutorId, courseId, and title are required",
      status: 400,
    };
  }

  const newHomework = homeworkRepository.create({
    tutorId,
    courseId,
    title,
    description: description || "",
    dueDate: dueDate || null,
  });

  return { data: newHomework, status: 201 };
};

export const updateHomework = (id, updateData) => {
  const { tutorId, title, description, dueDate } = updateData;

  if (!tutorId) {
    return { error: "tutorId is required", status: 400 };
  }

  const index = homeworkRepository.findIndex(id);
  if (index === -1) {
    return { error: "Homework not found", status: 404 };
  }

  const existingHomework = homeworkRepository.getByIndex(index);
  if (tutorId !== existingHomework.tutorId) {
    return { error: "tutorId does not match", status: 400 };
  }

  const updatedHomework = homeworkRepository.update(index, {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(dueDate !== undefined && { dueDate }),
  });

  return { data: updatedHomework };
};

export const deleteHomework = (id, tutorId) => {
  if (!tutorId) {
    return { error: "tutorId is required", status: 400 };
  }

  const homework = homeworkRepository.findById(id);
  if (!homework) {
    return { error: "Homework not found", status: 404 };
  }

  if (tutorId !== homework.tutorId) {
    return { error: "tutorId does not match", status: 400 };
  }

  const index = homeworkRepository.findIndex(id);
  homeworkRepository.remove(index);

  return { status: 204 };
};

// Helper for submission service
export const addSubmissionToHomework = (homeworkId, submissionId) => {
  const homework = homeworkRepository.findById(homeworkId);
  if (homework) {
    homework.submissions.push(submissionId);
    homework.updatedAt = new Date();
  }
};

export const removeSubmissionFromHomework = (homeworkId, submissionId) => {
  const homework = homeworkRepository.findById(homeworkId);
  if (homework) {
    homework.submissions = homework.submissions.filter(
      (subId) => subId !== submissionId
    );
    homework.updatedAt = new Date();
  }
};
