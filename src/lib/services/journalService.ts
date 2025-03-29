import pool from '@/config/database';
import logger from '@/config/logger';
import { JournalEntry } from '../types/JournalEntry';

export class JournalService {
    static async saveJournalEntry(entry: JournalEntry): Promise<void> {
        try {
            const { userId, type, content, tags } = entry;
            const query = `INSERT INTO JournalEntries (user_id, type, content, tags) VALUES (?, ?, ?, ?)`;
            const values = [userId, type, content, JSON.stringify(tags)];

            await pool.execute(query, values);
            logger.info(`✅ Journal entry saved for user ${userId} (Type: ${type})`);
        } catch (error) {
            logger.error(`❌ Error saving journal entry: ${error}`);
            throw error;
        }
    }

    static async getJournalEntries(userId: string, type?: string): Promise<any[]> {
        try {
            let query = `SELECT * FROM JournalEntries WHERE user_id = ?`;
            const values: any[] = [userId];

            if (type) {
                query += ` AND type = ?`;
                values.push(type);
            }

            query += ` ORDER BY created_at DESC`;
            const [rows] = await pool.query(query, values);

            return rows as any[];
        } catch (error) {
            logger.error(`❌ Error fetching journal entries: ${error}`);
            throw error;
        }
    }

    static async deleteJournalEntry(entryId: string): Promise<void> {
        try {
            const query = `DELETE FROM JournalEntries WHERE id = ?`;
            await pool.execute(query, [entryId]);
            logger.info(`✅ Deleted journal entry ${entryId}`);
        } catch (error) {
            logger.error(`❌ Error deleting journal entry: ${error}`);
            throw error;
        }
    }
}

