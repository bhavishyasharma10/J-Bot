import { Sequelize } from 'sequelize';
import logger from './logger';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.MYSQL_PUBLIC_URL ?? 'mysql://root:@localhost:3306/journalbot', {
    dialect: 'mysql',
    logging: (msg: string) => logger.debug(msg),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export async function initializeDatabase(): Promise<void> {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully.');
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        throw error;
    }
}

export default sequelize;
