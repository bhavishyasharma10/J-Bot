import twilio from 'twilio';
import logger from '@/config/logger';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

logger.info('Twilio Configuration:', {
    accountSid: accountSid ? 'Present' : 'Missing',
    authToken: authToken ? 'Present' : 'Missing'
});

if (!accountSid || !authToken) {
    logger.error('Twilio credentials missing:', {
        accountSid: !!accountSid,
        authToken: !!authToken
    });
    throw new Error('Twilio credentials are not properly configured');
}

const client = twilio(accountSid, authToken);

export class TwilioService {
    static async sendMessage(to: string, text: string): Promise<void> {
        try {
            await client.messages.create({
                body: text,
                from: "whatsapp:+14155238886",
                to: to
            });
            logger.info(`Message sent successfully to ${to}`);
        } catch (error) {
            logger.error(`Failed to send message to ${to}:`, error);
            throw error;
        }
    }
}
