import multer from "multer";
import path from "path";
import os from "os";
import { config } from "../config.js";

const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf",
];

const HEIC_EXTENSIONS = [".heic", ".heif"];

function isAllowed(file: Express.Multer.File): boolean {
  if (ALLOWED_MIMES.includes(file.mimetype)) return true;
  // Browsers often report HEIC files as application/octet-stream or empty MIME
  const ext = path.extname(file.originalname).toLowerCase();
  return HEIC_EXTENSIONS.includes(ext);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: (_req, file, cb) => {
    if (isAllowed(file)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, HEIC, and PDF files are allowed"));
    }
  },
});
