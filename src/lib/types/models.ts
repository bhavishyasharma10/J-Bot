import { Model, Association } from 'sequelize';

export interface UserAttributes {
    id: number;
    google_id: string;
    whatsapp_number: string;
    email: string;
    name: string;
    profile_photo: string;
    created_at: Date;
}

export interface ReminderAttributes {
    id: number;
    user_id: number;
    reminder_text: string;
    reminder_time: Date;
    target_id: number;
    status: 'pending' | 'triggered';
    created_at: Date;
    updated_at: Date;
}

export interface JournalEntryAttributes {
    id: number;
    user_id: number;
    type: string;
    content: string;
    tags: any;
    created_at: Date;
    updated_at: Date;
}

export interface TaskAttributes {
    id: number;
    user_id: number;
    category: 'work' | 'personal' | 'family';
    content: string;
    status: 'pending' | 'completed';
    raw_input_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface RawUserInputAttributes {
    id: number;
    user_id: number;
    raw_text: string;
    metadata: any;
    processed: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface UserAssociations {
    [key: string]: Association<Model<UserAttributes>, Model<any, any>>;
    reminders: Association<Model<UserAttributes>, Model<ReminderAttributes>>;
    journalEntries: Association<Model<UserAttributes>, Model<JournalEntryAttributes>>;
    tasks: Association<Model<UserAttributes>, Model<TaskAttributes>>;
    rawInputs: Association<Model<UserAttributes>, Model<RawUserInputAttributes>>;
}

export interface ReminderAssociations {
    [key: string]: Association<Model<ReminderAttributes>, Model<any, any>>;
    user: Association<Model<ReminderAttributes>, Model<UserAttributes>>;
}

export interface JournalEntryAssociations {
    [key: string]: Association<Model<JournalEntryAttributes>, Model<any, any>>;
    user: Association<Model<JournalEntryAttributes>, Model<UserAttributes>>;
}

export interface TaskAssociations {
    [key: string]: Association<Model<TaskAttributes>, Model<any, any>>;
    user: Association<Model<TaskAttributes>, Model<UserAttributes>>;
    rawInput: Association<Model<TaskAttributes>, Model<RawUserInputAttributes>>;
}

export interface RawUserInputAssociations {
    [key: string]: Association<Model<RawUserInputAttributes>, Model<any, any>>;
    user: Association<Model<RawUserInputAttributes>, Model<UserAttributes>>;
    task: Association<Model<RawUserInputAttributes>, Model<TaskAttributes>>;
} 