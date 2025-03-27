import { Request, Response } from 'express';
import TwilioService from '../services/twilioService';
import JournalService from '../services/journalService';
import logger from '../config/logger';
import { WhatsAppMessage, TodoListCommand } from '../types';

class MessageController {
    static async handleIncomingMessage(req: Request, res: Response): Promise<void> {
        const message = (req.body as WhatsAppMessage).Body.trim().toUpperCase();
        const from = (req.body as WhatsAppMessage).From;

        try {
            if (message.startsWith("HIGHLIGHT")) {
                const highlight = message.replace("HIGHLIGHT:", "").trim();
                await JournalService.saveHighlight(from, highlight);
                await TwilioService.sendMessage(from, "✅ Highlight saved!");
            } else if (message.startsWith("THOUGHT")) {
                const thought = message.replace("THOUGHT:", "").trim();
                await JournalService.saveThought(from, thought);
                await TwilioService.sendMessage(from, "💡 Thought of the day saved!");
            } else if (message.startsWith("IDEA")) {
                const idea = message.replace("IDEA:", "").trim();
                await JournalService.saveIdea(from, idea);
                await TwilioService.sendMessage(from, "🚀 Idea of the day saved!");
            } else if (message.startsWith("AFFIRMATION")) {
                const affirmation = message.replace("AFFIRMATION:", "").trim();
                await JournalService.saveAffirmation(from, affirmation);
                await TwilioService.sendMessage(from, "✨ Daily affirmation saved!");
            } else if (message.startsWith("GRATITUDE")) {
                const gratitude = message.replace("GRATITUDE:", "").trim();
                await JournalService.saveGratitude(from, gratitude);
                await TwilioService.sendMessage(from, "🙏 Gratitude entry saved!");
            } else if (message.startsWith("REFLECTION")) {
                const reflection = message.replace("REFLECTION:", "").trim();
                await JournalService.saveReflection(from, reflection);
                await TwilioService.sendMessage(from, "🤔 Daily reflection saved!");
            } else if (message.startsWith("TODO")) {
                const todoCommand = this.parseTodoCommand(message);
                const response = await JournalService.handleTodoCommand(from, todoCommand);
                await TwilioService.sendMessage(from, response);
            } else {
                await TwilioService.sendMessage(
                    from,
                    "🤖 Available commands:\n" +
                    "HIGHLIGHT: [text]\n" +
                    "THOUGHT: [text]\n" +
                    "IDEA: [text]\n" +
                    "AFFIRMATION: [text]\n" +
                    "GRATITUDE: [text]\n" +
                    "REFLECTION: [text]\n" +
                    "TODO: [work/family/self_care] [add/complete/list] [text]"
                );
            }
            res.sendStatus(200);
        } catch (error) {
            logger.error('Error processing message:', error);
            res.sendStatus(500);
        }
    }

    private static parseTodoCommand(message: string): TodoListCommand {
        const parts = message.replace("TODO:", "").trim().split(" ");
        if (parts.length < 2) {
            throw new Error("Invalid todo command format");
        }

        const category = parts[0].toLowerCase() as 'work' | 'family' | 'self_care';
        const action = parts[1].toLowerCase() as 'add' | 'complete' | 'list';
        const content = parts.slice(2).join(" ");

        if (!['work', 'family', 'self_care'].includes(category)) {
            throw new Error("Invalid category. Use: work, family, or self_care");
        }

        if (!['add', 'complete', 'list'].includes(action)) {
            throw new Error("Invalid action. Use: add, complete, or list");
        }

        return {
            category,
            action,
            content: action === 'add' ? content : undefined
        };
    }
}

export default MessageController; 