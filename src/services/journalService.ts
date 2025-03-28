import mysql, { RowDataPacket } from 'mysql2/promise';
import { DatabaseConfig } from '../types';
import logger from '../config/logger';
import { TodoItem, TodoListCommand } from '../types';

const dbConfig: DatabaseConfig = {
    host: process.env.DB_HOST as string,
    port: parseInt(process.env.DB_PORT as string, 10),
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string
};

interface JournalEntry extends RowDataPacket {
    id: number;
    content: string;
    created_at: string;
    type: string;
}

class JournalService {
    private static async getConnection() {
        return await mysql.createConnection(dbConfig);
    }

    static async saveHighlight(userId: string, content: string): Promise<void> {
        const conn = await this.getConnection();
        try {
            await conn.execute(
                'INSERT INTO highlights (user_id, content) VALUES (?, ?)',
                [userId, content]
            );
        } finally {
            await conn.end();
        }
    }

    static async saveThought(userId: string, content: string): Promise<void> {
        const conn = await this.getConnection();
        try {
            await conn.execute(
                'INSERT INTO thoughts (user_id, content) VALUES (?, ?)',
                [userId, content]
            );
        } finally {
            await conn.end();
        }
    }

    static async saveIdea(userId: string, content: string): Promise<void> {
        const conn = await this.getConnection();
        try {
            await conn.execute(
                'INSERT INTO ideas (user_id, content) VALUES (?, ?)',
                [userId, content]
            );
        } finally {
            await conn.end();
        }
    }

    static async saveAffirmation(userId: string, content: string): Promise<void> {
        const conn = await this.getConnection();
        try {
            await conn.execute(
                'INSERT INTO affirmations (user_id, content) VALUES (?, ?)',
                [userId, content]
            );
        } finally {
            await conn.end();
        }
    }

    static async saveGratitude(userId: string, content: string): Promise<void> {
        const conn = await this.getConnection();
        try {
            await conn.execute(
                'INSERT INTO gratitude (user_id, content) VALUES (?, ?)',
                [userId, content]
            );
        } finally {
            await conn.end();
        }
    }

    static async saveReflection(userId: string, content: string): Promise<void> {
        const conn = await this.getConnection();
        try {
            await conn.execute(
                'INSERT INTO reflections (user_id, content) VALUES (?, ?)',
                [userId, content]
            );
        } finally {
            await conn.end();
        }
    }

    static async handleTodoCommand(userId: string, command: TodoListCommand): Promise<string> {
        const conn = await this.getConnection();
        try {
            switch (command.action) {
                case 'add':
                    if (!command.content) {
                        return "❌ Please provide content for the todo item.";
                    }
                    await conn.execute(
                        'INSERT INTO todo_lists (user_id, category, content) VALUES (?, ?, ?)',
                        [userId, command.category, command.content]
                    );
                    return `✅ Added to ${command.category} todo list: ${command.content}`;

                case 'complete':
                    await conn.execute(
                        'UPDATE todo_lists SET completed = true WHERE user_id = ? AND category = ? AND completed = false',
                        [userId, command.category]
                    );
                    return `✅ Marked all ${command.category} items as complete!`;

                case 'list':
                    const [rows] = await conn.execute(
                        'SELECT content, completed FROM todo_lists WHERE user_id = ? AND category = ? ORDER BY created_at DESC',
                        [userId, command.category]
                    );
                    const items = rows as { content: string; completed: boolean }[];
                    if (items.length === 0) {
                        return `📝 No items in ${command.category} todo list.`;
                    }
                    return items
                        .map(item => `${item.completed ? '✅' : '⏳'} ${item.content}`)
                        .join('\n');

                default:
                    return "❌ Invalid todo command action.";
            }
        } finally {
            await conn.end();
        }
    }

    static async getAllEntries(userId: string): Promise<JournalEntry[]> {
        const conn = await this.getConnection();
        try {
            const [highlights] = await conn.execute<JournalEntry[]>(
                'SELECT id, content, created_at, "highlight" as type FROM highlights WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            const [thoughts] = await conn.execute<JournalEntry[]>(
                'SELECT id, content, created_at, "thought" as type FROM thoughts WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            const [ideas] = await conn.execute<JournalEntry[]>(
                'SELECT id, content, created_at, "idea" as type FROM ideas WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            const [affirmations] = await conn.execute<JournalEntry[]>(
                'SELECT id, content, created_at, "affirmation" as type FROM affirmations WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            const [gratitude] = await conn.execute<JournalEntry[]>(
                'SELECT id, content, created_at, "gratitude" as type FROM gratitude WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            const [reflections] = await conn.execute<JournalEntry[]>(
                'SELECT id, content, created_at, "reflection" as type FROM reflections WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );

            return [
                ...highlights,
                ...thoughts,
                ...ideas,
                ...affirmations,
                ...gratitude,
                ...reflections
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } finally {
            await conn.end();
        }
    }
}

export default JournalService; 