import multer from "multer";
import path from "path";
import fs from "fs";

const TEMP_UPLOAD_DIR = path.join(process.cwd(), "tmp");

if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
  fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}
const sanitizeFilename = (name) => {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const safeBase = sanitizeFilename(baseName);

    cb(null, `${safeBase}${ext}`);
  },
});



const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "video/mp4",
    "video/quicktime",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF or video files are allowed"), false);
  }
};

const uploadMaterial = multer({
  storage,
  fileFilter,
  limits: {
    // 2GB limit (aligned with our earlier decision)
    fileSize: 1024 * 1024 * 1024 * 2,
  },
});

export default uploadMaterial;
