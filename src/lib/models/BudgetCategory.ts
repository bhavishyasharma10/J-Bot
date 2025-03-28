import { Model, DataTypes } from 'sequelize';
import Database from '@/config/database';
import User from './User';
import BudgetTransaction from './BudgetTransaction';
import BudgetGoal from './BudgetGoal';

class BudgetCategory extends Model {
    public id!: number;
    public user_id!: string;
    public name!: string;
    public type!: 'income' | 'expense';
    public parent_id?: number;
    public readonly created_at!: Date;

    // Associations
    public readonly user?: User;
    public readonly parent?: BudgetCategory;
    public readonly children?: BudgetCategory[];
    public readonly transactions?: BudgetTransaction[];
    public readonly budget_goals?: BudgetGoal[];
}

BudgetCategory.init({
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
        type: DataTypes.STRING(50),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false
    },
    parent_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'budget_categories',
            key: 'id'
        }
    }
}, {
    sequelize: Database.getInstance().getSequelize(),
    tableName: 'budget_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'name']
        },
        {
            fields: ['user_id', 'type']
        }
    ]
});

// Define associations
BudgetCategory.belongsTo(User, { foreignKey: 'user_id' });
BudgetCategory.belongsTo(BudgetCategory, { as: 'parent', foreignKey: 'parent_id' });
BudgetCategory.hasMany(BudgetCategory, { as: 'children', foreignKey: 'parent_id' });

export default BudgetCategory; 