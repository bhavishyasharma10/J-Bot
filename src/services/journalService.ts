import db from '../config/database';
import logger from '../config/logger';
import { TodoListCommand } from '../types';

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

    static async saveAffirmation(from: string, affirmation: string): Promise<void> {
        try {
            const query = 'INSERT INTO affirmations (user_id, content, created_at) VALUES (?, ?, NOW())';
            await db.promise().execute(query, [from, affirmation]);
            logger.info(`Affirmation saved for user ${from}`);
        } catch (error) {
            logger.error(`Failed to save affirmation for user ${from}:`, error);
            throw error;
        }
    }

    static async saveGratitude(from: string, gratitude: string): Promise<void> {
        try {
            const query = 'INSERT INTO gratitude (user_id, content, created_at) VALUES (?, ?, NOW())';
            await db.promise().execute(query, [from, gratitude]);
            logger.info(`Gratitude saved for user ${from}`);
        } catch (error) {
            logger.error(`Failed to save gratitude for user ${from}:`, error);
            throw error;
        }
    }

    static async saveReflection(from: string, reflection: string): Promise<void> {
        try {
            const query = 'INSERT INTO reflections (user_id, content, created_at) VALUES (?, ?, NOW())';
            await db.promise().execute(query, [from, reflection]);
            logger.info(`Reflection saved for user ${from}`);
        } catch (error) {
            logger.error(`Failed to save reflection for user ${from}:`, error);
            throw error;
        }
    }

    static async handleTodoCommand(from: string, command: TodoListCommand): Promise<string> {
        try {
            switch (command.action) {
                case 'add':
                    if (!command.content) {
                        throw new Error('Content is required for adding todo items');
                    }
                    const addQuery = 'INSERT INTO todo_lists (user_id, category, content, created_at) VALUES (?, ?, ?, NOW())';
                    await db.promise().execute(addQuery, [from, command.category, command.content]);
                    return `✅ Added to ${command.category} todo list`;

                case 'complete':
                    const completeQuery = 'UPDATE todo_lists SET is_completed = TRUE WHERE user_id = ? AND category = ? AND is_completed = FALSE LIMIT 1';
                    const [result] = await db.promise().execute(completeQuery, [from, command.category]);
                    if ((result as any).affectedRows === 0) {
                        return `No pending items in ${command.category} todo list`;
                    }
                    return `✅ Completed latest item in ${command.category} todo list`;

                case 'list':
                    const listQuery = 'SELECT content, is_completed FROM todo_lists WHERE user_id = ? AND category = ? ORDER BY created_at DESC LIMIT 5';
                    const [todos] = await db.promise().execute(listQuery, [from, command.category]);
                    if ((todos as any[]).length === 0) {
                        return `No items in ${command.category} todo list`;
                    }
                    return (todos as any[]).map(todo => 
                        `${todo.is_completed ? '✅' : '⏳'} ${todo.content}`
                    ).join('\n');

                default:
                    throw new Error('Invalid todo command action');
            }
        } catch (error) {
            logger.error(`Failed to handle todo command for user ${from}:`, error);
            throw error;
        }
    }
}

export default JournalService; 