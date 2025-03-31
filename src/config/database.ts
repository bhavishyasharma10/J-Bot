import { Sequelize } from 'sequelize';
import logger from './logger';
import dotenv from 'dotenv';
import mysql2 from 'mysql2';

dotenv.config();

const sequelize = new Sequelize(process.env.MYSQL_PUBLIC_URL ?? 'mysql://root:@localhost:3306/journalbot', {
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: (msg: string) => logger.debug(msg),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        underscored: true
    }
});

export async function initializeDatabase(): Promise<void> {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully.');
        
        // Sync all models
        await sequelize.sync();
        logger.info('Database models synchronized successfully.');
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        throw error;
    }
}

export default sequelize;
