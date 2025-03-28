import { Model, DataTypes } from 'sequelize';
import Database from '@/config/database';
import User from './User';
import BudgetCategory from './BudgetCategory';

class BudgetGoal extends Model {
    public id!: number;
    public user_id!: string;
    public category_id!: number;
    public name!: string;
    public target_amount!: number;
    public current_amount!: number;
    public start_date!: Date;
    public end_date!: Date;
    public status!: 'active' | 'completed' | 'failed';
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Associations
    public readonly user?: User;
    public readonly category?: BudgetCategory;
}

BudgetGoal.init({
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
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    target_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    current_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'failed'),
        defaultValue: 'active'
    }
}, {
    sequelize: Database.getInstance().getSequelize(),
    tableName: 'budget_goals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['user_id', 'status']
        },
        {
            fields: ['start_date', 'end_date']
        }
    ]
});

// Define associations
BudgetGoal.belongsTo(User, { foreignKey: 'user_id' });
BudgetGoal.belongsTo(BudgetCategory, { foreignKey: 'category_id' });

export default BudgetGoal; 