import { initializeDatabase } from './database';
import { User, Reminder, JournalEntry, Task, RawUserInput } from '@/lib/models';

async function setupDatabase(): Promise<void> {
    try {
        // Initialize database connection
        await initializeDatabase();

        // Sync all models with the database
        await Promise.all([
            User.sync(),
            Reminder.sync(),
            JournalEntry.sync(),
            Task.sync(),
            RawUserInput.sync()
        ]);

        console.log('Database setup completed successfully');
    } catch (error) {
        console.error('Database setup failed:', error);
        throw error;
    }
}

// Run setup if this file is executed directly
if (process.argv[1] === __filename) {
    setupDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export default setupDatabase; 