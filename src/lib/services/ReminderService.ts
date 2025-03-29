import pool from '@/config/database';
import logger from '@/config/logger';

class ReminderService {
    static async createReminder(userId: string, reminderText: string, reminderTime: string, targetId: string | null = null): Promise<void> {
        try {
            const query = `INSERT INTO Reminders (user_id, reminder_text, reminder_time, target_id, status) VALUES (?, ?, ?, ?, 'pending')`;
            const values = [userId, reminderText, reminderTime, targetId];

            await pool.execute(query, values);
            logger.info(`✅ Reminder set for user ${userId} at ${reminderTime}`);
        } catch (error) {
            logger.error(`❌ Error creating reminder: ${error}`);
            throw error;
        }
    }

    static async getPendingReminders(): Promise<any[]> {
        try {
            const query = `SELECT * FROM Reminders WHERE status = 'pending' AND reminder_time <= NOW() ORDER BY reminder_time ASC`;
            const [rows] = await pool.query(query);

            return rows as any[];
        } catch (error) {
            logger.error(`❌ Error fetching pending reminders: ${error}`);
            throw error;
        }
    }

    static async markReminderAsTriggered(reminderId: string): Promise<void> {
        try {
            const query = `UPDATE Reminders SET status = 'triggered' WHERE id = ?`;
            await pool.execute(query, [reminderId]);
            logger.info(`✅ Reminder ${reminderId} marked as triggered`);
        } catch (error) {
            logger.error(`❌ Error updating reminder status: ${error}`);
            throw error;
        }
    }

    static async deleteReminder(reminderId: string): Promise<void> {
        try {
            const query = `DELETE FROM Reminders WHERE id = ?`;
            await pool.execute(query, [reminderId]);
            logger.info(`✅ Deleted reminder ${reminderId}`);
        } catch (error) {
            logger.error(`❌ Error deleting reminder: ${error}`);
            throw error;
        }
    }
}

export default ReminderService;
