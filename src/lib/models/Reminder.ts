import { Model, DataTypes } from 'sequelize';
import sequelize from '@/config/database';
import { ReminderAttributes, ReminderAssociations } from '@/lib/types/models';
import User from './User';

class Reminder extends Model<ReminderAttributes> implements ReminderAttributes {
    public id!: number;
    public user_id!: number;
    public reminder_text!: string;
    public reminder_time!: Date;
    public target_id!: number;
    public status!: 'pending' | 'triggered';
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Define associations
    public static associations: ReminderAssociations = {
        user: Reminder.belongsTo(User, { foreignKey: 'user_id' })
    };
}

Reminder.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    reminder_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    reminder_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    target_id: {
        type: DataTypes.BIGINT
    },
    status: {
        type: DataTypes.ENUM('pending', 'triggered'),
        allowNull: false,
        defaultValue: 'pending'
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
    tableName: 'Reminders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Reminder; 