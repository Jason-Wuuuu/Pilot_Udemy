import * as submissionRepository from "../repositories/submissionRepository.js";
import * as homeworkService from "./homeworkService.js";

export const getSubmissionsByHomework = async (homeworkId) => {
  const homeworkResult = await homeworkService.getHomeworkById(homeworkId);
  if (homeworkResult.error) {
    return homeworkResult;
  }

  const result = await submissionRepository.findByHomeworkId(homeworkId);
  return { data: result, count: result.length };
};

export const getSubmissionById = async (id) => {
  const submission = await submissionRepository.findById(id);
  if (!submission) {
    return { error: "Submission not found", status: 404 };
  }
  return { data: submission };
};

export const createSubmission = async (homeworkId, submissionData) => {
  const { studentId, text, fileUrl } = submissionData;

  const homeworkResult = await homeworkService.getHomeworkById(homeworkId);
  if (homeworkResult.error) {
    return homeworkResult;
  }

  if (!studentId) {
    return { error: "studentId is required", status: 400 };
  }

  if (!text && !fileUrl) {
    return { error: "text or fileUrl is required", status: 400 };
  }

  const newSubmission = await submissionRepository.create({
    studentId,
    homeworkId,
    text: text || "",
    fileUrl: fileUrl || null,
  });

  await homeworkService.addSubmissionToHomework(homeworkId, newSubmission.id);

  return { data: newSubmission, status: 201 };
};

export const updateSubmission = async (id, updateData) => {
  const { score, feedback } = updateData;

  const submission = await submissionRepository.findById(id);
  if (!submission) {
    return { error: "Submission not found", status: 404 };
  }

  const updatedSubmission = await submissionRepository.update(id, {
    ...(score !== undefined && { score }),
    ...(feedback !== undefined && { feedback }),
  });

  return { data: updatedSubmission };
};

export const deleteSubmission = async (id, studentId) => {
  if (!studentId) {
    return { error: "studentId is required", status: 400 };
  }

  const submission = await submissionRepository.findById(id);
  if (!submission) {
    return { error: "Submission not found", status: 404 };
  }

  if (studentId !== submission.studentId) {
    return { error: "studentId does not match", status: 400 };
  }

  await homeworkService.removeSubmissionFromHomework(submission.homeworkId, id);
  await submissionRepository.remove(id);

  return { status: 204 };
};

export const getStudentSubmissionForHomework = async (homeworkId, studentId) => {
  if (!studentId) {
    return { error: "studentId is required", status: 400 };
  }

  const homeworkResult = await homeworkService.getHomeworkById(homeworkId);
  if (homeworkResult.error) {
    return homeworkResult;
  }

  const submission = await submissionRepository.findByHomeworkIdAndStudentId(
    homeworkId,
    studentId
  );

  if (!submission) {
    return { error: "Submission not found", status: 404 };
  }

  return { data: submission };
};

export const updateSubmissionContent = async (id, studentId, updateData) => {
  if (!studentId) {
    return { error: "studentId is required", status: 400 };
  }

  const submission = await submissionRepository.findById(id);
  if (!submission) {
    return { error: "Submission not found", status: 404 };
  }

  if (studentId !== submission.studentId) {
    return { error: "Unauthorized: You can only update your own submission", status: 403 };
  }

  const { text, fileUrl } = updateData;
  const updatedSubmission = await submissionRepository.update(id, {
    ...(text !== undefined && { text }),
    ...(fileUrl !== undefined && { fileUrl }),
  });

  return { data: updatedSubmission };
};

export const gradeSubmission = async (id, gradeData) => {
  const submission = await submissionRepository.findById(id);
  if (!submission) {
    return { error: "Submission not found", status: 404 };
  }

  const { score, feedback } = gradeData;
  const updatedSubmission = await submissionRepository.update(id, {
    ...(score !== undefined && { score }),
    ...(feedback !== undefined && { feedback }),
  });

  return { data: updatedSubmission };
};
