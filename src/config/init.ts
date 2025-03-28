import Database from './database';
import logger from './logger';

export async function initializeDatabase(): Promise<void> {
    try {
        const db = Database.getInstance();
        await db.initialize();
        logger.info('Database initialization completed successfully.');
    } catch (error) {
        logger.error('Failed to initialize database:', error);
        throw error;
    }
}

export async function closeDatabase(): Promise<void> {
    try {
        const db = Database.getInstance();
        await db.close();
        logger.info('Database connection closed successfully.');
    } catch (error) {
        logger.error('Error closing database connection:', error);
        throw error;
    }
} 