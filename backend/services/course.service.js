import {
  getCourseById as getCourseByIdRepo,
  getCoursesByCategoryId as getCoursesByCategoryIdRepo,
  createCourse as createCourseRepo,
  updateCourse as updateCourseRepo,
  deleteCourse as deleteCourseRepo,
} from "../repositories/course.repo.js";

import {
  getLecturesByCourseId as getLecturesByCourseIdRepo,
  createLecture as createLectureRepo,
  updateLecture as updateLectureRepo,
  deleteLecture as deleteLectureRepo,
} from "../repositories/lecture.repo.js";

import {
  getMaterialsByLectureOrder,
  createMaterial as createMaterialRepo,
  updateMaterial as updateMaterialRepo,
  deleteMaterial as deleteMaterialRepo,
} from "../repositories/material.repo.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Service.js";

import fs from "fs/promises";
import path from "path";
/* =========================
   COURSE
========================= */

export const getCourseById = async (courseId) => {
  return getCourseByIdRepo(courseId);
};

export const getCoursesByCategoryId = async (categoryId) => {
  return getCoursesByCategoryIdRepo(categoryId);
};

export const createCourse = async (payload) => {
  return createCourseRepo(payload);
};

export const updateCourse = async (courseId, updates) => {
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error("No update fields provided");
  }
  return updateCourseRepo(courseId, updates);
};

export const deleteCourseCascade = async (courseId) => {
  const lectures = await getLecturesByCourseIdRepo(courseId);

  for (const lecture of lectures) {
    const materials = await getMaterialsByLectureOrder(
      courseId,
      lecture.lectureOrder
    );

    for (const material of materials) {
      if (material.filePath) {
        await fs.unlink(material.filePath).catch(() => {});
      }

      await deleteMaterialRepo(
        courseId,
        lecture.lectureOrder,
        material.materialOrder
      );
    }

    await deleteLectureRepo(courseId, lecture.lectureId);
  }

  await deleteCourseRepo(courseId);
};

/* =========================
   LECTURES
========================= */

export const getLecturesByCourseId = async (courseId) => {
  return getLecturesByCourseIdRepo(courseId);
};

export const createLecture = async ({ courseId, ...payload }) => {
  return createLectureRepo({ courseId, ...payload });
};

export const updateLecture = async (courseId, lectureId, updates) => {
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error("No update fields provided");
  }
  return updateLectureRepo(courseId, lectureId, updates);
};

export const deleteLecture = async (courseId, lectureId) => {
  const lectures = await getLecturesByCourseIdRepo(courseId);
  const lecture = lectures.find((l) => l.lectureId === lectureId);

  if (!lecture) {
    const err = new Error("Lecture not found");
    err.statusCode = 404;
    throw err;
  }

  const materials = await getMaterialsByLectureOrder(
    courseId,
    lecture.lectureOrder
  );

  for (const material of materials) {
    if (material.storageType === "S3" && material.s3Key) {
      await deleteFromS3(material.s3Key);
    }

    await deleteMaterialRepo(
      courseId,
      lecture.lectureOrder,
      material.materialOrder
    );
  }
  await deleteLectureRepo(courseId, lecture.lectureId);
};

/* =========================
   MATERIALS
========================= */

export const getMaterialTypeFromMime = (mimeType) => {
  if (!mimeType) {
    throw new Error("mimeType is required to determine material type");
  }
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("video/")) return "VIDEO";
  throw new Error(`Unsupported file type: ${mimeType}`);
};

export const getMaterialsByLectureId = async ({ courseId, lectureId }) => {
  const lectures = await getLecturesByCourseIdRepo(courseId);
  const lecture = lectures.find((l) => l.lectureId === lectureId);

  if (!lecture) {
    const err = new Error("Lecture not found");
    err.statusCode = 404;
    throw err;
  }

  return getMaterialsByLectureOrder(courseId, lecture.lectureOrder);
};



export const createMaterialService = async ({
  courseId,
  lectureId,
  body,
  file,
  meta,
}) => {
  const lectures = await getLecturesByCourseIdRepo(courseId);
  const lecture = lectures.find((l) => l.lectureId === lectureId);

  if (!lecture) {
    const err = new Error("Lecture not found");
    err.statusCode = 404;
    throw err;
  }

  const materialType = getMaterialTypeFromMime(file.mimetype);


  return createMaterialRepo({
    courseId,
    lectureOrder: lecture.lectureOrder,

    materialId: meta.materialId,

    title: body.title,
    originalFileName: file.originalname,
    displayFileName: body.title,

    storageType: "S3",
    s3Key: meta.s3Key,

    filePath: null,
    materialType,
    mimeType: file.mimetype,
    size: meta.size,
  });
};

export const updateMaterial = async ({
  courseId,
  lectureId,
  materialId,
  body,
  file,
}) => {
  // 1️ Find lecture
  const lectures = await getLecturesByCourseIdRepo(courseId);
  const lecture = lectures.find((l) => l.lectureId === lectureId);

  if (!lecture) {
    const err = new Error("Lecture not found");
    err.statusCode = 404;
    throw err;
  }

  // 2️ Find material by ID (NOT order)
  const materials = await getMaterialsByLectureOrder(
    courseId,
    lecture.lectureOrder
  );


  const material = materials.find(
    (m) => String(m.materialId).trim() === String(materialId).trim()
  );

  if (!material) {
    const err = new Error("Material not found");
    err.statusCode = 404;
    throw err;
  }

  let fileUpdates = {};

  // 3️ If replacing file → overwrite SAME S3 key
  if (file) {
    const ext =
      path.extname(file.originalname) ||
      (file.mimetype === "application/pdf" ? ".pdf" : "");

    await uploadToS3({
      file,
      courseId,
      lectureId,
      materialId, // SAME identity → same S3 key
    });

    fileUpdates = {
      mimeType: file.mimetype,
      materialType: getMaterialTypeFromMime(file.mimetype),
      originalFileName: file.originalname,
      displayFileName: body.title
        ? `${body.title}${ext}`
        : material.displayFileName,
    };
  }

  // 4️ Metadata-only updates
  const updates = {
    ...(body.title && { title: body.title }),
    ...(body.isPreview !== undefined && {
      isPreview: body.isPreview === "true",
    }),
    ...(body.duration && { duration: Number(body.duration) }),
    ...fileUpdates,
  };

  if (Object.keys(updates).length === 0) {
    const err = new Error("No valid fields to update");
    err.statusCode = 400;
    throw err;
  }

  // 5️ Persist (order stays unchanged)
  return updateMaterialRepo(
    courseId,
    lecture.lectureOrder,
    material.materialOrder,
    updates
  );
};

export const deleteMaterial = async ({ courseId, lectureId, materialId }) => {
  // 1️ Find lecture
  const lectures = await getLecturesByCourseIdRepo(courseId);
  const lecture = lectures.find((l) => l.lectureId === lectureId);

  if (!lecture) {
    const err = new Error("Lecture not found");
    err.statusCode = 404;
    throw err;
  }

  // 2️ Find material by ID
  const materials = await getMaterialsByLectureOrder(
    courseId,
    lecture.lectureOrder
  );

  const material = materials.find(
    (m) => String(m.materialId).trim() === String(materialId).trim()
  );

  if (!material) {
    const err = new Error("Material not found");
    err.statusCode = 404;
    throw err;
  }

  // 3️ Delete S3 object (if stored in S3)
  if (material.storageType === "S3" && material.s3Key) {
    await deleteFromS3(material.s3Key);
  }

  // 4️ Delete DB record LAST
  await deleteMaterialRepo(
    courseId,
    lecture.lectureOrder,
    material.materialOrder
  );
};
