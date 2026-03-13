import { AIProvider } from "./provider.interface.js";
import { OpenAIProvider } from "./openai.provider.js";
import { config } from "../config.js";

export function createAIProvider(): AIProvider {
  switch (config.aiProvider) {
    case "openai":
      if (!config.openaiApiKey) {
        throw new Error("OPENAI_API_KEY is required when using OpenAI provider");
      }
      return new OpenAIProvider(config.openaiApiKey);
    default:
      throw new Error(`Unknown AI provider: ${config.aiProvider}`);
  }
}
