// src/controllers/achievement.controller.ts

import { Request, Response } from 'express';
import { AchievementService } from '../services/achievement.service';

/**
 * Get all available achievements
 */
export const getAllAchievements = async (req: Request, res: Response) => {
    try {
        const achievements = await AchievementService.getAllAchievements();
        res.json({
            success: true,
            data: achievements
        });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch achievements'
        });
    }
};

/**
 * Get user earned achievements
 */
export const getUserAchievements = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        const achievements = await AchievementService.getUserAchievements(userId);
        res.json({
            success: true,
            data: achievements
        });
    } catch (error) {
        console.error('Error fetching user achievements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user achievements'
        });
    }
};

/**
 * Manually trigger achievement check (useful for testing or after data migration)
 */
export const checkAchievements = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        const newlyUnlocked = await AchievementService.checkAndAwardAchievements(userId);
        res.json({
            success: true,
            data: {
                newlyUnlocked,
                count: newlyUnlocked.length
            }
        });
    } catch (error) {
        console.error('Error checking achievements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check achievements'
        });
    }
};
