


import { buildCategoryPK } from "./category.model.js";

export const COURSE_ENTITY = "COURSE";

export const buildCoursePK = (courseId) => `COURSE#${courseId}`;

export const COURSE_METADATA_SK = "METADATA";

const now = new Date().toISOString();

export const buildCourseItem = (payload) => ({
  PK: buildCoursePK(payload.courseId),
  SK: COURSE_METADATA_SK,

  courseId: payload.courseId,
  courseName: payload.courseName,
  description: payload.description,

  categoryId: payload.categoryId,
  categoryName: payload.categoryName,

  level: payload.level,
  contentType: payload.contentType,

  status: "CREATED",
  createdBy: payload.createdBy,
  createdAt: now,
  publishedAt: now,

  GSI1PK: buildCategoryPK(payload.categoryId),
  GSI1SK: `CREATED_AT#${now}`
});

