import OpenAI from "openai";
import { AIProvider, ExtractedReceiptData } from "./provider.interface.js";
import { RECEIPT_EXTRACTION_PROMPT } from "./prompts.js";

export class OpenAIProvider implements AIProvider {
  name = "openai";
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async extractReceiptData(
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<ExtractedReceiptData> {
    const base64Image = fileBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: RECEIPT_EXTRACTION_PROMPT },
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "high" },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        paid_date: null,
        paid_amount: null,
        description: null,
        confidence: 0,
      };
    }

    try {
      const parsed = JSON.parse(content) as ExtractedReceiptData;
      return {
        paid_date: parsed.paid_date || null,
        paid_amount:
          typeof parsed.paid_amount === "number" ? parsed.paid_amount : null,
        description: parsed.description || null,
        confidence:
          typeof parsed.confidence === "number" ? parsed.confidence : 0,
      };
    } catch {
      return {
        paid_date: null,
        paid_amount: null,
        description: null,
        confidence: 0,
      };
    }
  }
}
