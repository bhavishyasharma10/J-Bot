import pool from "@/config/database";
import logger from "@/config/logger";

class UserService {
    static async findOrCreateUser(phoneNumber: string, name: string): Promise<{ id: string }> {
        try {
            // Check if user exists
            const [rows]: any = await pool.execute("SELECT id FROM Users WHERE whatsapp_number = ?", [phoneNumber]);

            if (rows.length > 0) {
                return { id: rows[0].id };
            }

            // Create new user
            const [result]: any = await pool.execute("INSERT INTO Users (whatsapp_number, name) VALUES (?, ?)", [phoneNumber, name]);
            logger.info(`✅ New user created: ${phoneNumber}`);

            return { id: result.insertId };
        } catch (error) {
            logger.error(`❌ Error finding/creating user: ${error}`);
            throw error;
        }
    }

    static async isNewUser(userId: string, minutesThreshold: number = 1): Promise<boolean> {
        try {
            const [rows]: any = await pool.execute(
                "SELECT created_at FROM Users WHERE id = ?",
                [userId]
            );

            if (rows.length === 0) {
                return false;
            }

            const createdAt = new Date(rows[0].created_at);
            const now = new Date();
            const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60);

            // Consider a user new if they were created within the specified minutesThreshold
            return minutesSinceCreation < minutesThreshold;
        } catch (error) {
            logger.error(`❌ Error checking if user is new: ${error}`);
            return false;
        }
    }
}

export default UserService;
