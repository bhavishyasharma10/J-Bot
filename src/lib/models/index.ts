import User from './User';
import Reminder from './Reminder';
import JournalEntry from './JournalEntry';
import Task from './Task';
import RawUserInput from './RawUserInput';

// Define associations
User.hasMany(Reminder, { foreignKey: 'user_id' });
User.hasMany(JournalEntry, { foreignKey: 'user_id' });
User.hasMany(Task, { foreignKey: 'user_id' });
User.hasMany(RawUserInput, { foreignKey: 'user_id' });

Reminder.belongsTo(User, { foreignKey: 'user_id' });
JournalEntry.belongsTo(User, { foreignKey: 'user_id' });
Task.belongsTo(User, { foreignKey: 'user_id' });
RawUserInput.belongsTo(User, { foreignKey: 'user_id' });

Task.belongsTo(RawUserInput, { foreignKey: 'raw_input_id' });
RawUserInput.hasOne(Task, { foreignKey: 'raw_input_id' });

export {
    User,
    Reminder,
    JournalEntry,
    Task,
    RawUserInput
}; 