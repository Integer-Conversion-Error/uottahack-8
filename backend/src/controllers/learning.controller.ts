import { Request, Response } from 'express';
import { Module, Lesson } from '../models/Module';
import User from '../models/User';
import { GeminiService } from '../services/gemini.service';

export const getModules = async (req: Request, res: Response) => {
    try {
        const modules = await Module.find().sort({ order: 1 });
        res.json(modules);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getLessonsByModule = async (req: Request, res: Response) => {
    try {
        const lessons = await Lesson.find({ moduleId: req.params.moduleId });
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Auto-generate a lesson if it doesn't exist or just for demo
export const generateLesson = async (req: Request, res: Response) => {
    const { topic, difficulty, moduleId } = req.body;
    try {
        const content = await GeminiService.generateLessonJSON(topic, difficulty);

        // Save as a new lesson
        const newLesson = new Lesson({
            title: content.title || topic,
            type: 'static_learning',
            content: content,
            moduleId: moduleId, // Ensure this ID exists
            xpReward: 20
        });

        await newLesson.save();

        // Add to module
        await Module.findByIdAndUpdate(moduleId, { $push: { lessons: newLesson._id } });

        res.json(newLesson);
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate lesson' });
    }
};

export const completeLesson = async (req: Request, res: Response) => {
    const { userId, lessonId } = req.body; // Since no auth, passing userId in body
    try {
        const user = await User.findById(userId);
        const lesson = await Lesson.findById(lessonId);

        if (!user || !lesson) {
            return res.status(404).json({ message: 'User or Lesson not found' });
        }

        // Check if user has completed this lesson (using stats instead)
        const hasCompleted = user.stats.scenariosCompleted > 0;

        if (!hasCompleted) {
            // Increment completed scenarios
            user.stats.scenariosCompleted += 1;
            user.stats.overallEmpathyScore += 10;
            await user.save();
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
