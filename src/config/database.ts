import mysql from 'mysql2';
import { DatabaseConfig } from '../types';
import logger from './logger';

const dbConfig: DatabaseConfig = {
    host: process.env.DB_HOST as string,
    port: parseInt(process.env.DB_PORT as string, 10),
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string
};

// Log configuration (without sensitive data)
logger.info('Database Configuration:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    passwordSet: !!dbConfig.password
});

// Create connection with promise wrapper
const connection = mysql.createConnection(dbConfig);

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