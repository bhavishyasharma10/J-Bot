export interface WhatsAppMessage {
    Body: string;
    From: string;
    SmsMessageSid?: string;
    NumMedia?: string;
    ProfileName?: string;
    MessageType?: string;
    SmsSid?: string;
    WaId?: string;
    SmsStatus?: string;
    To?: string;
    NumSegments?: string;
    ReferralNumMedia?: string;
    MessageSid?: string;
    AccountSid?: string;
    ApiVersion?: string;
}

export interface DatabaseConfig {
    uri: string;
}

export interface JournalEntry {
    id: number;
    user_id: string;
    content: string;
    created_at: Date;
}

export interface TodoItem {
    id: number;
    user_id: string;
    category: 'work' | 'family' | 'self_care';
    content: string;
    is_completed: boolean;
    created_at: Date;
}

export type MessageType = 
    | 'HIGHLIGHT'
    | 'THOUGHT'
    | 'IDEA'
    | 'AFFIRMATION'
    | 'GRATITUDE'
    | 'REFLECTION'
    | 'TODO';

export interface TodoListCommand {
    category: 'work' | 'family' | 'self_care';
    action: 'add' | 'complete' | 'list';
    content?: string;
}

export interface Intent {
    id: number;
    name: string;
    description: string;
    category: string;
    handler: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface IntentPattern {
    id: number;
    intent_id: number;
    pattern: string;
    created_at: Date;
}

export interface IntentHandler {
    name: string;
    execute: (userId: string, content: string) => Promise<string>;
}

export interface ParsedIntent {
    intent: string;
    category: string;
    content: string;
    confidence: number;
} 