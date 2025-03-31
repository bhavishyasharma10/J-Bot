import { Model, DataTypes } from 'sequelize';
import sequelize from '@/config/database';
import { UserAttributes, UserAssociations } from '@/lib/types/models';

class User extends Model<UserAttributes> implements UserAttributes {
    public id!: number;
    public google_id!: string;
    public whatsapp_number!: string;
    public email!: string;
    public name!: string;
    public profile_photo!: string;
    public readonly created_at!: Date;

    // Define associations
    public static associations: UserAssociations;
}

User.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    google_id: {
        type: DataTypes.STRING(255),
        unique: true
    },
    whatsapp_number: {
        type: DataTypes.STRING(15)
    },
    email: {
        type: DataTypes.STRING(255),
        unique: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    profile_photo: {
        type: DataTypes.TEXT
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    tableName: 'Users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

export default User; 