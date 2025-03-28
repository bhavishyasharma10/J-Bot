import logger from "@/config/logger";
import BudgetCategory from "@/lib/models/BudgetCategory";
import BudgetTransaction from "@/lib/models/BudgetTransaction";
import BudgetGoal from "@/lib/models/BudgetGoal";
import { Op } from "sequelize";

class BudgetService {
    static async handleBudgetCommand(userId: string, content: string): Promise<string> {
        try {
            const parts = content.trim().split(" ");
            const action = parts[0].toLowerCase();

            switch (action) {
                case 'expense':
                    return await this.addExpense(userId, parts.slice(1).join(" "));
                case 'income':
                    return await this.addIncome(userId, parts.slice(1).join(" "));
                case 'goal':
                    return await this.setBudgetGoal(userId, parts.slice(1).join(" "));
                case 'summary':
                    return await this.getBudgetSummary(userId);
                default:
                    return "❌ Invalid budget command. Use: expense, income, goal, or summary";
            }
        } catch (error) {
            logger.error('Error handling budget command:', error);
            return "❌ Sorry, I encountered an error while processing your request.";
        }
    }

    private static async addExpense(userId: string, content: string): Promise<string> {
        const [amount, categoryName, ...descriptionParts] = content.split(" ");
        const description = descriptionParts.join(" ");

        if (!amount || !categoryName) {
            return "❌ Please provide amount and category. Format: expense [amount] [category] [description]";
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return "❌ Please provide a valid amount";
        }

        let category = await BudgetCategory.findOne({
            where: {
                user_id: userId,
                name: categoryName,
                type: 'expense'
            }
        });

        if (!category) {
            category = await BudgetCategory.create({
                user_id: userId,
                name: categoryName,
                type: 'expense'
            });
        }

        await BudgetTransaction.create({
            user_id: userId,
            category_id: category.id,
            amount: numericAmount,
            description: description || undefined,
            transaction_date: new Date(),
            payment_method: 'cash'
        });

        return `✅ Expense of ${numericAmount} added to ${categoryName} category!`;
    }

    private static async addIncome(userId: string, content: string): Promise<string> {
        const [amount, categoryName, ...descriptionParts] = content.split(" ");
        const description = descriptionParts.join(" ");

        if (!amount || !categoryName) {
            return "❌ Please provide amount and category. Format: income [amount] [category] [description]";
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return "❌ Please provide a valid amount";
        }

        let category = await BudgetCategory.findOne({
            where: {
                user_id: userId,
                name: categoryName,
                type: 'income'
            }
        });

        if (!category) {
            category = await BudgetCategory.create({
                user_id: userId,
                name: categoryName,
                type: 'income'
            });
        }

        await BudgetTransaction.create({
            user_id: userId,
            category_id: category.id,
            amount: numericAmount,
            description: description || undefined,
            transaction_date: new Date(),
            payment_method: 'bank_transfer'
        });

        return `✅ Income of ${numericAmount} added to ${categoryName} category!`;
    }

    private static async setBudgetGoal(userId: string, content: string): Promise<string> {
        const [categoryName, targetAmount, ...nameParts] = content.split(" ");
        const name = nameParts.join(" ");

        if (!categoryName || !targetAmount || !name) {
            return "❌ Please provide category, target amount, and goal name. Format: goal [category] [amount] [name]";
        }

        const numericAmount = parseFloat(targetAmount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return "❌ Please provide a valid target amount";
        }

        const category = await BudgetCategory.findOne({
            where: {
                user_id: userId,
                name: categoryName,
                type: 'expense'
            }
        });

        if (!category) {
            return "❌ Category not found. Please create the category first.";
        }

        await BudgetGoal.create({
            user_id: userId,
            category_id: category.id,
            name,
            target_amount: numericAmount,
            current_amount: 0,
            start_date: new Date(),
            end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            status: 'active'
        });

        return `✅ Budget goal "${name}" set for ${categoryName} category with target of ${numericAmount}!`;
    }

    private static async getBudgetSummary(userId: string): Promise<string> {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        const transactions = await BudgetTransaction.findAll({
            where: {
                user_id: userId,
                transaction_date: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            },
            include: [{
                model: BudgetCategory,
                attributes: ['name', 'type']
            }],
            order: [['transaction_date', 'DESC']]
        });

        const goals = await BudgetGoal.findAll({
            where: {
                user_id: userId,
                status: 'active'
            },
            include: [{
                model: BudgetCategory,
                attributes: ['name']
            }]
        });

        let response = "📊 Monthly Budget Summary:\n\n";

        // Calculate totals
        const income = transactions
            .filter(t => t.category?.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const expenses = transactions
            .filter(t => t.category?.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        response += `Income: ${income}\n`;
        response += `Expenses: ${expenses}\n`;
        response += `Balance: ${income - expenses}\n\n`;

        // Show active goals
        if (goals.length > 0) {
            response += "Active Goals:\n";
            for (const goal of goals) {
                const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
                response += `${goal.name} (${goal.category?.name}): ${goal.current_amount}/${goal.target_amount} (${progress.toFixed(1)}%)\n`;
            }
        }

        return response;
    }

    static async handleExpenseCommand(userId: string, content: string): Promise<string> {
        return this.addExpense(userId, content);
    }
    
    static async handleIncomeCommand(userId: string, content: string): Promise<string> {
        return this.addIncome(userId, content);
    }

    static async handleBudgetGoalCommand(userId: string, content: string): Promise<string> {
        return this.setBudgetGoal(userId, content);
    }
}

export default BudgetService; 