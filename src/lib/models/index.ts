import User from './User';
import Habit from './Habit';
import HabitLog from './HabitLog';
import MoodTracking from './MoodTracking';
import BudgetCategory from './BudgetCategory';
import BudgetTransaction from './BudgetTransaction';
import BudgetGoal from './BudgetGoal';

// Define associations
User.hasMany(Habit, { foreignKey: 'user_id' });
User.hasMany(HabitLog, { foreignKey: 'user_id' });
User.hasMany(MoodTracking, { foreignKey: 'user_id' });
User.hasMany(BudgetCategory, { foreignKey: 'user_id' });
User.hasMany(BudgetTransaction, { foreignKey: 'user_id' });
User.hasMany(BudgetGoal, { foreignKey: 'user_id' });

Habit.belongsTo(User, { foreignKey: 'user_id' });
Habit.hasMany(HabitLog, { foreignKey: 'habit_id' });

HabitLog.belongsTo(User, { foreignKey: 'user_id' });
HabitLog.belongsTo(Habit, { foreignKey: 'habit_id' });

MoodTracking.belongsTo(User, { foreignKey: 'user_id' });

BudgetCategory.belongsTo(User, { foreignKey: 'user_id' });
BudgetCategory.hasMany(BudgetTransaction, { foreignKey: 'category_id' });
BudgetCategory.hasMany(BudgetGoal, { foreignKey: 'category_id' });

BudgetTransaction.belongsTo(User, { foreignKey: 'user_id' });
BudgetTransaction.belongsTo(BudgetCategory, { foreignKey: 'category_id' });

BudgetGoal.belongsTo(User, { foreignKey: 'user_id' });
BudgetGoal.belongsTo(BudgetCategory, { foreignKey: 'category_id' });

export {
    User,
    Habit,
    HabitLog,
    MoodTracking,
    BudgetCategory,
    BudgetTransaction,
    BudgetGoal
}; 