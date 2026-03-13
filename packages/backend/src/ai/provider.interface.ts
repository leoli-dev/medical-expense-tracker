export interface ExtractedReceiptData {
  paid_date: string | null;
  paid_amount: number | null;
  description: string | null;
  confidence: number;
}

export interface AIProvider {
  name: string;
  extractReceiptData(
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<ExtractedReceiptData>;
}
