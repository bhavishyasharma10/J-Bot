export interface Task {
    id?: string;
    userId: string;
    category: "work" | "personal" | "family";
    content: string;
    status: "pending" | "completed";
    rawInputId?: string;
    createdAt?: Date;
}

type TaskAction = "add" | "complete" | "list";
export interface IHandleTask extends Task {
    action: TaskAction;
}