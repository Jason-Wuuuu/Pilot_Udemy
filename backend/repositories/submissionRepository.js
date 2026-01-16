import { submissions, generateId } from "../data/homeworkData.js";

export const findAll = () => {
  return submissions;
};

export const findById = (id) => {
  return submissions.find((sub) => sub.id === id);
};

export const findByHomeworkId = (homeworkId) => {
  return submissions.filter((sub) => sub.homeworkId === homeworkId);
};

export const findIndex = (id) => {
  return submissions.findIndex((sub) => sub.id === id);
};

export const create = (submissionData) => {
  const newSubmission = {
    id: generateId("sub"),
    ...submissionData,
    score: null,
    feedback: null,
    submittedAt: new Date(),
  };
  submissions.push(newSubmission);
  return newSubmission;
};

export const update = (index, updatedData) => {
  submissions[index] = {
    ...submissions[index],
    ...updatedData,
  };
  return submissions[index];
};

export const remove = (index) => {
  submissions.splice(index, 1);
};

export const getByIndex = (index) => {
  return submissions[index];
};
