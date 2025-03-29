import pool from "@/config/database";
import logger from "@/config/logger";
import { Task } from "../types/Task";

class TaskService {
    /**
     * Saves a new task.
     */
    static async addTask(task: Task): Promise<void> {
        try {
            const { userId, category, content, rawInputId } = task;
            const query = `INSERT INTO tasks (user_id, category, content, status, raw_input_id) VALUES (?, ?, ?, ?, ?)`;
            const values = [userId, category, content, "pending", rawInputId];

            await pool.execute(query, values);
            logger.info(`✅ Task added for user ${userId} (Category: ${category})`);
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
            const query = `UPDATE tasks SET status = 'completed' WHERE id = ? AND user_id = ?`;
            const values = [taskId, userId];

            const [result]: any = await pool.execute(query, values);
            if (result.affectedRows === 0) {
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
    static async listTasks(userId: string, category?: "work" | "personal" | "family"): Promise<any[]> {
        try {
            const query = category
                ? `SELECT id, content FROM tasks WHERE user_id = ? AND category = ? AND status = 'pending'`
                : `SELECT id, category, content FROM tasks WHERE user_id = ? AND status = 'pending'`;

            const values = category ? [userId, category] : [userId];

            const [rows]: any = await pool.execute(query, values);
            return rows;
        } catch (error) {
            logger.error(`❌ Error retrieving tasks: ${error}`);
            throw error;
        }
    }

    /**
     * Handles a task command from AIService.
     */
    static async handleTaskCommand(userId: string, data: { action: string; category?: "work" | "personal" | "family"; content?: string; taskId?: string; rawInputId: string }): Promise<string> {
        try {
            switch (data.action) {
                case "add":
                    if (!data.content || !data.category) return "⚠️ Missing task content or category.";
                    
                    const newTask: Task = {
                        userId,
                        category: data.category,
                        content: data.content,
                        status: "pending",
                        rawInputId: data.rawInputId,
                    };
                    await this.addTask(newTask);
                    return `📝 Task added under ${data.category}!`;

                case "complete":
                    if (!data.taskId) return "⚠️ Missing task ID.";
                    await this.completeTask(userId, data.taskId);
                    return "✅ Task marked as completed!";

                case "list":
                    const tasks = await this.listTasks(userId, data.category);
                    if (tasks.length === 0) return "📋 No pending tasks!";
                    return tasks.map((task: any) => `- ${task.content} [${task.category || "N/A"}]`).join("\n");

                default:
                    return "⚠️ Invalid task command.";
            }
        } catch (error) {
            return `❌ ${error}`;
        }
    }
}

export default TaskService;
