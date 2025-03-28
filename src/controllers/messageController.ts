import IntentService from '@/lib/services/intentService';
import logger from '@/config/logger';

export async function handleIncomingMessage(body: any) {
    try {
        // Extract message data from the webhook body
        const message = body.entry[0]?.changes[0]?.value?.messages[0];
        if (!message) {
            return { status: 'error', message: 'No message found in webhook' };
        }

        const userId = message.from;
        const content = message.text?.body || '';

        // Process the message using IntentService
        const response = await IntentService.processCommand(userId, content);
        
        return {
            status: 'success',
            response
        };
    } catch (error) {
        logger.error('Error handling message:', error);
        return {
            status: 'error',
            message: 'Failed to process message'
        };
    }
} 