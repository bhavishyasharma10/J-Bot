import { OpenAI } from "openai";
import logger from "@/config/logger";
import { AIResponse } from "../types/AiPrompt";
import { JournalEntryType } from "../types/JournalEntry";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export class OpenAIService {
    static async processMessage(message: string): Promise<AIResponse> {
        try {
            // Step 1: Build the structured prompt
            const prompt = OpenAIService.buildPrompt(message);

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
            if (!aiOutput.actions || !Array.isArray(aiOutput.actions)) {
                logger.warn("⚠️ Invalid AI response, falling back to rule-based parsing.");
                return OpenAIService.fallbackParser(message);
            }

            return aiOutput;
        } catch (error) {
            logger.error("❌ OpenAI processing failed:", error);
            return OpenAIService.fallbackParser(message);
        }
    }

    // Helper function: Embed TypeScript Interfaces in the prompt
    private static buildPrompt(message: string): string {
        return `
            You are an AI that extracts structured data from user messages.
            Your task is to return ONLY valid JSON in the following format, without additional text or explanations.

            ---
            JSON SCHEMA:
            {
                "actions": [
                    {
                        "type": "journal",
                        "data": {
                            "type": "thought",
                            "content": "Had a deep discussion about AI ethics",
                            "tags": ["AI", "ethics"]
                        }
                    },
                    {
                        "type": "task",
                        "data": {
                            "category": "work",
                            "content": "Finish the AI documentation",
                            "status": "pending"
                        }
                    },
                    {
                        "type": "reminder",
                        "data": {
                            "text": "Doctor's appointment tomorrow at 3 PM",
                            "time": "2023-10-01T15:00:00Z"
                        }
                    }
                ]
            }
            ---

            You MUST return JSON formatted exactly as per this schema.

            Now, parse the following message into an AIResponse object:

            Message: "${message}"

            Respond with JSON only:
        `;
    }

    // Fallback rule-based parser
    private static fallbackParser(message: string): AIResponse {
        const actions: AIResponse["actions"] = [];

        if (message.toLowerCase().includes("remind me")) {
            actions.push({ type: "reminder", data: { text: message, time: new Date().toISOString() } });
        } else if (message.toLowerCase().startsWith("note:")) {
            actions.push({ type: "journal", data: { type: JournalEntryType.THOUGHT, content: message.replace("Note:", "").trim(), tags: [] } });
        }

        return { actions };
    }
}
