import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { authMiddleware } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { processReceipt } from "../services/receipt.service.js";
import { config } from "../config.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/upload",
  upload.single("receipt"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    try {
      const result = await processReceipt(req.file.path, req.file.mimetype);
      res.json(result);
    } catch (error) {
      console.error("Receipt processing error:", error);
      res
        .status(500)
        .json({ error: "Failed to process receipt. Please try again." });
    }
  }
);

router.get("/file", (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const filePath = req.query.path as string | undefined;

  if (!filePath) {
    res.status(400).json({ error: "Missing path parameter" });
    return;
  }

  // Resolve the full path and ensure it stays within uploadsDir
  const resolved = path.resolve(config.uploadsDir, filePath);
  const uploadsDir = path.resolve(config.uploadsDir);

  if (!resolved.startsWith(uploadsDir + path.sep)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  // Enforce that the first path segment matches the requesting user's id
  const relative = path.relative(uploadsDir, resolved);
  const firstSegment = relative.split(path.sep)[0];
  if (firstSegment !== String(userId)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (!fs.existsSync(resolved)) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.sendFile(resolved);
});

export default router;
