// src/controllers/session.controller.ts

import { Request, Response } from 'express';
import Session from '../models/Session';
import Scenario from '../models/Scenario';
import { GeminiService } from '../services/gemini.service';
import fs from 'fs';

// Start a new training session (1 session per lesson)
export const startSession = async (req: Request, res: Response) => {
    try {
        const { userId, scenarioId, lessonId, difficulty, title, totalPractices } = req.body;

        let sessionData: any = {
            userId,
            startedAt: new Date(),
            sessionType: 'practice',
            practices: [],
            completedPractices: 0,
            response: { webcamSnapshots: [] }
        };

        if (scenarioId) {
            // Traditional flow with DB-backed scenario
            const scenario = await Scenario.findById(scenarioId);
            if (!scenario) {
                return res.status(404).json({ success: false, message: 'Scenario not found' });
            }
            sessionData.scenarioId = scenarioId;
            sessionData.difficulty = scenario.difficulty;
            sessionData.totalPractices = 1;
            // Increment stats
            scenario.stats.timesAttempted += 1;
            await scenario.save();
        } else if (lessonId) {
            // New flow for JSON lessons with multiple practices
            sessionData.lessonId = lessonId;
            sessionData.difficulty = difficulty || 'beginner';
            sessionData.totalPractices = totalPractices || 1;
        } else {
            return res.status(400).json({ success: false, message: 'Either scenarioId or lessonId is required' });
        }

        const session = new Session(sessionData);
        await session.save();

        res.status(201).json({
            success: true,
            data: {
                sessionId: session._id,
                totalPractices: session.totalPractices,
                scenario: scenarioId ? undefined : { title: title || 'Custom Lesson' }
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

        // Determine tone for analysis
        const tone = targetTone || "General Social Cue";
        const context = promptContext || scenarioContext || "User is practicing a social interaction.";

        // Run AI analysis
        const analysisResult = await GeminiService.analyzeVideo(filePath, tone, context);

        // Create practice result
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

        // Add to practices array
        session.practices.push(practiceResult);
        session.completedPractices = session.practices.length;

        // Check if all practices are complete
        if (session.completedPractices >= session.totalPractices) {
            session.completedAt = new Date();
            session.durationSeconds = Math.floor(
                (session.completedAt.getTime() - session.startedAt.getTime()) / 1000
            );
        }

        await session.save();

        res.json({
            success: true,
            data: {
                sessionId: session._id,
                practiceIndex: practiceResult.practiceIndex,
                analysis: practiceResult.analysis,
                completedPractices: session.completedPractices,
                totalPractices: session.totalPractices,
                isLessonComplete: session.completedPractices >= session.totalPractices
            }
        });

    } catch (error) {
        console.error('Error adding practice:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to add practice'
        });
    } finally {
        // Cleanup file
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

// Complete session with analysis (legacy - for single practice sessions)
export const completeSession = async (req: Request, res: Response) => {
    let filePath = '';
    try {
        const { sessionId } = req.params;
        const { transcript, presageData, practiceIndex, scenarioContext } = req.body;
        console.log('Completing session:', sessionId);
        console.log('File present:', !!req.file);
        if (req.file) console.log('File path:', req.file.path, 'Mimetype:', req.file.mimetype);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Video file is required'
            });
        }
        filePath = req.file.path;

        const session = await Session.findById(sessionId).populate('scenarioId');
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Determine tone and context
        let targetTone = req.body.targetTone;
        let promptContext = req.body.promptContext;

        if (!targetTone || !promptContext) {
            if (session.scenarioId) {
                const scenario = session.scenarioId as any;
                targetTone = targetTone || scenario.category || "General Social Cue";
                promptContext = promptContext || `Scenario: ${scenario.title}. Situation: ${scenario.context?.situation || scenario.description}. Audio Prompt: "${scenario.audio?.transcript || 'N/A'}"`;
            } else {
                console.warn("Missing analysis context (tone/prompt) for session", sessionId);
                targetTone = targetTone || "General";
                promptContext = promptContext || "User is practicing a social interaction.";
            }
        }

        // Run AI analysis
        const analysisResult = await GeminiService.analyzeVideo(filePath, targetTone, promptContext, presageData);

        // Create practice result and add to array
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

        // Also store in legacy fields for backward compatibility
        if (transcript) session.response.transcript = transcript;
        if (presageData) session.response.presageData = presageData;
        session.response.audioUrl = req.file.path;
        session.analysis = {
            rawScore: 0,
            facial_expression: analysisResult.facial_expression,
            eye_contact: analysisResult.eye_contact,
            body_language: analysisResult.body_language,
            tone: analysisResult.tone
        };

        // Check if all practices are complete
        if (session.completedPractices >= session.totalPractices) {
            session.completedAt = new Date();
            session.durationSeconds = Math.floor(
                (session.completedAt.getTime() - session.startedAt.getTime()) / 1000
            );
        }

        console.log('DEBUG: Session practices before save:', session.practices.length);
        console.log('DEBUG: Session completedPractices:', session.completedPractices);

        const savedSession = await session.save();
        console.log('DEBUG: Session saved successfully. ID:', savedSession._id);
        console.log('DEBUG: Saved practices count:', savedSession.practices.length);

        res.json({
            success: true,
            data: {
                sessionId: session._id,
                practiceIndex: practiceResult.practiceIndex,
                analysis: practiceResult.analysis,
                completedPractices: session.completedPractices,
                totalPractices: session.totalPractices,
                isLessonComplete: session.completedPractices >= session.totalPractices
            }
        });

    } catch (error) {
        console.error('Error completing session:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to complete session'
        });
    } finally {
        // Cleanup file
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

// Get session by ID
export const getSession = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findById(sessionId)
            .populate('userId', 'name email')
            .populate('scenarioId', 'title category difficulty');

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        res.json({
            success: true,
            data: session
        });

    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch session'
        });
    }
};

// Get user's sessions
export const getUserSessions = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit as string) || 20;

        const sessions = await Session.find({ userId })
            .populate('scenarioId', 'title category difficulty')
            .sort({ startedAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: sessions
        });

    } catch (error) {
        console.error('Error fetching user sessions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sessions'
        });
    }
};