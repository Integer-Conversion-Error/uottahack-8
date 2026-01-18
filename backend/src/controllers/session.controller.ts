// src/controllers/session.controller.ts

import { Request, Response } from 'express';
import Session from '../models/Session';
import User from '../models/User';
import { GeminiService } from '../services/gemini.service';
import { AchievementService } from '../services/achievement.service';
import fs from 'fs';
import { CreateSessionDTO } from '../dtos/session.dto';

// Start a new training session
export const startSession = async (req: Request, res: Response) => {
    try {
        let { userId, lessonId, scenarioId, difficulty, sessionType } = req.body as CreateSessionDTO;
        const { title, totalPractices } = req.body;

        // SINGLE USER MODE: If no userId, use the default user
        if (!userId) {
            let defaultUser = await User.findOne({ email: 'user@example.com' });
            if (!defaultUser) {
                defaultUser = await User.create({
                    name: 'Demo User',
                    email: 'user@example.com',
                    preferences: {
                        difficultyLevel: 'beginner',
                        voiceFeedback: true,
                        liveTranscription: true
                    }
                });
                console.log('Created default user for single-user mode');
            }
            userId = defaultUser._id.toString();
        }

        // Require either lessonId OR scenarioId
        if (!lessonId && !scenarioId) {
            return res.status(400).json({ success: false, message: 'Either lessonId or scenarioId is required' });
        }

        let sessionData: any = {
            userId,
            lessonId,
            scenarioId,
            difficulty: difficulty || 'beginner',
            totalPractices: totalPractices || 1,
            startedAt: new Date(),
            sessionType: sessionType || 'practice',
            practices: [],
            completedPractices: 0,
            response: { webcamSnapshots: [] }
        };

        const session = new Session(sessionData);
        await session.save();

        res.status(201).json({
            success: true,
            data: {
                sessionId: session._id,
                totalPractices: session.totalPractices,
                lesson: { title: title || 'Custom Lesson' }
            }
        });

    } catch (error) {
        console.error('Error starting session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start session'
        });
    }
};

// Add a practice result to an existing session
export const addPractice = async (req: Request, res: Response) => {
    let filePath = '';
    try {
        const { sessionId } = req.params;
        const { transcript, practiceIndex, scenarioContext, targetTone, promptContext } = req.body;

        console.log('Adding practice to session:', sessionId, 'Practice index:', practiceIndex);
        console.log('File present:', !!req.file);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Video file is required'
            });
        }
        filePath = req.file.path;

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        const tone = targetTone || "General Social Cue";
        const context = promptContext || scenarioContext || "User is practicing a social interaction.";

        const analysisResult = await GeminiService.analyzeVideo(filePath, tone, context);

        const practiceResult = {
            practiceIndex: parseInt(practiceIndex) || session.practices.length,
            scenarioContext: scenarioContext || context,
            transcript: transcript || '',
            videoUrl: filePath,
            completedAt: new Date(),
            durationSeconds: 0,
            analysis: {
                rawScore: 0,
                facial_expression: analysisResult.facial_expression,
                eye_contact: analysisResult.eye_contact,
                body_language: analysisResult.body_language,
                tone: analysisResult.tone
            }
        };

        session.practices.push(practiceResult);
        session.completedPractices = session.practices.length;

        if (session.completedPractices >= session.totalPractices) {
            session.completedAt = new Date();
            session.durationSeconds = Math.floor(
                (session.completedAt.getTime() - session.startedAt.getTime()) / 1000
            );
        }

        await session.save();

        // Update User Stats & Check Achievements
        let newlyUnlocked: string[] = [];
        try {
            const user = await User.findById(session.userId);
            if (user) {
                user.stats.scenariosCompleted = (user.stats.scenariosCompleted || 0) + 1;

                const weight = 0.2;
                user.skills.facialExpression = (user.skills.facialExpression || 0) * (1 - weight) + (analysisResult.facial_expression || 0) * weight;
                user.skills.toneControl = (user.skills.toneControl || 0) * (1 - weight) + (analysisResult.tone || 0) * weight;
                user.skills.eyeContact = (user.skills.eyeContact || 0) * (1 - weight) + (analysisResult.eye_contact || 0) * weight;
                user.skills.bodyLanguage = (user.skills.bodyLanguage || 0) * (1 - weight) + (analysisResult.body_language || 0) * weight;

                user.stats.overallEmpathyScore = (user.skills.facialExpression + user.skills.toneControl + user.skills.eyeContact + user.skills.bodyLanguage) / 4;

                await user.save();

                newlyUnlocked = await AchievementService.checkAndAwardAchievements(user._id.toString());
            }
        } catch (statsError) {
            console.error('Error updating user stats or checking achievements:', statsError);
        }

        res.json({
            success: true,
            data: {
                sessionId: session._id,
                practiceIndex: practiceResult.practiceIndex,
                analysis: practiceResult.analysis,
                completedPractices: session.completedPractices,
                totalPractices: session.totalPractices,
                isLessonComplete: session.completedPractices >= session.totalPractices,
                newlyUnlocked
            }
        });

    } catch (error) {
        console.error('Error adding practice:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to add practice'
        });
    } finally {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

// Complete session (legacy)
export const completeSession = async (req: Request, res: Response) => {
    let filePath = '';
    try {
        const { sessionId } = req.params;
        const { transcript, presageData, practiceIndex, scenarioContext } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Video file is required' });
        }
        filePath = req.file.path;

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const targetTone = req.body.targetTone || "General Social Cue";
        const promptContext = req.body.promptContext || scenarioContext || "User is practicing a social interaction.";

        const analysisResult = await GeminiService.analyzeVideo(filePath, targetTone, promptContext, presageData);

        const practiceResult = {
            practiceIndex: parseInt(practiceIndex) || session.practices.length,
            scenarioContext: scenarioContext || promptContext,
            transcript: transcript || '',
            videoUrl: filePath,
            completedAt: new Date(),
            durationSeconds: 0,
            analysis: {
                rawScore: 0,
                facial_expression: analysisResult.facial_expression,
                eye_contact: analysisResult.eye_contact,
                body_language: analysisResult.body_language,
                tone: analysisResult.tone
            }
        };

        session.practices.push(practiceResult);
        session.completedPractices = session.practices.length;

        if (transcript) session.response.transcript = transcript;
        if (presageData) session.response.presageData = presageData;
        session.response.audioUrl = req.file.path;
        session.analysis = practiceResult.analysis;

        if (session.completedPractices >= session.totalPractices) {
            session.completedAt = new Date();
            session.durationSeconds = Math.floor(
                (session.completedAt.getTime() - session.startedAt.getTime()) / 1000
            );
        }

        await session.save();

        let newlyUnlocked: string[] = [];
        try {
            const user = await User.findById(session.userId);
            if (user) {
                user.stats.scenariosCompleted = (user.stats.scenariosCompleted || 0) + 1;

                const weight = 0.2;
                user.skills.facialExpression = (user.skills.facialExpression || 0) * (1 - weight) + (analysisResult.facial_expression || 0) * weight;
                user.skills.toneControl = (user.skills.toneControl || 0) * (1 - weight) + (analysisResult.tone || 0) * weight;
                user.skills.eyeContact = (user.skills.eyeContact || 0) * (1 - weight) + (analysisResult.eye_contact || 0) * weight;
                user.skills.bodyLanguage = (user.skills.bodyLanguage || 0) * (1 - weight) + (analysisResult.body_language || 0) * weight;

                user.stats.overallEmpathyScore = (user.skills.facialExpression + user.skills.toneControl + user.skills.eyeContact + user.skills.bodyLanguage) / 4;

                await user.save();

                newlyUnlocked = await AchievementService.checkAndAwardAchievements(user._id.toString());
            }
        } catch (statsError) {
            console.error('Error updating user stats or checking achievements:', statsError);
        }

        res.json({
            success: true,
            data: {
                sessionId: session._id,
                practiceIndex: practiceResult.practiceIndex,
                analysis: practiceResult.analysis,
                completedPractices: session.completedPractices,
                totalPractices: session.totalPractices,
                isLessonComplete: session.completedPractices >= session.totalPractices,
                newlyUnlocked
            }
        });

    } catch (error) {
        console.error('Error completing session:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to complete session'
        });
    } finally {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

// Get session by ID
export const getSession = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const session = await Session.findById(sessionId).populate('userId', 'name email');
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }
        res.json({ success: true, data: session });
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch session' });
    }
};

// Get user's sessions
export const getUserSessions = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit as string) || 20;
        const sessions = await Session.find({ userId }).sort({ startedAt: -1 }).limit(limit);
        res.json({ success: true, data: sessions });
    } catch (error) {
        console.error('Error fetching user sessions:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
    }
};