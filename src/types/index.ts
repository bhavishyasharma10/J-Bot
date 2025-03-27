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
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export interface JournalEntry {
    id: number;
    user_id: string;
    content: string;
    created_at: Date;
} 