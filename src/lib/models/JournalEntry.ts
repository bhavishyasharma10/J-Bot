import { Model, DataTypes } from 'sequelize';
import sequelize from '@/config/database';
import { JournalEntryAttributes, JournalEntryAssociations } from '@/lib/types/models';
import User from './User';

class JournalEntry extends Model<JournalEntryAttributes> implements JournalEntryAttributes {
    public id!: number;
    public user_id!: number;
    public type!: string;
    public content!: string;
    public tags!: any;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Define associations
    public static associations: JournalEntryAssociations;
}

JournalEntry.init({
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
    type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    tags: {
        type: DataTypes.JSON
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
    tableName: 'JournalEntries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default JournalEntry; 