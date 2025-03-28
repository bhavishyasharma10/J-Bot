import logger from "@/config/logger";
import Habit from "@/lib/models/Habit";
import HabitLog from "@/lib/models/HabitLog";
import { Op } from "sequelize";

class HabitService {
    static async handleHabitCommand(userId: string, content: string): Promise<string> {
        try {
            const parts = content.trim().split(" ");
            const action = parts[0].toLowerCase();

            switch (action) {
                case 'add':
                    return await this.addHabit(userId, parts.slice(1).join(" "));
                case 'complete':
                    return await this.completeHabit(userId, parts.slice(1).join(" "));
                case 'list':
                    return await this.listHabits(userId);
                default:
                    return "❌ Invalid habit command. Use: add, complete, or list";
            }
        } catch (error) {
            logger.error('Error handling habit command:', error);
            return "❌ Sorry, I encountered an error while processing your request.";
        }
    }

    private static async addHabit(userId: string, content: string): Promise<string> {
        const [name, category] = content.split(" in ").map(s => s.trim());
        if (!name || !category) {
            return "❌ Please provide habit name and category. Format: add [habit name] in [category]";
        }

        const validCategories = ['health', 'productivity', 'learning', 'lifestyle'];
        if (!validCategories.includes(category.toLowerCase())) {
            return "❌ Invalid category. Use: health, productivity, learning, or lifestyle";
        }

        await Habit.create({
            user_id: userId,
            name,
            category: category.toLowerCase(),
            frequency: 'daily'
        });

        return `✅ Habit "${name}" added to ${category} category!`;
    }

    private static async completeHabit(userId: string, habitName: string): Promise<string> {
        const habit = await Habit.findOne({
            where: {
                user_id: userId,
                name: habitName,
                is_active: true
            }
        });

        if (!habit) {
            return "❌ Habit not found or already completed today.";
        }

        await HabitLog.create({
            habit_id: habit.id,
            user_id: userId
        });

        return `✅ Habit "${habitName}" marked as completed!`;
    }

    private static async listHabits(userId: string): Promise<string> {
        const habits = await Habit.findAll({
            where: {
                user_id: userId,
                is_active: true
            },
            include: [{
                model: HabitLog,
                where: {
                    completed_at: {
                        [Op.gte]: new Date().setHours(0, 0, 0, 0)
                    }
                },
                required: false
            }],
            order: [['category', 'ASC'], ['name', 'ASC']]
        });

        if (habits.length === 0) {
            return "📝 No active habits found. Add some habits to get started!";
        }

        let response = "📝 Your Habits:\n\n";
        let currentCategory = "";

        for (const habit of habits) {
            if (habit.category !== currentCategory) {
                currentCategory = habit.category;
                response += `\n${currentCategory.toUpperCase()}:\n`;
            }
            const completedToday = habit.habit_logs!.length > 0;
            response += `• ${habit.name} ${completedToday ? "✅" : ""}\n`;
        }

        return response;
    }
}

export default HabitService; 