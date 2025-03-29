import pool from "@/config/database";
import logger from "@/config/logger";

export class UserService {
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
}
