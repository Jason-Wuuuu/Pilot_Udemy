import { buildCategoryPK } from "./category.model.js";

export const COURSE_ENTITY = "COURSE";
export const COURSE_METADATA_SK = "METADATA";

export const buildCoursePK = (courseId) =>
  `COURSE#${courseId}`;

export const buildCourseItem = ({
  courseId,
  courseName,
  description,
  categoryId,
  categoryName,
  level,
  contentType,
  createdBy,
  instructor,
  status = "DRAFT",
  publishedAt = null,
}) => {
  const now = new Date().toISOString();

  return {
    PK: buildCoursePK(courseId),
    SK: COURSE_METADATA_SK,

    entityType: COURSE_ENTITY,

    // identity
    courseId,

    // core fields
    courseName,
    description,
    level,
    contentType,

    // category (denormalized)
    categoryId,
    categoryName,

    // enrollment (mutable)
    studentIds: [],

    // lifecycle
    status,
    createdBy,
    instructor,
    createdAt: now,
    publishedAt,

    // indexing
    GSI1PK: buildCategoryPK(categoryId),
    GSI1SK: `CREATED_AT#${now}`,
  };
};
