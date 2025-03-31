type JournalEntryType = "highlight" | "thought" | "gratitude" | "reflection" | "affirmation";

export interface JournalEntry {
    id?: string;
    userId: string;
    type: JournalEntryType;
    content: string;
    tags?: string[];
    createdAt?: Date;
}
