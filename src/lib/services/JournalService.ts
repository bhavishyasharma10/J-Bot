import logger from '@/config/logger';
import { JournalEntry } from '@/lib/models';

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

    static async getJournalEntries(userId: string, type?: string): Promise<JournalEntry[]> {
        try {
            const where: any = { user_id: userId };
            if (type) {
                where.type = type;
            }

            const entries = await JournalEntry.findAll({
                where,
                order: [['created_at', 'DESC']]
            });

            return entries;
        } catch (error) {
            logger.error(`❌ Error fetching journal entries: ${error}`);
            throw error;
        }
    }

    static async deleteJournalEntry(entryId: string): Promise<void> {
        try {
            await JournalEntry.destroy({
                where: { id: entryId }
            });
            logger.info(`✅ Deleted journal entry ${entryId}`);
        } catch (error) {
            logger.error(`❌ Error deleting journal entry: ${error}`);
            throw error;
        }
    }
}

export default JournalService;