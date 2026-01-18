// src/services/user.service.ts

import User, { IUser } from '../models/User';
import Progress from '../models/Progress';

export class UserService {
    /**
     * Convert thumbs score to numeric value (0-100)
     */
    static scoreToNumeric(score: string): number {
        const scoreMap: Record<string, number> = {
            'thumbs-up': 100,
            'thumbs-sideways': 50,
            'thumbs-down': 0
        };
        return scoreMap[score] || 0;
    }

    /**
     * Update user stats after completing a practice
     */
    static async updateUserStats(
        userId: string,
        analysisScores: {
            facial_expression: number;
            eye_contact: number;
            body_language: number;
            tone: number;
        }
    ): Promise<IUser | null> {
        try {
            const user = await User.findById(userId);
            if (!user) {
                console.error('User not found:', userId);
                return null;
            }

            // Get current count before incrementing (for the average calculation)
            const n = user.stats.scenariosCompleted || 0;

            // Formula: NewAvg = ((OldAvg * n) + NewScore) / (n + 1)
            const updateAvg = (oldAvg: number, newScore: number) => {
                return ((oldAvg || 0) * n + newScore) / (n + 1);
            };

            user.skills.facialExpression = updateAvg(user.skills.facialExpression, analysisScores.facial_expression);
            user.skills.toneControl = updateAvg(user.skills.toneControl, analysisScores.tone);
            user.skills.eyeContact = updateAvg(user.skills.eyeContact, analysisScores.eye_contact);
            user.skills.bodyLanguage = updateAvg(user.skills.bodyLanguage, analysisScores.body_language);

            // Update scenarios completed count
            user.stats.scenariosCompleted = n + 1;

            // Calculate overall empathy score (average of all skills)
            user.stats.overallEmpathyScore = (
                user.skills.facialExpression +
                user.skills.toneControl +
                user.skills.eyeContact +
                user.skills.bodyLanguage
            ) / 4;

            // Update streak tracking
            await this.updateStreak(user);

            await user.save();
            return user;
        } catch (error) {
            console.error('Error updating user stats:', error);
            throw error;
        }
    }

    /**
     * Update user's practice streak
     */
    static async updateStreak(user: IUser): Promise<void> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            // Check if there's a progress entry for today
            const todayProgress = await Progress.findOne({
                userId: user._id,
                date: { $gte: today }
            });

            // If already practiced today, don't update streak
            if (todayProgress) {
                return;
            }

            // Check if there's a progress entry for yesterday
            const yesterdayProgress = await Progress.findOne({
                userId: user._id,
                date: { $gte: yesterday, $lt: today }
            });

            if (yesterdayProgress) {
                // Continue streak
                user.stats.currentStreakDays = (user.stats.currentStreakDays || 0) + 1;
            } else {
                // Reset streak (missed a day)
                user.stats.currentStreakDays = 1;
            }

            // Update longest streak if current is higher
            if (user.stats.currentStreakDays > (user.stats.longestStreakDays || 0)) {
                user.stats.longestStreakDays = user.stats.currentStreakDays;
            }

            // Create progress entry for today
            await Progress.findOneAndUpdate(
                { userId: user._id, date: today },
                {
                    $set: {
                        isStreakDay: true,
                        currentStreak: user.stats.currentStreakDays
                    },
                    $inc: { sessionsCompleted: 1 }
                },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('Error updating streak:', error);
            // Don't throw - streak tracking failure shouldn't break the main flow
        }
    }

    /**
     * Get or create the default user
     */
    static async getOrCreateDefaultUser(): Promise<IUser> {
        const defaultUserId = '65a000000000000000000000';

        let user = await User.findById(defaultUserId);
        if (!user) {
            user = await User.create({
                _id: defaultUserId,
                name: 'Alex Chen',
                email: 'alex@cuely.app',
                preferences: {
                    voiceFeedback: true,
                    liveTranscription: true,
                    difficultyLevel: 'beginner',
                    focusAreas: ['sarcasm', 'empathy']
                }
            });
        }

        return user;
    }
}
