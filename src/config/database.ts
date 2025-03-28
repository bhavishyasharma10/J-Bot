import { Sequelize } from 'sequelize';
import logger from './logger';
import env from './env';

// Import mysql2 explicitly to ensure it's loaded
import 'mysql2';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

class Database {
    private static instance: Database;
    private sequelize: Sequelize;
    private isInitialized: boolean = false;

    private constructor() {
        this.sequelize = new Sequelize({
            host: env.DB_HOST,
            port: env.DB_PORT,
            database: env.DB_NAME,
            username: env.DB_USER,
            password: env.DB_PASSWORD,
            dialect: 'mysql',
            logging: (msg) => logger.debug(msg),
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            dialectOptions: {
                connectTimeout: 60000
            }
        });
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        let retries = 0;
        while (retries < MAX_RETRIES) {
            try {
                await this.sequelize.authenticate();
                logger.info('Database connection established successfully.');
                this.isInitialized = true;
                return;
            } catch (error) {
                retries++;
                logger.error(`Database connection attempt ${retries} failed:`, error);
                
                if (retries === MAX_RETRIES) {
                    logger.error('Max retries reached. Unable to connect to the database.');
                    throw new Error('Failed to connect to the database after multiple attempts');
                }
                
                logger.info(`Retrying connection in ${RETRY_DELAY/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
        }
    }

    public getSequelize(): Sequelize {
        if (!this.isInitialized) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.sequelize;
    }

    public async close(): Promise<void> {
        if (this.isInitialized) {
            await this.sequelize.close();
            this.isInitialized = false;
            logger.info('Database connection closed.');
        }
    }
}

export default Database;
