import pool from '@/config/database';
import logger from '@/config/logger';

class RawUserInputService {
    static async saveRawInput(userId: string, rawText: string, metadata: object | null = null): Promise<string> {
        try {
            const query = `INSERT INTO RawUserInputs (user_id, raw_text, metadata) VALUES (?, ?, ?)`;
            const values = [userId, rawText, metadata ? JSON.stringify(metadata) : null];


            const [result]: any = await pool.execute(query, values);
            // return id of the inserted row

            logger.info(`✅ Raw input saved for user ${userId}`);
            return result.insertId as string; // Return the ID of the inserted row
        } catch (error) {
            logger.error(`❌ Error saving raw input: ${error}`);
            throw error;
        }
    }

    static async markAsProcessed(inputId: string): Promise<void> {
        try {
            const query = `UPDATE RawUserInputs SET processed = TRUE WHERE id = ?`;
            await pool.execute(query, [inputId]);
            logger.info(`✅ Raw input ${inputId} marked as processed`);
        } catch (error) {
            logger.error(`❌ Error marking input as processed: ${error}`);
            throw error;
        }
    }

    static async getUnprocessedInputs(): Promise<any[]> {
        try {
            const query = `SELECT * FROM RawUserInputs WHERE processed = FALSE ORDER BY created_at ASC`;
            const [rows] = await pool.query(query);
            return rows as any[];
        } catch (error) {
            logger.error(`❌ Error fetching unprocessed inputs: ${error}`);
            throw error;
        }
    }
}

export default RawUserInputService;
