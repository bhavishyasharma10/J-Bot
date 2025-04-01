import logger from "@/config/logger";
import { JournalEntry } from '@/lib/models';
import { Op } from 'sequelize';

class JournalService {
    static async saveJournalEntry(entry: { userId: string, type: string, content: string, tags: any }): Promise<void> {
        try {
            await JournalEntry.create({
                user_id: parseInt(entry.userId),
                type: entry.type,
                content: entry.content,
                tags: entry.tags
            });
            logger.info(`✅ Journal entry saved for user ${entry.userId} (Type: ${entry.type})`);
        } catch (error) {
            logger.error(`❌ Error saving journal entry: ${error}`);
            throw error;
        }
    }
    
    /**
     * Gets all journal entries for a user, optionally filtered by date.
     */
    static async getJournalEntries(userId: string, type?: string, date?: string): Promise<JournalEntry[]> {
        try {
            const where: any = {
                user_id: parseInt(userId)
            };

            if (type) {
                where.type = type;
            }
            if (date) {
                const startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);
                
                where.created_at = {
                    [Op.between]: [startDate, endDate]
                };
            }

            const entries = await JournalEntry.findAll({
                where,
                order: [['created_at', 'DESC']]
            });

            return entries;
        } catch (error) {
            logger.error(`❌ Error getting journal entries: ${error}`);
            throw error;
        }
    }

    /**
     * Creates a new journal entry.
     */
    static async createEntry(userId: string, content: string, type: string): Promise<void> {
        try {
            await JournalEntry.create({
                user_id: parseInt(userId),
                content,
                type: type,
            });
            logger.info(`✅ Journal entry created for user ${userId}`);
        } catch (error) {
            logger.error(`❌ Error creating journal entry: ${error}`);
            throw error;
        }
    }

    /**
     * Updates an existing journal entry.
     */
    static async updateEntry(entryId: string, content: string, type: string): Promise<void> {
        try {
            const entry = await JournalEntry.findByPk(entryId);
            if (!entry) {
                throw new Error("⚠️ Journal entry not found!");
            }

            await entry.update({
                content,
                type: type,
            });

            logger.info(`✅ Journal entry ${entryId} updated successfully`);
        } catch (error) {
            logger.error(`❌ Error updating journal entry: ${error}`);
            throw error;
        }
    }

    /**
     * Deletes a journal entry.
     */
    static async deleteEntry(entryId: string): Promise<void> {
        try {
            const entry = await JournalEntry.findByPk(entryId);
            if (!entry) {
                throw new Error("⚠️ Journal entry not found!");
            }

            await entry.destroy();
            logger.info(`✅ Journal entry ${entryId} deleted successfully`);
        } catch (error) {
            logger.error(`❌ Error deleting journal entry: ${error}`);
            throw error;
        }
    }


}

export default JournalService;