import express from "express";
import * as courseController from "../controllers/courseControllers.js";
import uploadMaterial from "../middleware/materialUpload.js";
import { attachMaterialMeta } from "../middleware/attachMaterialMeta.js";
const router = express.Router();

/* =========================
   COURSE (Authenticated)
========================= */

// GET ALL COURSES
router.get("/", courseController.getAllCoursesHandler);

// GET COURSE BY CATEGORY
router.get("/categories/:categoryId", courseController.getCoursesByCategory);

// GET COURSE BY ID
router.get("/:courseId", courseController.getCourse);

/* =========================
   COURSE (ADMIN only)
========================= */

// CREATE A NEW COURSE
router.post("/", courseController.createCourseHandler);

// UPDATE A COURSE
router.put("/:courseId", courseController.updateCourseHandler);
// DELETE A COURSE
router.delete("/:courseId", courseController.deleteCourseHandler);

// REGISTER A STUDENT INTO A COURSE
router.post("/:courseId/students", courseController.registerStudentHandler);
// DELETE A STUDENT FROM A COURSE
router.delete("/:courseId/students", courseController.deleteStudentHandler);
// Get all students from a course
router.get("/:courseId/students", courseController.getCourseStudentsHandler);
// routes/course.routes.js
router.post(
  "/:courseId/students/by-email",
  courseController.registerStudentsByEmailHandler
);

/* =========================
   LECTURES
========================= */

// STUDENT + ADMIN
router.get("/:courseId/lectures", courseController.getLectures);

// ADMIN
router.post("/:courseId/lectures", courseController.createLectureHandler);

router.put(
  "/:courseId/lectures/:lectureId",

  courseController.updateLectureHandler
);

router.delete(
  "/:courseId/lectures/:lectureId",

  courseController.deleteLectureHandler
);

/* =========================
   MATERIALS
========================= */

// STUDENT + ADMIN
router.get(
  "/:courseId/lectures/:lectureId/materials",

  courseController.getMaterials
);

router.post(
  "/:courseId/lectures/:lectureId/materials",

  uploadMaterial.single("file"),
  attachMaterialMeta,
  courseController.createMaterialHandler
);

router.put(
  "/:courseId/lectures/:lectureId/materials/:materialId",

  uploadMaterial.single("file"),
  attachMaterialMeta,
  courseController.updateMaterialHandler
);

router.delete(
  "/:courseId/lectures/:lectureId/materials/:materialId",

  courseController.deleteMaterialHandler
);

export default router;
