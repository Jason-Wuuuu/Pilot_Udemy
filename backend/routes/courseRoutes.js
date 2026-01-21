import express from "express";
import * as courseController from "../controllers/courseControllers.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { roleVerification } from "../middleware/roleVerification.js";

import uploadMaterial from "../middleware/materialUpload.js";
import { attachMaterialMeta } from "../middleware/attachMaterialMeta.js";

import { devBypassAuth } from "../middleware/devBypassAuth.js";

const router = express.Router();

/* =========================
   COURSE (Authenticated)
========================= */

// GET COURSE BY CATEGORY
router.get(
  "/categories/:categoryId",
  // authenticate,
  devBypassAuth,
  courseController.getCoursesByCategory
);

// GET COURSE BY ID
router.get(
  "/:courseId",
  // authenticate,
  devBypassAuth,
  courseController.getCourse
);



/* =========================
   COURSE (ADMIN only)
========================= */

// CREATE A NEW COURSE
router.post(
  "/",
  // authenticate,
  // roleVerification("ADMIN"),
  devBypassAuth,
  courseController.createCourseHandler
);

router.put(
  "/:courseId",
  // authenticate,
  // roleVerification("ADMIN"),
  devBypassAuth,
  courseController.updateCourseHandler
);

router.delete(
  "/:courseId",
  // authenticate,
  // roleVerification("ADMIN"),
  devBypassAuth,
  courseController.deleteCourseHandler
);

/* =========================
   LECTURES
========================= */

// STUDENT + ADMIN
router.get(
  "/:courseId/lectures",
  // authenticate,
  devBypassAuth,
  courseController.getLectures
);

// ADMIN
router.post(
  "/:courseId/lectures",
  // authenticate,
  // roleVerification("ADMIN"),
  devBypassAuth,
  courseController.createLectureHandler
);

router.put(
  "/:courseId/lectures/:lectureId",
  // authenticate,
  // roleVerification("ADMIN"),
  devBypassAuth,
  courseController.updateLectureHandler
);

router.delete(
  "/:courseId/lectures/:lectureId",
  // authenticate,
  // roleVerification("ADMIN"),
  devBypassAuth,
  courseController.deleteLectureHandler
);

/* =========================
   MATERIALS
========================= */

// STUDENT + ADMIN
router.get(
  "/:courseId/lectures/:lectureId/materials",
  // authenticate,
  devBypassAuth,
  courseController.getMaterials
);

// ADMIN
// router.post(
//   "/:courseId/lectures/:lectureId/materials",
//   authenticate,
//   roleVerification("ADMIN"),
//   uploadMaterial.single("file"),
//   attachMaterialMeta,
//   courseController.createMaterialHandler
// );

router.post(
  "/:courseId/lectures/:lectureId/materials",
  devBypassAuth,
  uploadMaterial.single("file"),
  attachMaterialMeta,
  courseController.createMaterialHandler
);

router.put(
  "/:courseId/lectures/:lectureId/materials/:materialId",
  // authenticate,
  // roleVerification("ADMIN"),
  devBypassAuth,
  uploadMaterial.single("file"),
  attachMaterialMeta,
  courseController.updateMaterialHandler
);

router.delete(
  "/:courseId/lectures/:lectureId/materials/:materialId",
  // authenticate,
  // roleVerification("ADMIN"),
  devBypassAuth,
  courseController.deleteMaterialHandler
);

export default router;
