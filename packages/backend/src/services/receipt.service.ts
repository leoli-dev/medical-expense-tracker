import fs from "fs";
import path from "path";
import sharp from "sharp";
import heicConvert from "heic-convert";
import { createAIProvider } from "../ai/provider.factory.js";
import { config } from "../config.js";

function isHeic(filePath: string, mimeType: string): boolean {
  if (mimeType === "image/heic" || mimeType === "image/heif") return true;
  const ext = path.extname(filePath).toLowerCase();
  return ext === ".heic" || ext === ".heif";
}

export async function processReceipt(filePath: string, mimeType: string) {
  let buffer: Buffer;
  let processedMimeType = mimeType;

  if (mimeType === "application/pdf") {
    // For PDF, read the raw buffer - the AI provider can handle it
    buffer = fs.readFileSync(filePath);
  } else if (isHeic(filePath, mimeType)) {
    // Convert HEIC/HEIF to JPEG, then resize
    const heicBuffer = fs.readFileSync(filePath);
    const jpegBuffer = await heicConvert({
      buffer: new Uint8Array(heicBuffer) as unknown as ArrayBuffer,
      format: "JPEG",
      quality: 0.9,
    });
    buffer = await sharp(Buffer.from(jpegBuffer))
      .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
      .toBuffer();
    processedMimeType = "image/jpeg";
  } else {
    // For JPEG/PNG, resize to reduce API cost
    buffer = await sharp(filePath)
      .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
      .toBuffer();
  }

  const provider = createAIProvider();
  const extracted = await provider.extractReceiptData(buffer, processedMimeType);

  // Return relative path (userId/filename) for storage
  const relativePath = path.relative(config.uploadsDir, filePath);

  return {
    receiptPath: relativePath,
    extracted,
  };
}
