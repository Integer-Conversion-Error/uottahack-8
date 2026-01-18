import { Request, Response } from 'express';
import Lesson from '../models/Lesson';

/**
 * Get all lessons (summary view)
 */
export const getAllLessons = async (req: Request, res: Response) => {
    try {
        const lessons = await Lesson.find({}, 'lessonId lessonNumber lessonName difficulty')
            .sort({ lessonNumber: 1 });

        res.json({
            success: true,
            data: lessons
        });
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lessons'
        });
    }
};

/**
 * Get a specific lesson by ID
 */
export const getLessonById = async (req: Request, res: Response) => {
    try {
        const { lessonId } = req.params;
        const lesson = await Lesson.findOne({ lessonId });

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        res.json({
            success: true,
            data: lesson
        });
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lesson'
        });
    }
};
