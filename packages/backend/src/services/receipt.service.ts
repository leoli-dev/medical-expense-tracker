import fs from "fs";
import path from "path";
import sharp from "sharp";
import { createAIProvider } from "../ai/provider.factory.js";
import { config } from "../config.js";

export async function processReceipt(filePath: string, mimeType: string) {
  let buffer: Buffer;
  let processedMimeType = mimeType;

  if (mimeType === "application/pdf") {
    // For PDF, read the raw buffer - the AI provider can handle it
    // In the future, we could convert PDF pages to images
    buffer = fs.readFileSync(filePath);
  } else {
    // For images, resize to reduce API cost
    buffer = await sharp(filePath)
      .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
      .toBuffer();
    processedMimeType = mimeType;
  }

  const provider = createAIProvider();
  const extracted = await provider.extractReceiptData(buffer, processedMimeType);

  // Return relative path for storage
  const relativePath = path.relative(config.uploadsDir, filePath);

  return {
    receiptPath: relativePath,
    extracted,
  };
}
