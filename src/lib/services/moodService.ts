import logger from "@/config/logger";
import MoodTracking from "@/lib/models/MoodTracking";
import { Op } from "sequelize";

class MoodService {
    static async handleMoodCommand(userId: string, content: string): Promise<string> {
        try {
            const parts = content.trim().split(" ");
            const action = parts[0].toLowerCase();

            switch (action) {
                case 'track':
                    return await this.trackMood(userId, parts.slice(1).join(" "));
                case 'view':
                    return await this.viewMoodHistory(userId);
                default:
                    return "❌ Invalid mood command. Use: track or view";
            }
        } catch (error) {
            logger.error('Error handling mood command:', error);
            return "❌ Sorry, I encountered an error while processing your request.";
        }
    }

    private static async trackMood(userId: string, content: string): Promise<string> {
        const [moodScore, energyLevel, stressLevel, ...notesParts] = content.split(" ");
        const notes = notesParts.join(" ");

        if (!moodScore) {
            return "❌ Please provide your mood score (1-5). Format: track [mood] [energy] [stress] [notes]";
        }

        const score = parseInt(moodScore);
        if (isNaN(score) || score < 1 || score > 5) {
            return "❌ Mood score must be between 1 and 5";
        }

        const energy = energyLevel ? parseInt(energyLevel) : undefined;
        const stress = stressLevel ? parseInt(stressLevel) : undefined;

        if ((energy && (energy < 1 || energy > 5)) || (stress && (stress < 1 || stress > 5))) {
            return "❌ Energy and stress levels must be between 1 and 5";
        }

        await MoodTracking.create({
            user_id: userId,
            mood_score: score,
            energy_level: energy,
            stress_level: stress,
            notes: notes || undefined,
            entry_date: new Date()
        });

        return `✅ Mood tracked successfully! Score: ${score}${energy ? `, Energy: ${energy}` : ''}${stress ? `, Stress: ${stress}` : ''}`;
    }

    private static async viewMoodHistory(userId: string): Promise<string> {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const moods = await MoodTracking.findAll({
            where: {
                user_id: userId,
                entry_date: {
                    [Op.gte]: startOfWeek
                }
            },
            order: [['entry_date', 'DESC']]
        });

        if (moods.length === 0) {
            return "📊 No mood entries found for this week.";
        }

        let response = "📊 Your Mood History:\n\n";
        for (const mood of moods) {
            const date = new Date(mood.entry_date).toLocaleDateString();
            response += `${date}:\n`;
            response += `Mood: ${mood.mood_score}/5`;
            if (mood.energy_level) response += ` | Energy: ${mood.energy_level}/5`;
            if (mood.stress_level) response += ` | Stress: ${mood.stress_level}/5`;
            if (mood.notes) response += `\nNotes: ${mood.notes}`;
            response += "\n\n";
        }

        return response;
    }
}

export default MoodService; 