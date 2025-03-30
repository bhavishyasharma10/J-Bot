import { Request, Response } from "express";
import logger from "@/config/logger";
import { JournalService, RawUserInputService, ReminderService, TaskService, TwilioService, UserService, AIService } from "@/lib/services/Index";
import { IHandleTask } from "@/lib/types/Task";

const INTRO_MESSAGE = `👋 Welcome to JBot! I'm your AI-powered personal assistant for organizing thoughts and tasks.

🤖 About Me:
• I use AI to understand your messages naturally
• I can handle multiple tasks in a single message
• I might occasionally misunderstand - feel free to clarify!

📝 What I Can Do:

1. Journal Entries:
   • "Had a great meeting today, team loved the presentation"
   • "Feeling grateful for family support during tough times"
   • "New project idea: mobile app for local businesses"

2. Reminders:
   • "Remind me to call mom tomorrow at 2pm"
   • "Set reminder for dentist appointment next Monday 10am"
   • "Don't forget to submit report by Friday 5pm"

3. Tasks:
   • "Add task: review project proposal"
   • "New task: buy groceries for dinner"
   • "Task: schedule team meeting"

💡 Tips:
• Be natural in your messages
• Include dates/times for reminders
• You can combine multiple requests
• If I misunderstand, just rephrase and try again

Need help? Just ask! 😊`;

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

            // Check if this is a new user
            const isNewUser = await UserService.isNewUser(userId);
            if (isNewUser) {
                logger.info(`📩 New user detected: ${phoneNumber}`);
                await TwilioService.sendMessage(from, INTRO_MESSAGE);
                return;
            }

            // 2️⃣ Store raw input
            const rawInputId = await RawUserInputService.saveRawInput(userId, message);

            // 3️⃣ Process input using AIService (pass userId and rawInputId)
            const aiResponse = await AIService.processMessage(message);

            const responses: string[] = [];

            // 4️⃣ Handle multiple detected actions
            for (const action of aiResponse.actions) {
                switch (action.type) {
                    case "journal":{
                        const newEntry = {
                            userId,
                            type: action.data.type,
                            content: action.data.content,
                            tags: action.data.tags || [],
                        }
                        await JournalService.saveJournalEntry(newEntry);
                        responses.push(`📝 Your ${action.data.type} has been saved successfully!\nContent: ${action.data.content}`);
                        break;
                    }

                    case "reminder":
                        await ReminderService.createReminder(userId, action.data.text, action.data.time, rawInputId);
                        responses.push(`⏰ Reminder set successfully!\nTask: ${action.data.text}\nTime: ${action.data.time}`);
                        break;

                    case "task": {
                        const taskCommand: IHandleTask = {
                            action: action.data.action,
                            category: action.data.category,
                            status: action.data.status,
                            content: action.data.content,
                            rawInputId,
                            userId,
                        }
                        const taskResponse = await TaskService.handleTaskCommand(userId, taskCommand, rawInputId);
                        responses.push(taskResponse);
                        break;
                    }

                    default:
                        responses.push(`🤖 I'm not sure how to help with that. Here are some things I can do:\n\n${INTRO_MESSAGE}`);
                        break;
                }
            }

            // 5️⃣ Send response back to user
            const finalResponse = responses.join("\n\n");
            await TwilioService.sendMessage(from, finalResponse);

            res.sendStatus(200);
        } catch (error) {
            logger.error("❌ Error processing message:", error);
            const errorMessage = "❌ I encountered an error while processing your request. Please try again or contact support if the issue persists.";
            await TwilioService.sendMessage(from, errorMessage);
            res.sendStatus(500);
        }
    }
}
