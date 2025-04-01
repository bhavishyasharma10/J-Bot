import logger from "@/config/logger";
import { Task } from '@/lib/models';
import { IHandleTask, TaskCategory } from "../types/Task";
import { Op } from 'sequelize';
import { TaskAttributes } from "../types/models";

class TaskService {
    /**
     * Saves a new task.
     */
    static async addTask(task: { userId: string, category: string, content: string, rawInputId?: string }): Promise<void> {
        try {
            await Task.create({
                user_id: parseInt(task.userId),
                category: task.category as "work" | "personal" | "family",
                content: task.content,
                status: 'pending',
            });
            logger.info(`✅ Task added for user ${task.userId} (Category: ${task.category})`);
        } catch (error) {
            logger.error(`❌ Error adding task: ${error}`);
            throw error;
        }
    }

    /**
     * Toggles a task's status between completed and pending.
     */
    static async toggleTaskStatus(taskId: string): Promise<void> {
        try {
            const task = await Task.findByPk(taskId);
            if (!task) {
                throw new Error("⚠️ Task not found!");
            }

            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            await task.update({ status: newStatus });

            logger.info(`✅ Task ${taskId} status toggled to ${newStatus}`);
        } catch (error) {
            logger.error(`❌ Error toggling task status: ${error}`);
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
     * Lists all tasks for a user, optionally filtered by category and date.
     */
    static async listTasks(userId: string, category?: TaskCategory, date?: string | null): Promise<TaskAttributes[]> {
        try {
            const where: any = {
                user_id: parseInt(userId)
            };

            if (category) {
                where.category = category;
            }

            if (date) {
                const startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);
                
                where.created_at = {
                    [Op.between]: [startDate, endDate]
                };
            }

            const tasks = await Task.findAll({
                where,
                order: [['created_at', 'DESC']]
            });

            return tasks;
        } catch (error) {
            logger.error(`❌ Error listing tasks: ${error}`);
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

    static async handleTask(data: IHandleTask, userId: string): Promise<string> {
        try {
            switch (data.action) {
                case "add": {
                    if (!data.content || !data.category) {
                        throw new Error("⚠️ Missing required fields!");
                    }
                    await this.addTask({
                        userId,
                        category: data.category,
                        content: data.content,
                        rawInputId: data.rawInputId || '0'
                    });
                    return "✅ Task added successfully!";
                }

                case "complete": {
                    if (!data.id) {
                        throw new Error("⚠️ Task ID is required!");
                    }
                    await this.toggleTaskStatus(data.id);
                    return "✅ Task completed!";
                }

                case "list": {
                    const tasks = await this.listTasks(userId, data.category);
                    if (tasks.length === 0) return "📋 No pending tasks!";
                    const title = data.category ? "📋 Your pending " + data.category + " tasks:" : "📋 Your pending tasks:";
                    const taskList = tasks.map(task => "- " + task.content + " [" + (task.category || "N/A") + "]").join("\n");
                    return title + "\n" + taskList;
                }

                default:
                    throw new Error("⚠️ Invalid action!");
            }
        } catch (error) {
            logger.error(`❌ Error handling task: ${error}`);
            throw error;
        }
    }

    /**
     * Updates an existing task.
     */
    static async updateTask(taskId: string, content: string, category: string): Promise<void> {
        try {
            const task = await Task.findByPk(taskId);
            if (!task) {
                throw new Error("⚠️ Task not found!");
            }

            await task.update({
                content,
                category: category as "work" | "personal" | "family"
            });

            logger.info(`✅ Task ${taskId} updated successfully`);
        } catch (error) {
            logger.error(`❌ Error updating task: ${error}`);
            throw error;
        }
    }

    /**
     * Deletes a task.
     */
    static async deleteTask(taskId: string): Promise<void> {
        try {
            const task = await Task.findByPk(taskId);
            if (!task) {
                throw new Error("⚠️ Task not found!");
            }

            await task.destroy();
            logger.info(`✅ Task ${taskId} deleted successfully`);
        } catch (error) {
            logger.error(`❌ Error deleting task: ${error}`);
            throw error;
        }
    }
}

export default TaskService;