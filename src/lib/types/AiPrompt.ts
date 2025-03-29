import { JournalEntry } from "./JournalEntry";
import { Reminder } from "./Reminder";
import { Task } from "./Task";

export type AIAction = 
    | { type: "journal"; data: Omit<JournalEntry, "id" | "userId" | "createdAt"> }
    | { type: "task"; data: Omit<Task, "id" | "userId" | "createdAt" | "rawInputId"> }
    | { type: "reminder"; data: Omit<Reminder, "id" | "userId" | "createdAt" | "rawInputId"> };

export interface AIResponse {
    actions: AIAction[];
}
