import fs from 'fs';
import path from 'path';
import db from './database';
import logger from './logger';

async function setupDatabase(): Promise<void> {
    try {
        // Read the SQL file
        const sqlFile = path.join(__dirname, 'setup.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Split SQL into individual statements
        const statements = sql
            .split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);

        // Execute each statement separately
        for (const statement of statements) {
            await db.promise().query(statement);
            logger.info(`Executed SQL statement: ${statement.substring(0, 50)}...`);
        }

        logger.info('Database setup completed successfully');
    } catch (error) {
        logger.error('Database setup failed:', error);
        throw error;
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export default setupDatabase; 