import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from "@/config/logger";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

class LLMService {
    private static genAI: GoogleGenerativeAI;
    private static model: any;
    private static readonly SYSTEM_PROMPT = `You are a structured AI assistant that extracts intent-based data from user messages.

Users follow a command format:
- "Save [intent] for [date]: [text]"
- "Track [intent] [details]"
- "Add [intent] [details]"

Recognized intents:
- daily_affirmation
- highlight_of_the_day
- todo (requires category: work, family, or self-care)
- gratitude
- thought
- idea
- reflection
- habit (requires category: health, productivity, learning, lifestyle)
- mood (requires score: 1-5, optional: energy_level, stress_level)
- expense (requires amount, category, optional: payment_method)
- income (requires amount, category)
- budget_goal (requires target_amount, category, start_date, end_date)

Extract the following details:
- intent: The type of entry
- date: Convert to ISO format (default to today if missing)
- text_summary: Shortened form of the text
- original_text: Exact message
- category: For todo/habit/expense/income items
- action: For todo items (add, complete, or list)
- amount: For expense/income items
- payment_method: For expense items (cash, card, upi, bank_transfer, other)
- mood_score: For mood entries (1-5)
- energy_level: For mood entries (1-5)
- stress_level: For mood entries (1-5)
- factors: For mood entries (JSON array of factors)
- target_amount: For budget goals
- start_date: For budget goals
- end_date: For budget goals

Example Inputs & Outputs:

Input 1:
"Save daily affirmation for March 28: I am strong & proud."
Output:
{
  "intent": "daily_affirmation",
  "text_summary": "I am strong & proud.",
  "original_text": "Save daily affirmation for March 28: I am strong & proud.",
  "date": "2025-03-28"
}

Input 2:
"Add face mask to my self-care tasks for today"
Output:
{
  "intent": "todo",
  "text_summary": "face mask",
  "original_text": "Add face mask to my self-care tasks for today",
  "date": "2024-03-28",
  "category": "self_care",
  "action": "add"
}

Input 3:
"Track my mood today - feeling great (5/5), high energy (4/5), low stress (2/5)"
Output:
{
  "intent": "mood",
  "text_summary": "feeling great, high energy, low stress",
  "original_text": "Track my mood today - feeling great (5/5), high energy (4/5), low stress (2/5)",
  "date": "2024-03-28",
  "mood_score": 5,
  "energy_level": 4,
  "stress_level": 2
}

Input 4:
"Spent $50 on groceries using card"
Output:
{
  "intent": "expense",
  "text_summary": "groceries",
  "original_text": "Spent $50 on groceries using card",
  "date": "2024-03-28",
  "amount": 50.00,
  "category": "groceries",
  "payment_method": "card"
}`;

    static initialize() {
        if (!GOOGLE_API_KEY) {
            throw new Error('GOOGLE_API_KEY is not set in environment variables');
        }
        this.genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    static async processMessage(message: string): Promise<{
        intent: string;
        text_summary: string;
        original_text: string;
        date: string;
        category?: string;
        action?: string;
    }> {
        try {
            const prompt = `${this.SYSTEM_PROMPT}\n\nUser message: ${message}`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const parsedResponse = JSON.parse(jsonMatch[0]);
            return parsedResponse;
        } catch (error) {
            logger.error('Error processing message with Gemini:', error);
            throw error;
        }
    }
}

export default LLMService; 