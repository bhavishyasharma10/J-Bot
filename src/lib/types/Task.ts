export interface Task {
    id?: string;
    userId: string;
    category: "work" | "personal" | "family";
    content: string;
    status: "pending" | "completed";
    rawInputId?: string;
    createdAt?: Date;
}

export enum TaskAction {
    ADD = "add",
    COMPLETE = "complete",
    LIST = "list",
}
export interface IHandleTask extends Task {
    action: TaskAction;
}