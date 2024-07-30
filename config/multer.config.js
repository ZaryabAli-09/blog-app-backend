// multerConfig.js
import multer from "multer";
import path from "path";

// Define the maximum file size (1.5MB)
const MAX_FILE_SIZE = 1.5 * 1024 * 1024;

// Define allowed file types
const ALLOWED_FILE_TYPES = /jpeg|jpg|png/;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Save files to 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Ensure the file name has the techscroll_ prefix and proper extension
    cb(null, `techscroll_${Date.now()}_${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Check file type
  const extname = ALLOWED_FILE_TYPES.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = ALLOWED_FILE_TYPES.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error("Only JPEG and PNG images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export { upload };
