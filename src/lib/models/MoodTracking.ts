import { Model, DataTypes } from 'sequelize';
import Database from '@/config/database';
import User from './User';

class MoodTracking extends Model {
    public id!: number;
    public user_id!: string;
    public mood_score!: number;
    public energy_level?: number;
    public stress_level?: number;
    public notes?: string;
    public factors?: string[];
    public entry_date!: Date;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Associations
    public readonly user?: User;
}

MoodTracking.init({
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
    mood_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    energy_level: {
        type: DataTypes.INTEGER,
        validate: {
            min: 1,
            max: 5
        }
    },
    stress_level: {
        type: DataTypes.INTEGER,
        validate: {
            min: 1,
            max: 5
        }
    },
    notes: {
        type: DataTypes.TEXT
    },
    factors: {
        type: DataTypes.JSON,
        get() {
            const value = this.getDataValue('factors');
            return value ? JSON.parse(value) : null;
        },
        set(value) {
            this.setDataValue('factors', value ? JSON.stringify(value) : null);
        }
    },
    entry_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    sequelize: Database.getInstance().getSequelize(),
    tableName: 'mood_tracking',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['user_id', 'entry_date']
        }
    ]
});

// Define associations
MoodTracking.belongsTo(User, { foreignKey: 'user_id' });

export default MoodTracking; 