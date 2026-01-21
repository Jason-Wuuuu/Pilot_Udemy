/* =========================
   LECTURE
========================= */

export const LECTURE_ENTITY = "LECTURE";
export const MATERIAL_ENTITY = "MATERIAL";

export const formatLectureOrder = (lectureOrder) =>
  String(lectureOrder).padStart(4, "0");

export const buildLectureSK = (lectureOrder) =>
  `LECTURE#${formatLectureOrder(lectureOrder)}`;

export const buildLectureItem = ({
  courseId,
  lectureId,
  lectureOrder,
  title,
  description,
}) => {
  const now = new Date().toISOString();

  return {
    PK: `COURSE#${courseId}`,
    SK: buildLectureSK(lectureOrder),

    entityType: LECTURE_ENTITY,

    lectureId,
    lectureOrder,
    title,
    description,
    
    createdAt: now,
    updatedAt: now,
  };
};

/* =========================
   MATERIAL
========================= */

export const buildMaterialSK = (lectureOrder, materialOrder) =>
  `LECTURE#${formatLectureOrder(
    lectureOrder
  )}#MATERIAL#${materialOrder}`;

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

  // storage
  storageType = "LOCAL",
  filePath = null,
  mimeType = null,
  s3Key = null,
}) => {
  const now = new Date().toISOString();

  return {
    PK: `COURSE#${courseId}`,
    SK: buildMaterialSK(lectureOrder, materialOrder),

    entityType: MATERIAL_ENTITY,

    lectureId,
    materialId,
    lectureOrder,
    materialOrder,

    title,
    materialType,
    duration,
    isPreview,

    storageType,
    filePath,
    mimeType,
    s3Key,

    createdAt: now,
    updatedAt: now,
  };
};
