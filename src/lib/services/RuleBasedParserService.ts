class RuleBasedParserService {
    static parseMessage(message: string): any[] {
        const actions: any[] = [];

        // ✅ Detect Journal Entry (Mood or Notes)
        const journalRegex = /(?:log|write|record) (?:my )?(mood|note|journal) (?:as|about)? (.+)/i;
        const journalMatch = message.match(journalRegex);
        if (journalMatch) {
            actions.push({
                type: "journal",
                data: { type: journalMatch[1], content: journalMatch[2] }
            });
        }

        // ✅ Detect Reminder
        const reminderRegex = /(?:remind me|set an alert|alert me) (?:to|for)? (.+) at (\d{1,2}(:\d{2})?\s?(AM|PM)?|tomorrow|later)/i;
        const reminderMatch = message.match(reminderRegex);
        if (reminderMatch) {
            actions.push({
                type: "reminder",
                data: { text: reminderMatch[1], time: reminderMatch[2] }
            });
        }

        // ✅ Detect Task (To-Do)
        const taskRegex = /(?:add|put|create|work|personal|family)[: ](.+)/i;
        const taskMatch = message.match(taskRegex);
        if (taskMatch) {
            let category = "general";
            if (message.toLowerCase().includes("work")) category = "work";
            else if (message.toLowerCase().includes("personal")) category = "personal";
            else if (message.toLowerCase().includes("family")) category = "family";

            actions.push({
                type: "task",
                data: { title: taskMatch[1], category }
            });
        }

        return actions;
    }
}

export default RuleBasedParserService;
