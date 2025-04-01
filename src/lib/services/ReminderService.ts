import logger from '@/config/logger';
import { Reminder } from '@/lib/models';
import { Op } from 'sequelize';
import { ReminderAttributes } from '../types/models';

class ReminderService {
    static async createReminder(userId: string, reminderText: string, reminderTime: string, targetId: string | null = null): Promise<void> {
        try {
            await Reminder.create({
                user_id: parseInt(userId),
                reminder_text: reminderText,
                reminder_time: new Date(reminderTime),
                target_id: targetId ? parseInt(targetId) : undefined,
                status: 'pending'
            });
            logger.info(`✅ Reminder set for user ${userId} at ${reminderTime}`);
        } catch (error) {
            logger.error(`❌ Error creating reminder: ${error}`);
            throw error;
        }
    }

    static async getPendingReminders(): Promise<ReminderAttributes[]> {
        try {
            return await Reminder.findAll({
                where: {
                    status: 'pending',
                    reminder_time: {
                        [Op.lte]: new Date()
                    }
                },
                order: [['reminder_time', 'ASC']]
            });
        } catch (error) {
            logger.error(`❌ Error fetching pending reminders: ${error}`);
            throw error;
        }
    }

    static async getUserReminders(userId: string, date?: string | null): Promise<ReminderAttributes[]> {
        try {
            const where: any = {
                user_id: parseInt(userId)
            };

            if (date) {
                const startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);
                
                where.reminder_time = {
                    [Op.between]: [startDate, endDate]
                };
            }

            return await Reminder.findAll({
                where,
                order: [['reminder_time', 'ASC']]
            });
        } catch (error) {
            logger.error(`❌ Error fetching user reminders: ${error}`);
            throw error;
        }
    }

    static async markReminderAsTriggered(reminderId: string): Promise<void> {
        try {
            await Reminder.update(
                { status: 'triggered' },
                { where: { id: parseInt(reminderId) } }
            );
            logger.info(`✅ Reminder ${reminderId} marked as triggered`);
        } catch (error) {
            logger.error(`❌ Error updating reminder status: ${error}`);
            throw error;
        }
    }

    static async deleteReminder(reminderId: string): Promise<void> {
        try {
            await Reminder.destroy({
                where: { id: parseInt(reminderId) }
            });
            logger.info(`✅ Reminder ${reminderId} deleted`);
        } catch (error) {
            logger.error(`❌ Error deleting reminder: ${error}`);
            throw error;
        }
    }
}

export default ReminderService;
