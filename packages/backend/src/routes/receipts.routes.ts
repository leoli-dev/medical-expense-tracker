import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { processReceipt } from "../services/receipt.service.js";

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

export default router;
