import { Request, Response } from 'express';
import Lesson from '../models/Lesson';
import { GeminiService } from '../services/gemini.service';
import Ajv from 'ajv';
import lessonSchema from '../schemas/lesson_schema.json';

const ajv = new Ajv({ allErrors: true });

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

/**
 * Generate new modules for an existing lesson, or create a new lesson if it doesn't exist.
 * POST /api/lessons/generate
 * Body: { lessonName: string, count: number, difficulty: string }
 */
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const generateLessonOrModules = async (req: Request, res: Response) => {
    try {
        const { lessonName, count = 3, difficulty = 'Beginner' } = req.body;

        if (!lessonName) {
            return res.status(400).json({
                success: false,
                message: 'lessonName is required'
            });
        }

        // Case-insensitive search for existing lesson
        const existingLesson = await Lesson.findOne({
            lessonName: { $regex: new RegExp(`^${lessonName}$`, 'i') }
        });

        const lessonId = existingLesson ? existingLesson.lessonId : slugify(lessonName);

        // Respond immediately to avoid timeout
        res.status(202).json({
            success: true,
            message: 'Lesson generation started',
            data: { lessonId, processing: true }
        });

        // Background processing
        (async () => {
            try {
                if (existingLesson) {
                    // Branch A: Lesson exists, append new modules
                    console.log(`[Background] Lesson "${lessonName}" exists. Generating ${count} new modules.`);

                    const metadata = {
                        term: existingLesson.lessonName,
                        definition: (existingLesson.pages.find((p: any) => p.pageType === 'definition') as any)?.definition || ''
                    };

                    const newModules = await GeminiService.generateExampleModules(
                        existingLesson.lessonId,
                        existingLesson.lessonName,
                        metadata,
                        count,
                        difficulty
                    );

                    // Validate each module (simplified check)
                    const validatePage = ajv.compile((lessonSchema as any).definitions.practicePage);
                    for (const mod of newModules) {
                        if (!validatePage(mod)) {
                            console.warn('Module validation failed:', validatePage.errors);
                        }
                    }

                    // Assign pageOrder
                    const maxOrder = existingLesson.pages.reduce((max: number, p: any) => Math.max(max, p.pageOrder || 0), 0);
                    newModules.forEach((mod, i) => {
                        mod.pageOrder = maxOrder + 1 + i;
                    });

                    // Push to lesson
                    existingLesson.pages.push(...newModules);
                    await existingLesson.save();
                    console.log(`[Background] Added modules to lesson "${existingLesson.lessonName}"`);

                } else {
                    // Branch B: Lesson does not exist, create a new one
                    console.log(`[Background] Lesson "${lessonName}" not found. Generating new lesson.`);

                    const lessonData = await GeminiService.generateFullLesson(lessonName, count, difficulty);

                    if (!lessonData) {
                        console.error('[Background] Failed to generate lesson data');
                        return;
                    }

                    // Override lessonId with our deterministic one
                    lessonData.lessonId = lessonId;

                    // Assign lessonNumber (auto-increment) and difficulty
                    const maxLesson = await Lesson.findOne().sort({ lessonNumber: -1 });
                    lessonData.lessonNumber = (maxLesson?.lessonNumber || 0) + 1;
                    lessonData.difficulty = difficulty.toLowerCase();

                    // Use findOneAndUpdate with upsert to handle duplicate lessonId gracefully
                    const newLesson = await Lesson.findOneAndUpdate(
                        { lessonId: lessonData.lessonId },
                        lessonData,
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );

                    console.log(`[Background] Saved/updated lesson in database: ${newLesson.lessonId}`);
                }
            } catch (bgError) {
                console.error('[Background] Error generating lesson/modules:', bgError);
            }
        })();

    } catch (error) {
        console.error('Error initiating lesson generation:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Failed to initiate lesson generation'
            });
        }
    }
};
