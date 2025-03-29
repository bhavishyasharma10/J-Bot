import mysql from 'mysql2/promise';
import { DatabaseConfig } from '@/lib/types';
import logger from '@/config/logger';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: DatabaseConfig = {
    uri: process.env.MYSQL_PUBLIC_URL || ''
};

if (!dbConfig.uri) {
    logger.error('❌ Missing MYSQL_PUBLIC_URL. Please check your environment variables.');
    process.exit(1);
}

// Log configuration (without exposing sensitive data)
logger.info('Database Configuration:', {
    host: 'Using MYSQL_PUBLIC_URL',
    uri: dbConfig.uri ? 'Set' : 'Not Set'
});

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig.uri);

// Function to test connection
async function testConnection(): Promise<void> {
    try {
        const connection = await pool.getConnection();
        logger.info('✅ Connected to MySQL!');
        connection.release();
    } catch (err: any) {
        logger.error('❌ MySQL connection failed:', {
            message: err.message,
            code: err.code
        });
        process.exit(1);
    }
}

// Test connection immediately
testConnection();

export default pool;
