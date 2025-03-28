import { Model, DataTypes } from 'sequelize';
import Database from '@/config/database';
import User from './User';
import BudgetCategory from './BudgetCategory';

class BudgetTransaction extends Model {
    public id!: number;
    public user_id!: string;
    public category_id!: number;
    public amount!: number;
    public description?: string;
    public transaction_date!: Date;
    public payment_method?: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';
    public is_recurring!: boolean;
    public recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Associations
    public readonly user?: User;
    public readonly category?: BudgetCategory;
}

BudgetTransaction.init({
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
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: BudgetCategory,
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    transaction_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    payment_method: {
        type: DataTypes.ENUM('cash', 'card', 'upi', 'bank_transfer', 'other')
    },
    is_recurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    recurring_frequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly')
    }
}, {
    sequelize: Database.getInstance().getSequelize(),
    tableName: 'budget_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['user_id', 'transaction_date']
        },
        {
            fields: ['category_id']
        }
    ]
});

// Define associations
BudgetTransaction.belongsTo(User, { foreignKey: 'user_id' });
BudgetTransaction.belongsTo(BudgetCategory, { foreignKey: 'category_id' });

export default BudgetTransaction; 