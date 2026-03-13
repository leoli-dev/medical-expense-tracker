import { apiFetch } from "./client";
import type { ReceiptUploadResponse } from "../types";

export async function uploadReceiptAPI(
  file: File
): Promise<ReceiptUploadResponse> {
  const formData = new FormData();
  formData.append("receipt", file);

  return apiFetch<ReceiptUploadResponse>("/api/receipts/upload", {
    method: "POST",
    body: formData,
  });
}
