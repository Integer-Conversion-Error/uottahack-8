// src/controllers/session.controller.ts

import { Request, Response } from 'express';
import Session from '../models/Session';
import Scenario from '../models/Scenario';
import { GeminiService } from '../services/gemini.service';

// Start a new training session
export const startSession = async (req: Request, res: Response) => {
    try {
        const { userId, scenarioId } = req.body;

        if (!userId || !scenarioId) {
            return res.status(400).json({
                success: false,
                message: 'userId and scenarioId are required'
            });
        }

        // Get scenario details
        const scenario = await Scenario.findById(scenarioId);
        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }

        // Create new session
        const session = new Session({
            userId,
            scenarioId,
            difficulty: scenario.difficulty,
            sessionType: 'practice',
            response: {
                webcamSnapshots: []
            }
        });

        await session.save();

        // Increment scenario stats
        scenario.stats.timesAttempted += 1;
        await scenario.save();

        res.status(201).json({
            success: true,
            data: {
                sessionId: session._id,
                scenario: {
                    title: scenario.title,
                    audioUrl: scenario.audio.audioUrl,
                    transcript: scenario.audio.transcript,
                    duration: scenario.audio.durationSeconds
                }
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

// Complete session with analysis
export const completeSession = async (req: Request, res: Response) => {
    let filePath = '';
    try {
        const { sessionId } = req.params;
        // transcript/presageData might still be passed in body if needed, but video is primary
        const { transcript, presageData } = req.body;

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

        // Store response data (optional if we want to keep these)
        if (transcript) session.response.transcript = transcript;
        if (presageData) session.response.presageData = presageData;
        session.response.audioUrl = req.file.path; // Or store the path temporarily/permanently? 
        // Note: Local path is ephemeral usually. For a real app, upload to cloud storage. 
        // For now, we are just analyzing it.

        // Determine tone from scenario
        // Assuming scenario.category or title represents the target tone/skill
        const scenario = session.scenarioId as any; // Cast to access populated fields
        const targetTone = scenario.category || "General Social Cue";

        // Run AI analysis
        const analysisResult = await GeminiService.analyzeVideo(filePath, targetTone);

        // Save analysis
        // Map the JSON result to the Mongoose schema structure
        // The schema expects: rawScore, facial_expression, eye_contact, body_language, tone
        // The service returns: facial_expression, eye_contact, body_language, tone (each with score/feedback)

        // Calculate a simple raw score based on "thumbs-up" counts or similar if needed.
        // For now, let's just default rawScore to 0 or calculate it.
        // Let's assume we just store 0 or implement a helper.

        session.analysis = {
            rawScore: 0, // Todo: calculate based on thumbs-up/down
            facial_expression: analysisResult.facial_expression,
            eye_contact: analysisResult.eye_contact,
            body_language: analysisResult.body_language,
            tone: analysisResult.tone
        };

        session.completedAt = new Date();
        session.durationSeconds = Math.floor(
            (session.completedAt.getTime() - session.startedAt.getTime()) / 1000
        );

        await session.save();

        res.json({
            success: true,
            data: {
                sessionId: session._id,
                analysis: session.analysis
            }
        });

    } catch (error) {
        console.error('Error completing session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete session'
        });
    } finally {
        // Cleanup file
        if (filePath && require('fs').existsSync(filePath)) {
            require('fs').unlinkSync(filePath);
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