export interface Task {
    id?: string;
    userId: string;
    category: TaskCategory;
    content: string;
    status: TaskStatus;
    rawInputId?: string;
    createdAt?: Date;
}
export type TaskCategory = 'work' | 'personal' | 'family';
export type TaskStatus = 'pending' | 'completed';
export type TaskAction = "add" | "complete" | "list";
export interface IHandleTask extends Task {
    action: TaskAction;
}