import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  jwtSecret: process.env.JWT_SECRET || "change-me-to-a-random-string",
  jwtExpiresIn: "30d",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  aiProvider: process.env.AI_PROVIDER || "openai",
  databasePath: process.env.DATABASE_PATH || "./data/medical-expenses.db",
  maxFileSize: 10 * 1024 * 1024, // 10MB
};
