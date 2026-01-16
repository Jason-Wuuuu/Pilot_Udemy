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
  getMaterialsByLectureId,
  createMaterialItem,
  updateMaterialItem,
  deleteMaterialItem
} from "../services/course.service.js";

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
        error: "Course not found"
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
      data: courses
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
      status: "DRAFT"
    });

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (err) {
    next(err);
  }
};

// PUT /courses/:courseId
export const updateCourse = async (req, res, next) => {
  try {
    const updated = await updateCourseItem(
      req.params.courseId,
      req.body
    );

    res.json({
      success: true,
      data: updated
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
      message: "Course and all related content deleted"
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
      data: lectures
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
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: lecture
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
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /courses/:courseId/lectures/:lectureId
export const deleteLecture = async (req, res, next) => {
  try {
    await deleteLectureItem(
      req.params.courseId,
      req.params.lectureId
    );

    res.json({
      success: true,
      message: "Lecture deleted"
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   MATERIALS
========================= */

// GET /courses/:courseId/lectures/:lectureId/materials
export const getMaterials = async (req, res, next) => {
  try {
    const materials = await getMaterialsByLectureId(
      req.params.courseId,
      req.params.lectureId
    );

    res.json({
      success: true,
      data: materials
    });
  } catch (err) {
    next(err);
  }
};

// POST /courses/:courseId/lectures/:lectureId/materials
export const createMaterial = async (req, res, next) => {
  try {
    const material = await createMaterialItem({
      courseId: req.params.courseId,
      lectureId: req.params.lectureId,
      ...req.body
    });

    res.status(201).json({
      success: true,
      data: material
    });
  } catch (err) {
    next(err);
  }
};

// PUT /courses/:courseId/lectures/:lectureId/materials/:materialId
export const updateMaterial = async (req, res, next) => {
  try {
    const updated = await updateMaterialItem(
      req.params.courseId,
      req.params.lectureId,
      req.params.materialId,
      req.body
    );

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /courses/:courseId/lectures/:lectureId/materials/:materialId
export const deleteMaterial = async (req, res, next) => {
  try {
    await deleteMaterialItem(
      req.params.courseId,
      req.params.lectureId,
      req.params.materialId
    );

    res.json({
      success: true,
      message: "Material deleted"
    });
  } catch (err) {
    next(err);
  }
};
