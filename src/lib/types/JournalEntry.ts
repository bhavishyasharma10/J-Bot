export enum JournalEntryType {
    HIGHLIGHT = "highlight",
    THOUGHT = "thought",
    GRATITUDE = "gratitude",
    REFLECTION = "reflection",
    AFFIRMATION = "affirmation"
}

export interface JournalEntry {
    id?: string;
    userId: string;
    type: JournalEntryType;
    content: string;
    tags?: string[];
    createdAt?: Date;
}
