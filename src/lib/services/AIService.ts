import logger from '@/config/logger';
import { RuleBasedParserService } from './RuleBasedParserService';
import { GeminiService } from "./GeminiService";

export class AIService {
    static async processMessage(message: string): Promise<any> {
        try {
            // Step 2: Use Gemini as fallback
            const geminiResponse = await GeminiService.processMessage(message);
            return geminiResponse;
        } catch (geminiError) {
            logger.error("❌ Gemini processing also failed, falling back to rule-based parser:", geminiError);

            // Step 3: Use rule-based parser as final fallback
            return RuleBasedParserService.parseMessage(message);
        }
    }
}
