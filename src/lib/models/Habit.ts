import { Model, DataTypes } from 'sequelize';
import Database from '@/config/database';
import User from './User';
import HabitLog from './HabitLog';

class Habit extends Model {
    public id!: number;
    public user_id!: string;
    public name!: string;
    public description?: string;
    public frequency!: 'daily' | 'weekly' | 'monthly';
    public target_count!: number;
    public category!: 'health' | 'productivity' | 'learning' | 'lifestyle';
    public is_active!: boolean;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Associations
    public readonly user?: User;
    public readonly habit_logs?: HabitLog[];
}

Habit.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    frequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
        allowNull: false
    },
    target_count: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    category: {
        type: DataTypes.ENUM('health', 'productivity', 'learning', 'lifestyle'),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: Database.getInstance().getSequelize(),
    tableName: 'habits',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['user_id', 'category']
        },
        {
            fields: ['is_active']
        }
    ]
});

// Define associations
Habit.belongsTo(User, { foreignKey: 'user_id' });

export default Habit; 