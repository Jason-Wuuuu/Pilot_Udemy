import { homeworks, generateId } from "../data/homeworkData.js";

export const findAll = () => {
  return homeworks;
};

export const findById = (id) => {
  return homeworks.find((hw) => hw.id === id);
};

export const findIndex = (id) => {
  return homeworks.findIndex((hw) => hw.id === id);
};

export const create = (homeworkData) => {
  const now = new Date();
  const newHomework = {
    id: generateId("hw"),
    ...homeworkData,
    submissions: [],
    createdAt: now,
    updatedAt: now,
  };
  homeworks.push(newHomework);
  return newHomework;
};

export const update = (index, updatedData) => {
  homeworks[index] = {
    ...homeworks[index],
    ...updatedData,
    updatedAt: new Date(),
  };
  return homeworks[index];
};

export const remove = (index) => {
  homeworks.splice(index, 1);
};

export const getByIndex = (index) => {
  return homeworks[index];
};
