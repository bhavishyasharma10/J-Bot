import logger from "@/config/logger";
import { Task } from '@/lib/models';
import { IHandleTask } from "../types/Task";

class TaskService {
    /**
     * Saves a new task.
     */
    static async addTask(task: { userId: string, category: string, content: string, rawInputId: string }): Promise<void> {
        try {
            await Task.create({
                user_id: parseInt(task.userId),
                category: task.category as "work" | "personal" | "family",
                content: task.content,
                status: 'pending',
                raw_input_id: parseInt(task.rawInputId)
            });
            logger.info(`✅ Task added for user ${task.userId} (Category: ${task.category})`);
        } catch (error) {
            logger.error(`❌ Error adding task: ${error}`);
            throw error;
        }
    }

    /**
     * Marks a task as completed.
     */
    static async completeTask(userId: string, taskId: string): Promise<void> {
        try {
            const [updatedRows] = await Task.update(
                { status: 'completed' },
                { where: { id: taskId, user_id: userId } }
            );

            if (updatedRows === 0) {
                throw new Error("⚠️ Task not found!");
            }

            logger.info(`✅ Task completed for user ${userId} (Task ID: ${taskId})`);
        } catch (error) {
            logger.error(`❌ Error completing task: ${error}`);
            throw error;
        }
    }

    /**
     * Lists all pending tasks for a user, optionally filtered by category.
     */
    static async listTasks(userId: string, category?: "work" | "personal" | "family"): Promise<Task[]> {
        try {
            const where: any = {
                user_id: userId,
                status: 'pending'
            };

            if (category) {
                where.category = category;
            }

            return await Task.findAll({
                where
            });
        } catch (error) {
            logger.error(`❌ Error retrieving tasks: ${error}`);
            throw error;
        }
    }

    /**
     * Handles a task command from AIService.
     */
    static async handleTaskCommand(userId: string, data: IHandleTask, rawInputId: string): Promise<string> {
        try {
            switch (data.action) {
                case "add": {
                    if (!data.content || !data.category) return "⚠️ Missing task content or category.";
                    
                    await this.addTask({
                        userId,
                        category: data.category,
                        content: data.content,
                        rawInputId
                    });
                    return `📝 Task added under ${data.category}!`;
                }

                case "list": {
                    const tasks = await this.listTasks(userId, data.category);
                    if (tasks.length === 0) return "📋 No pending tasks!";
                    const title = data.category ? "📋 Your pending " + data.category + " tasks:" : "📋 Your pending tasks:";
                    const taskList = tasks.map(task => "- " + task.content + " [" + (task.category || "N/A") + "]").join("\n");
                    return title + "\n" + taskList;
                }

                default:
                    return `⚠️ Invalid task command. ${data.action} is not recognized.`;
            }
        } catch (error) {
            return `❌ ${error}`;
        }
    }
}

export default TaskService;