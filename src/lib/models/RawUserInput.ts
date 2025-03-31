import { Model, DataTypes } from 'sequelize';
import sequelize from '@/config/database';
import { RawUserInputAttributes, RawUserInputAssociations } from '@/lib/types/models';

class RawUserInput extends Model<RawUserInputAttributes> implements RawUserInputAttributes {
    public id!: number;
    public user_id!: number;
    public raw_text!: string;
    public metadata!: any;
    public processed!: boolean;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Define associations
    public static associations: RawUserInputAssociations;
}

RawUserInput.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    raw_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSON
    },
    processed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    tableName: 'RawUserInputs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default RawUserInput; 