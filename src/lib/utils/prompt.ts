export const buildPrompt = (message: string): string => {
    return `
        You are an AI that extracts structured data from user messages.
        Your task is to return ONLY valid JSON in the following format, without additional text or explanations.

        ---
        JSON SCHEMA:
        {
            "actions": [
                {
                    "type": "journal",
                    "data": {
                        "type": "thought",
                        "content": "Had a deep discussion about AI ethics",
                        "tags": ["AI", "ethics"]
                    }
                },
                {
                    "type": "task",
                    "data": {
                        "category": "work",
                        "content": "Finish the AI documentation",
                        "status": "pending"
                    }
                },
                {
                    "type": "reminder",
                    "data": {
                        "text": "Doctor's appointment tomorrow at 3 PM",
                        "time": "2023-10-01T15:00:00Z"
                    }
                }
            ]
        }
        ---

        You MUST return JSON formatted exactly as per this schema.

        Now, parse the following message into an AIResponse object:

        Message: "${message}"

        Respond with JSON only:
    `;
}
