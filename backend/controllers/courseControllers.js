import {
  getCourseById,
  getCoursesByCategoryId,
  createCourseItem,
  updateCourseItem,
  deleteCourseCascade,
  getLecturesByCourseId,
  createLectureItem,
  updateLectureItem,
  deleteLectureItem,
  getMaterialsByLectureOrder,
  getMaterialTypeFromMime,
  createMaterialItem,
  updateMaterialItem,
  deleteMaterialItem,
} from "../services/course.service.js";
import fs from "fs/promises";

/* =========================
   COURSE
========================= */

// GET /courses/:courseId
export const getCourse = async (req, res, next) => {
  try {
    const course = await getCourseById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// GET /categories/:categoryId/courses
export const getCoursesByCategory = async (req, res, next) => {
  try {
    const courses = await getCoursesByCategoryId(req.params.categoryId);

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    next(err);
  }
};

// POST /courses
export const createCourse = async (req, res, next) => {
  try {
    const course = await createCourseItem({
      ...req.body,
      createdBy: req.user._id,
      status: "DRAFT",
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /courses/:courseId
export const updateCourse = async (req, res, next) => {
  try {
    const updated = await updateCourseItem(req.params.courseId, req.body);

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /courses/:courseId
export const deleteCourse = async (req, res, next) => {
  try {
    await deleteCourseCascade(req.params.courseId);

    res.json({
      success: true,
      message: "Course and all related content deleted",
    });
  } catch (err) {
    next(err);
  }
};

// GET /courses/:courseId/lectures
export const getLectures = async (req, res, next) => {
  try {
    const lectures = await getLecturesByCourseId(req.params.courseId);

    res.json({
      success: true,
      data: lectures,
    });
  } catch (err) {
    next(err);
  }
};

// POST /courses/:courseId/lectures
export const createLecture = async (req, res, next) => {
  try {
    const lecture = await createLectureItem({
      courseId: req.params.courseId,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: lecture,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /courses/:courseId/lectures/:lectureId
export const updateLecture = async (req, res, next) => {
  try {
    const updated = await updateLectureItem(
      req.params.courseId,
      req.params.lectureId,
      req.body
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /courses/:courseId/lectures/:lectureId
export const deleteLecture = async (req, res, next) => {
  try {
    await deleteLectureItem(req.params.courseId, req.params.lectureId);

    res.json({
      success: true,
      message: "Lecture deleted",
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   MATERIALS
========================= */

export const getMaterials = async (req, res, next) => {
  try {
    const { courseId, lectureId } = req.params;

    const lectures = await getLecturesByCourseId(courseId);
    const lecture = lectures.find((l) => l.lectureId === lectureId);

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    const materials = await getMaterialsByLectureOrder(
      courseId,
      lecture.lectureOrder
    );

    res.json({
      success: true,
      data: materials,
    });
  } catch (err) {
    next(err);
  }
};

// POST /courses/:courseId/lectures/:lectureId/materials
export const createMaterial = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const { courseId, lectureId } = req.params;
    const { title, lectureOrder } = req.body;
    const materialType = getMaterialTypeFromMime(req.file.mimetype);

    const material = await createMaterialItem({
      courseId,
      lectureId,
      lectureOrder: Number(lectureOrder),

      materialId: req.materialId,
      materialOrder: req.materialOrder,

      title,
      materialType,

      filePath: req.file.path,
      mimeType: req.file.mimetype,
    });

    res.status(201).json({
      success: true,
      data: material,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /courses/:courseId/lectures/:lectureId/materials/:materialId
export const updateMaterial = async (req, res, next) => {
  try {
    // const { courseId, lectureId, materialId } = req.params;
    const materialId = req.params.materialId.trim();
    const lectureId = req.params.lectureId.trim();
    const courseId = req.params.courseId.trim();

    const { title, isPreview, duration } = req.body;

    const lectures = await getLecturesByCourseId(courseId);
    const lecture = lectures.find((l) => l.lectureId === lectureId);


    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    const materials = await getMaterialsByLectureOrder(
      courseId,
      lecture.lectureOrder
    );



    const materialOrder = Number(req.params.materialId.trim());

    const material = materials.find((m) => m.materialOrder === materialOrder);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    let fileUpdates = {};
    if (req.file) {
      if (material.filePath) {
        await fs.unlink(material.filePath).catch(() => {});
      }

      fileUpdates = {
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        materialType: req.file.mimetype.startsWith("video/") ? "VIDEO" : "PDF",
      };
    }

    const updated = await updateMaterialItem({
      courseId,
      lectureOrder: lecture.lectureOrder,
      materialOrder,
      updates: {
        ...(title && { title }),
        ...(isPreview !== undefined && { isPreview: isPreview === "true" }),
        ...(duration && { duration: Number(duration) }),
        ...fileUpdates,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /courses/:courseId/lectures/:lectureId/materials/:materialId
export const deleteMaterial = async (req, res, next) => {
  try {
    const { courseId, lectureId, materialId } = req.params;

    const lectures = await getLecturesByCourseId(courseId);
    const lecture = lectures.find((l) => l.lectureId === lectureId);

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    const materials = await getMaterialsByLectureOrder(
      courseId,
      lecture.lectureOrder
    );

    const material = materials.find((m) => m.materialId === materialId);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    if (material.filePath) {
      await fs.unlink(material.filePath).catch(() => {
        // File may already be gone — do not block DB cleanup
      });
    }

    await deleteMaterialItem(
      courseId,
      lecture.lectureOrder,
      material.materialOrder
    );

    res.json({
      success: true,
      message: "Material deleted",
    });
  } catch (err) {
    next(err);
  }
};
