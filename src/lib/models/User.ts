import { Model, DataTypes } from 'sequelize';
import Database from '@/config/database';

class User extends Model {
    public id!: string;
    public phone_number!: string;
    public email?: string;
    public google_id?: string;
    public name?: string;
    public avatar_url?: string;
    public auth_provider!: 'phone' | 'google' | 'both';
    public is_active!: boolean;
    public last_login_at?: Date;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

User.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    phone_number: {
        type: DataTypes.STRING(20),
        unique: true
    },
    email: {
        type: DataTypes.STRING(255),
        unique: true
    },
    google_id: {
        type: DataTypes.STRING(255),
        unique: true
    },
    name: {
        type: DataTypes.STRING(100)
    },
    avatar_url: {
        type: DataTypes.TEXT
    },
    auth_provider: {
        type: DataTypes.ENUM('phone', 'google', 'both'),
        defaultValue: 'phone'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_login_at: {
        type: DataTypes.DATE
    }
}, {
    sequelize: Database.getInstance().getSequelize(),
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['phone_number']
        },
        {
            unique: true,
            fields: ['email']
        },
        {
            unique: true,
            fields: ['google_id']
        }
    ]
});

export default User; 