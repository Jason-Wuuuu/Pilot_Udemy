import multer from "multer";
import path from "path";
import fs from "fs";

const BASE_DOCUMENT_DIR = path.join(process.cwd(), "documents");

// Ensure base dir exists
if (!fs.existsSync(BASE_DOCUMENT_DIR)) {
  fs.mkdirSync(BASE_DOCUMENT_DIR, { recursive: true });
}

// Storage config

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const { courseId, lectureId } = req.params;

      if (!courseId || !lectureId) {
        return cb(new Error("courseId and lectureId are required"));
      }

      const materialDir = path.join(
        BASE_DOCUMENT_DIR,
        courseId.trim(),
        lectureId.trim()
      );

      // idempotent + safe
      fs.mkdirSync(materialDir, { recursive: true });

      cb(null, materialDir);
    } catch (err) {
      cb(err);
    }
  },

  filename: (req, file, cb) => {
    try {

      const { materialOrder } = req;

      if (materialOrder === undefined || materialOrder === null) {
        return cb(new Error("materialOrder not found on request"));
      }

      // preserve original filename (sanitized)
      const originalName = file.originalname;
      const ext = path.extname(originalName);

      const baseName = path
        .basename(originalName, ext)
        .replace(/[^\w.-]+/g, "_"); // sanitize

      const finalName = `${materialOrder}__${baseName}${ext}`;

      cb(null, finalName);
    } catch (err) {
      cb(err);
    }
  },
});

// File filter: PDF + VIDEO
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "video/mp4",
    "video/quicktime"
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF or video files are allowed"),
      false
    );
  }
};

const uploadMaterial = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 200 // 200MB (safe for video dev)
  }
});

export default uploadMaterial;
