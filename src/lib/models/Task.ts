import { Model, DataTypes } from 'sequelize';
import sequelize from '@/config/database';
import { TaskAttributes, TaskAssociations } from '@/lib/types/models';

class Task extends Model<TaskAttributes> implements TaskAttributes {
    public id!: number;
    public user_id!: number;
    public category!: 'work' | 'personal' | 'family';
    public content!: string;
    public status!: 'pending' | 'completed';
    public raw_input_id!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Define associations
    public static associations: TaskAssociations;
}

Task.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('work', 'personal', 'family'),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
    },
    raw_input_id: {
        type: DataTypes.BIGINT
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    tableName: 'Tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Task; 