import logger from "@/config/logger";
import { User } from '@/lib/models';

class UserService {
    private static formatPhoneNumber(phoneNumber: string): string {
        // Remove any spaces and ensure it starts with +
        return phoneNumber.trim().startsWith('+') ? phoneNumber.trim() : `+${phoneNumber.trim()}`;
    }

    static async findOrCreateUser(phoneNumber: string, name: string): Promise<{ id: string, isNewUser: boolean }> {
        try {
            const formattedPhone = this.formatPhoneNumber(phoneNumber);
            const [user, created] = await User.findOrCreate({
                where: { whatsapp_number: phoneNumber },
                defaults: { name }
            });

            logger.info(created ? `✅ New user created: ${formattedPhone}` : `✅ Existing user found: ${formattedPhone}`);
            return { 
                id: user.id.toString(),
                isNewUser: created
            };
        } catch (error) {
            logger.error(`❌ Error finding/creating user: ${error}`);
            throw error;
        }
    }

    static async getUserByPhone(phoneNumber: string): Promise<User | null> {
        try {
            const formattedPhone = this.formatPhoneNumber(phoneNumber);
            return await User.findOne({
                where: { whatsapp_number: formattedPhone }
            });
        } catch (error) {
            logger.error(`❌ Error fetching user: ${error}`);
            throw error;
        }
    }
}

export default UserService;
