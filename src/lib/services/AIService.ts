import logger from '@/config/logger';
import { RuleBasedParserService } from './RuleBasedParserService';
import { OpenAIService } from './OpenAIService';

export class AIService {
    static async processMessage(message: string): Promise<any> {
        try {
            // Step 1: Use OpenAI for message processing
            const aiResponse = await OpenAIService.processMessage(message);
            
            // Validate AI response
            if (AIService.isValidResponse(aiResponse)) {
                return aiResponse;
            } else {
                throw new Error('Invalid AI response format');
            }
        } catch (error) {
            logger.error("❌ OpenAI processing failed, falling back to rule-based parser:", error);
            
            // Step 2: Use rule-based parser as fallback
            return RuleBasedParserService.parseMessage(message);
        }
    }

    static isValidResponse(response: any): boolean {
        return response && response.actions && Array.isArray(response.actions);
    }
}
