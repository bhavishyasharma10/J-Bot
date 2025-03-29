export interface Reminder {
    id?: string;
    userId: string;
    text: string;
    time: string; // Store in UTC ISO string format
    rawInputId?: string;
    createdAt?: Date;
}