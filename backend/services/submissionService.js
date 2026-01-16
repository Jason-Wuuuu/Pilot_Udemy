import * as submissionRepository from "../repositories/submissionRepository.js";
import * as homeworkService from "./homeworkService.js";

export const getSubmissionsByHomework = (homeworkId) => {
  const homeworkResult = homeworkService.getHomeworkById(homeworkId);
  if (homeworkResult.error) {
    return homeworkResult;
  }

  const result = submissionRepository.findByHomeworkId(homeworkId);
  return { data: result, count: result.length };
};

export const getSubmissionById = (id) => {
  const submission = submissionRepository.findById(id);
  if (!submission) {
    return { error: "Submission not found", status: 404 };
  }
  return { data: submission };
};

export const createSubmission = (homeworkId, submissionData) => {
  const { studentId, text, fileUrl } = submissionData;

  const homeworkResult = homeworkService.getHomeworkById(homeworkId);
  if (homeworkResult.error) {
    return homeworkResult;
  }

  if (!studentId) {
    return { error: "studentId is required", status: 400 };
  }

  if (!text && !fileUrl) {
    return { error: "text or fileUrl is required", status: 400 };
  }

  const newSubmission = submissionRepository.create({
    studentId,
    homeworkId,
    text: text || "",
    fileUrl: fileUrl || null,
  });

  homeworkService.addSubmissionToHomework(homeworkId, newSubmission.id);

  return { data: newSubmission, status: 201 };
};

export const updateSubmission = (id, updateData) => {
  const { score, feedback } = updateData;

  const index = submissionRepository.findIndex(id);
  if (index === -1) {
    return { error: "Submission not found", status: 404 };
  }

  const updatedSubmission = submissionRepository.update(index, {
    ...(score !== undefined && { score }),
    ...(feedback !== undefined && { feedback }),
  });

  return { data: updatedSubmission };
};

export const deleteSubmission = (id, studentId) => {
  const index = submissionRepository.findIndex(id);
  if (index === -1) {
    return { error: "Submission not found", status: 404 };
  }

  if (!studentId) {
    return { error: "studentId is required", status: 400 };
  }

  const submission = submissionRepository.getByIndex(index);
  if (studentId !== submission.studentId) {
    return { error: "studentId does not match", status: 400 };
  }

  homeworkService.removeSubmissionFromHomework(submission.homeworkId, id);
  submissionRepository.remove(index);

  return { status: 204 };
};
