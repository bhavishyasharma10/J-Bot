import Database from "@/config/database";
import logger from "@/config/logger";
import { ParsedIntent, TodoListCommand } from "@/lib/types";
import JournalService from "./journalService";
import LLMService from "./llmService";
import HabitService from "./habitService";
import MoodService from "./moodService";
import BudgetService from "./budgetService";
import env from "@/config/env";

class IntentService {
    private static handlers: Map<string, (userId: string, content: string) => Promise<string>> = new Map();
    private static isLLMEnabled: boolean = false;

    private static get sequelize() {
        return Database.getInstance().getSequelize();
    }

    static async initialize() {
        // Initialize LLM service if API key is available
        try {
            if (env.GEMINI_API_KEY) {
                LLMService.initialize();
                this.isLLMEnabled = true;
                logger.info('Gemini LLM service initialized successfully');
            } else {
                logger.warn('GEMINI_API_KEY not found, falling back to pattern matching');
            }
        } catch (error) {
            logger.error('Failed to initialize Gemini LLM service:', error);
        }

        // Register all available handlers
        this.registerHandler('highlight', async (userId, content) => {
            await JournalService.saveHighlight(userId, content);
            return "✅ Highlight saved!";
        });

        this.registerHandler('thought', async (userId, content) => {
            await JournalService.saveThought(userId, content);
            return "💡 Thought of the day saved!";
        });

        this.registerHandler('idea', async (userId, content) => {
            await JournalService.saveIdea(userId, content);
            return "🚀 Idea of the day saved!";
        });

        this.registerHandler('affirmation', async (userId, content) => {
            await JournalService.saveAffirmation(userId, content);
            return "✨ Daily affirmation saved!";
        });

        this.registerHandler('gratitude', async (userId, content) => {
            await JournalService.saveGratitude(userId, content);
            return "🙏 Gratitude entry saved!";
        });

        this.registerHandler('reflection', async (userId, content) => {
            await JournalService.saveReflection(userId, content);
            return "🤔 Daily reflection saved!";
        });

        this.registerHandler('todo', async (userId, content) => {
            const todoCommand = this.parseTodoCommand(content);
            return await JournalService.handleTodoCommand(userId, todoCommand);
        });

        this.registerHandler('habit', async (userId, content) => {
            return await HabitService.handleHabitCommand(userId, content);
        });

        this.registerHandler('mood', async (userId, content) => {
            return await MoodService.handleMoodCommand(userId, content);
        });

        this.registerHandler('expense', async (userId, content) => {
            return await BudgetService.handleExpenseCommand(userId, content);
        });

        this.registerHandler('income', async (userId, content) => {
            return await BudgetService.handleIncomeCommand(userId, content);
        });

        this.registerHandler('budget_goal', async (userId, content) => {
            return await BudgetService.handleBudgetGoalCommand(userId, content);
        });
    }

    private static parseTodoCommand(content: string): TodoListCommand {
        const parts = content.trim().split(" ");
        if (parts.length < 2) {
            throw new Error("Invalid todo command format");
        }

        const category = parts[0].toLowerCase() as 'work' | 'family' | 'self_care';
        const action = parts[1].toLowerCase() as 'add' | 'complete' | 'list';
        const todoContent = parts.slice(2).join(" ");

        if (!['work', 'family', 'self_care'].includes(category)) {
            throw new Error("Invalid category. Use: work, family, or self_care");
        }

        if (!['add', 'complete', 'list'].includes(action)) {
            throw new Error("Invalid action. Use: add, complete, or list");
        }

        return {
            category,
            action,
            content: action === 'add' ? todoContent : undefined
        };
    }

    static registerHandler(name: string, handler: (userId: string, content: string) => Promise<string>) {
        this.handlers.set(name, handler);
    }

    static async parseMessage(message: string): Promise<ParsedIntent> {
        try {
            if (this.isLLMEnabled) {
                // Use LLM for message processing
                const llmResult = await LLMService.processMessage(message);
                
                // Map LLM intent to our system's intent format
                return {
                    intent: this.mapLLMIntent(llmResult.intent),
                    category: llmResult.category || llmResult.intent,
                    content: llmResult.text_summary,
                    confidence: 1.0
                };
            } else {
                // Fallback to pattern matching
                return await this.parseMessageWithPatterns(message);
            }
        } catch (error) {
            logger.error('Error parsing message:', error);
            // Fallback to pattern matching if LLM fails
            return await this.parseMessageWithPatterns(message);
        }
    }

    private static async parseMessageWithPatterns(message: string): Promise<ParsedIntent> {
        const messageLower = message.toLowerCase();
        
        // Get all active intents and their patterns from the database
        const [patterns] = await this.sequelize.query(`
            SELECT i.name AS intent_name, i.category AS intent_category, ip.pattern AS intent_pattern
            FROM intents i
            INNER JOIN intent_patterns ip ON i.id = ip.intent_id
            WHERE i.is_active = TRUE
        `);

        // Find the best matching pattern
        let bestMatch = {
            intent: 'unknown',
            category: 'unknown',
            content: message,
            confidence: 0.0
        };

        for (const pattern of patterns as Array<{ intent_name: string; intent_category: string; intent_pattern: string }>) {
            if (messageLower.includes(pattern.intent_pattern)) {
                const content = messageLower.replace(pattern.intent_pattern, '').trim();
                bestMatch = {
                    intent: pattern.intent_name,
                    category: pattern.intent_category,
                    content: content,
                    confidence: 1.0
                };
                break;
            }
        }

        return bestMatch;
    }

    private static mapLLMIntent(llmIntent: string): string {
        // Map LLM intents to our system's intent names
        const intentMap: Record<string, string> = {
            'daily_affirmation': 'affirmation',
            'highlight_of_the_day': 'highlight',
            'todo': 'todo',
            'gratitude': 'gratitude',
            'thought': 'thought',
            'idea': 'idea',
            'reflection': 'reflection',
            'habit': 'habit',
            'mood': 'mood',
            'expense': 'expense',
            'income': 'income',
            'budget_goal': 'budget_goal'
        };

        return intentMap[llmIntent] || llmIntent;
    }

    static async executeIntent(userId: string, parsedIntent: ParsedIntent): Promise<string> {
        const handler = this.handlers.get(parsedIntent.intent);
        
        if (!handler) {
            return "🤖 I'm not sure how to help with that. Available commands:\n" +
                   "• Save a highlight\n" +
                   "• Save a thought\n" +
                   "• Save an idea\n" +
                   "• Save an affirmation\n" +
                   "• Save gratitude\n" +
                   "• Save reflection\n" +
                   "• Add todo (work/family/self_care)";
        }

        try {
            return await handler(userId, parsedIntent.content);
        } catch (error) {
            logger.error(`Error executing intent ${parsedIntent.intent}:`, error);
            return "❌ Sorry, I encountered an error while processing your request.";
        }
    }

    static async processCommand(userId: string, content: string): Promise<string> {
        const parsedIntent = await this.parseMessage(content);
        return await this.executeIntent(userId, parsedIntent);
    }
}

export default IntentService; 