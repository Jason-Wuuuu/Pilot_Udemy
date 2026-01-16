import express from "express";
import {
  getCourse,
  getCoursesByCategory,
  getLectures,
  getMaterials,
  createCourse,
  updateCourse,
  deleteCourse,
  createLecture,
  updateLecture,
  deleteLecture,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../controllers/courseControllers.js";

import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/adminOnly.js";

const router = express.Router();

// READ
router.get("/courses/:courseId", protect, getCourse);
router.get("/categories/:categoryId/courses", protect, getCoursesByCategory);
router.get("/courses/:courseId/lectures", protect, getLectures);
router.get(
  "/courses/:courseId/lectures/:lectureId/materials",
  protect,
  getMaterials
);

// CREATE
router.post("/courses", protect, adminOnly, createCourse);
router.post("/courses/:courseId/lectures", protect, adminOnly, createLecture);
router.post(
  "/courses/:courseId/lectures/:lectureId/materials",
  protect,
  adminOnly,
  createMaterial
);

// UPDATE
router.put("/courses/:courseId", protect, adminOnly, updateCourse);
router.put(
  "/courses/:courseId/lectures/:lectureId",
  protect,
  adminOnly,
  updateLecture
);
router.put(
  "/courses/:courseId/lectures/:lectureId/materials/:materialId",
  protect,
  adminOnly,
  updateMaterial
);

// DELETE
router.delete("/courses/:courseId", protect, adminOnly, deleteCourse);
router.delete(
  "/courses/:courseId/lectures/:lectureId",
  protect,
  adminOnly,
  deleteLecture
);
router.delete(
  "/courses/:courseId/lectures/:lectureId/materials/:materialId",
  protect,
  adminOnly,
  deleteMaterial
);

export default router;
