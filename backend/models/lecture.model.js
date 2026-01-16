export const formatLectureOrder = (lectureOrder) =>
  String(lectureOrder).padStart(4, "0");

export const buildLectureSK = (lectureOrder) =>
  `LECTURE#${formatLectureOrder(lectureOrder)}`;

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
  `LECTURE#${formatLectureOrder(lectureOrder)}#MATERIAL#${materialOrder}`;

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
  s3Key = null,
  filePath = null, 
  mimeType = null 
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

    storageType: "LOCAL",
    filePath,            
    mimeType,          
    s3Key,

    createdAt: now,
    updatedAt: now,

    entityType: "MATERIAL"
  };
};
