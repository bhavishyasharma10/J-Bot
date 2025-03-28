import mysql from 'mysql2';
import { DatabaseConfig } from '../types';
import logger from './logger';

const dbConfig: DatabaseConfig = {
    uri: process.env.MYSQL_PUBLIC_URL as string
};

// Log configuration (without sensitive data)
logger.info('Database Configuration:', {
    host: 'Using MYSQL_PUBLIC_URL',
    uri: dbConfig.uri ? 'Set' : 'Not Set'
});

// Create connection with promise wrapper
const connection = mysql.createConnection(dbConfig.uri);

// Function to test connection
async function testConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
        connection.connect((err: mysql.QueryError | null) => {
            if (err) {
                logger.error('❌ MySQL connection failed:', {
                    error: err.message,
                    code: err.code,
                    errno: err.errno,
                    sqlState: err.sqlState
                });
                reject(err);
                return;
            }
            logger.info('✅ Connected to MySQL!');
            resolve();
        });
    });
}

// Test connection immediately
testConnection().catch(err => {
    logger.error('Failed to establish database connection:', err);
    process.exit(1);
});

export default connection;
