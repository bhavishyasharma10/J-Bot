import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "@/config/logger";
import { AIResponse } from "../types/AiPrompt";
import { buildPrompt } from "../utils/prompt";

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class GeminiService {
    static async processMessage(message: string): Promise<AIResponse> {
        try {
            // Step 1: Build the structured prompt
            const prompt = buildPrompt(message);

            // Step 2: Call Google Gemini API
            const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });

            const result = await model.generateContent(prompt);
            const response = await result.response.text();

            const cleanedResponse = response.replace(/```json|```/g, "").trim();
            logger.info("Cleaned Gemini response:", cleanedResponse);
            // Step 3: Ensure valid JSON format
            const aiOutput: AIResponse = JSON.parse(cleanedResponse);

            // Step 4: Validate and return

            return aiOutput;
        } catch (error) {
            logger.error("❌ Gemini processing failed:", error);
            throw new Error("Gemini processing failed. Please try again later.");
        }
    }
}
