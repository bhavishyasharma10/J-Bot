import logger from '@/config/logger';
import { RawUserInput } from '@/lib/models';

class RawUserInputService {
    static async saveRawInput(userId: string, rawText: string, metadata: object | null = null): Promise<string> {
        try {
            const rawInput = await RawUserInput.create({
                user_id: userId,
                raw_text: rawText,
                metadata: metadata,
                processed: false
            });

            logger.info(`✅ Raw input saved for user ${userId}`);
            return rawInput.id.toString();
        } catch (error) {
            logger.error(`❌ Error saving raw input: ${error}`);
            throw error;
        }
    }

    static async markAsProcessed(inputId: string): Promise<void> {
        try {
            await RawUserInput.update(
                { processed: true },
                { where: { id: inputId } }
            );
            logger.info(`✅ Raw input ${inputId} marked as processed`);
        } catch (error) {
            logger.error(`❌ Error marking input as processed: ${error}`);
            throw error;
        }
    }

    static async getUnprocessedInputs(): Promise<RawUserInput[]> {
        try {
            return await RawUserInput.findAll({
                where: { processed: false },
                order: [['created_at', 'ASC']]
            });
        } catch (error) {
            logger.error(`❌ Error fetching unprocessed inputs: ${error}`);
            throw error;
        }
    }
}

export default RawUserInputService;
