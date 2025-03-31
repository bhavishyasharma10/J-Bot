import logger from "@/config/logger";
import { User } from '@/lib/models';
class UserService {
    static async findOrCreateUser(phoneNumber: string, name: string): Promise<{ id: string, isNewUser: boolean }> {
        try {
            const [user, created] = await User.findOrCreate({
                where: { whatsapp_number: phoneNumber },
                defaults: { name }
            });

            logger.info(created ? `✅ New user created: ${phoneNumber}` : `✅ Existing user found: ${phoneNumber}`);
            return { 
                id: user.id.toString(),
                isNewUser: created
            };
        } catch (error) {
            logger.error(`❌ Error finding/creating user: ${error}`);
            throw error;
        }
    }
}

export default UserService;
