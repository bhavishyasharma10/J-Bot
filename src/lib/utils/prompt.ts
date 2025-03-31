export const buildPrompt = (message: string): string => {
    return `
        You are an AI assistant helping users journal, set tasks, and set reminders.
        Your task is to return ONLY valid JSON in the following format, without additional text or explanations.
        You will receive a message from the user, and you need to parse it into an AIResponse object.
        
        type JournalEntryType = "highlight" | "thought" | "gratitude" | "reflection" | "affirmation";

        interface JournalEntry {
            type: JournalEntryType;
            content: string;
            tags: string[]; // Metadata used by AI for context
        }

        interface Task {
            category: "work" | "personal" | "family";
            content: string;
            status: "pending" | "completed";
            tags: string[]; // Metadata used by AI for context
        }

        type TaskAction = "add" | "complete" | "list";
        
        interface IHandleTask extends Task {
            action: TaskAction;
        }

        interface Reminder {
            text: string;
            time: string; // Date and time in ISO format (IST timezone: YYYY-MM-DDTHH:mm:ss+05:30)
            tags: string[]; // Metadata used by AI for context
        }

        type AIAction = 
            | { type: "journal"; data: JournalEntry }
            | { type: "task"; data: IHandleTask }
            | { type: "reminder"; data: Reminder };

        interface AIResponse {
            actions: AIAction[];
        }

        ## **Date and Time Handling**
        - **Always use the current year unless the user specifies a different year.**
        - **For relative dates:**
          - "tomorrow" → The next day from today's date.
          - "Friday" → The upcoming Friday (not past).
        - **For reminders:**
          - If only a **date** is provided → Set time to **00:00:00 IST**.
          - If only a **time** is provided → Assume the **current date in IST**.
          - If both are missing → Do not create the reminder.

        Notes:
        - Journal entries must include **tags** for metadata, allowing future AI context tracking.

        Now, parse the following message into an AIResponse object:

        Message: "${message}"

        Respond with JSON only:
    `;
}
