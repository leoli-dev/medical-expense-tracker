import multer from "multer";
import path from "path";
import fs from "fs";
import { config } from "../config.js";
import { Request } from "express";

const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf",
];

const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    const userId = req.user?.userId || "unknown";
    const dir = path.join(config.uploadsDir, String(userId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
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
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, HEIC, and PDF files are allowed"));
    }
  },
});
