import db from '../config/database';
import logger from '../config/logger';

class JournalService {
    static async saveHighlight(from: string, highlight: string): Promise<void> {
        try {
            const query = 'INSERT INTO highlights (user_id, content, created_at) VALUES (?, ?, NOW())';
            await db.promise().execute(query, [from, highlight]);
            logger.info(`Highlight saved for user ${from}`);
        } catch (error) {
            logger.error(`Failed to save highlight for user ${from}:`, error);
            throw error;
        }
    }

    static async saveThought(from: string, thought: string): Promise<void> {
        try {
            const query = 'INSERT INTO thoughts (user_id, content, created_at) VALUES (?, ?, NOW())';
            await db.promise().execute(query, [from, thought]);
            logger.info(`Thought saved for user ${from}`);
        } catch (error) {
            logger.error(`Failed to save thought for user ${from}:`, error);
            throw error;
        }
    }

    static async saveIdea(from: string, idea: string): Promise<void> {
        try {
            const query = 'INSERT INTO ideas (user_id, content, created_at) VALUES (?, ?, NOW())';
            await db.promise().execute(query, [from, idea]);
            logger.info(`Idea saved for user ${from}`);
        } catch (error) {
            logger.error(`Failed to save idea for user ${from}:`, error);
            throw error;
        }
    }
}

export default JournalService; 