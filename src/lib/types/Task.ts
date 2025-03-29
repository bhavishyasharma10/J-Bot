export interface Task {
    id?: string;
    userId: string;
    category: "work" | "personal" | "family";
    content: string;
    status: "pending" | "completed";
    rawInputId?: string;
    createdAt?: Date;
}

export interface IHandleTask extends Task {
    action: string; // "add" | "complete" | "list",
    taskId?: string;
}