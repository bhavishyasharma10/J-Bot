import { Request, Response } from "express";
import logger from "@/config/logger";
import { JournalService, RawUserInputService, ReminderService, TaskService, TwilioService, UserService, AIService } from "@/lib/services/Index";
export class MessageController {
    static async handleIncomingMessage(req: Request, res: Response): Promise<void> {
        const from = req.body.From; // "whatsapp:+91XXXX11XXXX"
        const message = req.body.Body.trim();
        const name = req.body.ProfileName || "User"; // Fallback to "User" if ProfileName is not available
        logger.info(`📩 Incoming message from ${from}: ${message}`);

        try {
            // 1️⃣ Extract phone number and find/create user
            const phoneNumber = from.replace("whatsapp:", "").trim();
            const user = await UserService.findOrCreateUser(phoneNumber, name);
            const userId = user.id;

            // 2️⃣ Store raw input
            const rawInputId = await RawUserInputService.saveRawInput(userId, message);

            // 3️⃣ Process input using AIService (pass userId and rawInputId)
            const aiResponse = await AIService.processMessage(message);

            const responses: string[] = [];

            // 4️⃣ Handle multiple detected actions
            for (const action of aiResponse.actions) {
                switch (action.type) {
                    case "journal":
                        const newEntry= {
                            userId,
                            type: action.data.type,
                            content: action.data.content,
                            tags: action.data.tags || [],
                        }
                        await JournalService.saveJournalEntry(newEntry);
                        responses.push(`✅ ${action.data.type} saved!`);
                        break;

                    case "reminder":
                        await ReminderService.createReminder(userId, action.data.text, action.data.time, rawInputId);
                        responses.push(`⏰ Reminder set for ${action.data.time}!`);
                        break;

                    case "task":
                        const taskResponse = await TaskService.handleTaskCommand(userId, {
                            action: action.data.action,
                            category: action.data.category,
                            content: action.data.content,
                            taskId: action.data.taskId,
                            rawInputId,
                        });
                        responses.push(taskResponse);
                        break;

                    default:
                        responses.push("🤖 Sorry, I didn't understand that.");
                        break;
                }
            }

            // 5️⃣ Send response back to user
            const finalResponse = responses.join("\n");
            await TwilioService.sendMessage(from, finalResponse);

            res.sendStatus(200);
        } catch (error) {
            logger.error("❌ Error processing message:", error);
            res.sendStatus(500);
        }
    }
}
