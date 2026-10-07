import fs from "fs";
import path from "path";
import sharp from "sharp";
import heicConvert from "heic-convert";
import { createAIProvider } from "../ai/provider.factory.js";
import type { ExtractedReceiptData } from "../ai/provider.interface.js";
import { config } from "../config.js";

function isHeic(filePath: string, mimeType: string): boolean {
  return (
    ["image/heic", "image/heif"].includes(mimeType) ||
    [".heic", ".heif"].includes(path.extname(filePath).toLowerCase())
  );
}

export async function processReceipt(filePath: string, mimeType: string) {
  let extractionWarning: string | undefined;
  let extracted: ExtractedReceiptData = {
    paid_date: null,
    paid_amount: null,
    description: null,
    confidence: 0,
  };

  // Store PDFs directly; the image scanner cannot accept a PDF as image_url.
  if (
    mimeType === "application/pdf" ||
    path.extname(filePath).toLowerCase() === ".pdf"
  ) {
    extractionWarning = "PDF attached. Enter the expense details manually.";
  } else {
    try {
      let source: Buffer | string = filePath;
      if (isHeic(filePath, mimeType)) {
        const converted = await heicConvert({
          buffer: new Uint8Array(
            fs.readFileSync(filePath),
          ) as unknown as ArrayBuffer,
          format: "JPEG",
          quality: 0.9,
        });
        source = Buffer.from(converted);
      }
      // Normalize the scan copy, including files with empty browser MIME types.
      // Keep the original file intact for viewing and downloading.
      const buffer = await sharp(source)
        .rotate()
        .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();
      extracted = await createAIProvider().extractReceiptData(
        buffer,
        "image/jpeg",
      );
    } catch {
      extractionWarning =
        "Receipt attached, but automatic scanning was unavailable. Enter the details manually.";
    }
  }

  return {
    receiptPath: path.relative(config.uploadsDir, filePath),
    extracted,
    extractionWarning,
  };
}
