import { useState } from "react";
import { uploadReceiptAPI } from "../api/receipts.api";
import type { ReceiptUploadResponse } from "../types";

export function useReceiptUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<ReceiptUploadResponse | null> => {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadReceiptAPI(file);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
}
