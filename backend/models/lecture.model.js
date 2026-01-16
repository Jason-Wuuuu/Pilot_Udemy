export const buildLectureSK = (lectureOrder) =>
  `LECTURE#${String(lectureOrder).padStart(4, "0")}`;

export const buildLectureItem = ({
  courseId,
  lectureId,
  lectureOrder,
  title
}) => {
  const now = new Date().toISOString();

  return {
    PK: `COURSE#${courseId}`,
    SK: buildLectureSK(lectureOrder),

    lectureId,
    lectureOrder,
    title,

    createdAt: now,
    updatedAt: now,

    entityType: "LECTURE"
  };
};
export const buildMaterialSK = (lectureOrder, materialOrder) =>
  `LECTURE#${String(lectureOrder).padStart(4, "0")}#MATERIAL#${String(
    materialOrder
  ).padStart(4, "0")}`;

export const buildMaterialItem = ({
  courseId,
  lectureId,
  lectureOrder,
  materialId,
  materialOrder,
  title,
  materialType,
  duration = 0,
  isPreview = false,
  s3Key = null
}) => {
  const now = new Date().toISOString();

  return {
    PK: `COURSE#${courseId}`,
    SK: buildMaterialSK(lectureOrder, materialOrder),

    lectureId,
    materialId,
    lectureOrder,
    materialOrder,

    title,
    materialType,
    duration,
    isPreview,
    s3Key,

    createdAt: now,
    updatedAt: now,

    entityType: "MATERIAL"
  };
};
