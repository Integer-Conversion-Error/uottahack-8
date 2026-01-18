// src/services/achievement.service.ts

import Achievement, { IAchievement } from '../models/Achievement';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose';

export class AchievementService {
    /**
     * Check and award achievements to a user based on current stats.
     */
    static async checkAndAwardAchievements(userId: string): Promise<string[]> {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const allAchievements = await Achievement.find();
        const unlockedBadgeIds = new Set(user.achievements.map(a => a.badgeId));
        const newlyUnlocked: string[] = [];

        for (const achievement of allAchievements) {
            if (unlockedBadgeIds.has(achievement.badgeId)) {
                continue;
            }

            if (this.meetsCriteria(user, achievement)) {
                user.achievements.push({
                    badgeId: achievement.badgeId,
                    unlockedAt: new Date(),
                    progress: 100
                });
                newlyUnlocked.push(achievement.badgeId);
            }
        }

        if (newlyUnlocked.length > 0) {
            await user.save();
        }

        return newlyUnlocked;
    }

    /**
     * Internal logic to check if a user meets achievement criteria.
     */
    private static meetsCriteria(user: IUser, achievement: IAchievement): boolean {
        const { type, threshold } = achievement.criteria;

        switch (type) {
            case 'lessons_completed':
                return (user.stats.scenariosCompleted || 0) >= threshold;
            case 'streak':
                return (user.stats.currentStreakDays || 0) >= threshold;
            case 'mastery':
                return (user.stats.scenariosMastered || 0) >= threshold;
            case 'overall_score':
                return (user.stats.overallEmpathyScore || 0) >= threshold;
            case 'facial_expression':
                return (user.skills.facialExpression || 0) >= threshold;
            case 'tone_control':
                return (user.skills.toneControl || 0) >= threshold;
            default:
                return false;
        }
    }

    /**
     * Get all achievements earned by a user.
     */
    static async getUserAchievements(userId: string) {
        const user = await User.findById(userId).populate('achievements.badgeId');
        if (!user) {
            throw new Error('User not found');
        }

        // We need to join with Achievement metadata
        const userAchievementIds = user.achievements.map(a => a.badgeId);
        const achievementsMetadata = await Achievement.find({ badgeId: { $in: userAchievementIds } });

        return user.achievements.map(ua => {
            const meta = achievementsMetadata.find(m => m.badgeId === ua.badgeId);
            const uaObj = (ua as any).toObject ? (ua as any).toObject() : ua;
            return {
                ...uaObj,
                metadata: meta
            };
        });
    }

    /**
     * Get all available achievements.
     */
    static async getAllAchievements() {
        return await Achievement.find().sort({ points: 1 });
    }
}
