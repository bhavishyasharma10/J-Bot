import { Request, Response } from 'express';
import TwilioService from '../services/twilioService';
import JournalService from '../services/journalService';
import logger from '../config/logger';
import { WhatsAppMessage } from '../types';

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
            } else {
                await TwilioService.sendMessage(
                    from,
                    "🤖 I didn't understand that. Try using 'HIGHLIGHT:', 'THOUGHT:', or 'IDEA:'."
                );
            }
            res.sendStatus(200);
        } catch (error) {
            logger.error('Error processing message:', error);
            res.sendStatus(500);
        }
    }
}

export default MessageController; 