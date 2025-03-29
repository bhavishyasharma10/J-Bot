import { OpenAI } from "openai";
import logger from "@/config/logger";
import { AIResponse } from "../types/AiPrompt";
import { buildPrompt } from "../utils/prompt";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export class OpenAIService {
    static async processMessage(message: string): Promise<AIResponse> {
        try {
            // Step 1: Build the structured prompt
            const prompt = buildPrompt(message);

            // Step 2: Call OpenAI API
            const response = await openai.completions.create({
                model: "gpt-4o",
                prompt,
                max_tokens: 300,
                temperature: 0.3,
            });

            // Step 3: Parse AI response
            const rawOutput = response.choices[0]?.text?.trim() || "{}";

            // Step 4: Ensure valid JSON format
            const aiOutput: AIResponse = JSON.parse(rawOutput);

            // Step 4: Validate and return

            return aiOutput;
        } catch (error) {
            logger.error("❌ OpenAI processing failed:", error);
            throw new Error("OpenAI processing failed. Please try again later.");
        }
    }
}
