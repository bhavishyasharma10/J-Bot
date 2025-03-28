import { Model, DataTypes } from 'sequelize';
import Database from '@/config/database';
import User from './User';
import Habit from './Habit';

class HabitLog extends Model {
    public id!: number;
    public habit_id!: number;
    public user_id!: string;
    public completed_at!: Date;
    public notes?: string;
    public readonly created_at!: Date;

    // Associations
    public readonly habit?: Habit;
    public readonly user?: User;
}

HabitLog.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    habit_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Habit,
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    completed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    sequelize: Database.getInstance().getSequelize(),
    tableName: 'habit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            fields: ['habit_id', 'completed_at']
        }
    ]
});

// Define associations
HabitLog.belongsTo(Habit, { foreignKey: 'habit_id' });
HabitLog.belongsTo(User, { foreignKey: 'user_id' });
Habit.hasMany(HabitLog, { foreignKey: 'habit_id' });

export default HabitLog; 