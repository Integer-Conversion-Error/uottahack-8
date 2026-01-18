// src/controllers/session.controller.ts

import { Request, Response } from 'express';
import Session from '../models/Session';
import User from '../models/User';
import { GeminiService } from '../services/gemini.service';
import { ElevenLabsService } from '../services/elevenlabs.service';
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

        // Determine tone for analysis
        const tone = targetTone || "General Social Cue";
        const context = promptContext || scenarioContext || "User is practicing a social interaction.";

        // Transcribe video using ElevenLabs STT (required)
        const elevenLabsTranscript = await ElevenLabsService.transcribeAudio(filePath);
        console.log('ElevenLabs transcript:', elevenLabsTranscript);

        // Run AI analysis (Gemini analyzes video for facial/body/tone feedback)
        const analysisResult = await GeminiService.analyzeVideo(filePath, tone, context);

        // Create practice result
        const practiceResult = {
            practiceIndex: parseInt(practiceIndex) || session.practices.length,
            scenarioContext: scenarioContext || context,
            transcript: elevenLabsTranscript,
            videoUrl: filePath,
            completedAt: new Date(),
            durationSeconds: 0,
            analysis: {
                rawScore: 0,
                elevenlabs_transcript: elevenLabsTranscript,
                gemini_transcript: analysisResult.transcript || '',
                facial_expression: analysisResult.facial_expression,
                eye_contact: analysisResult.eye_contact,
                body_language: analysisResult.body_language,
                tone: analysisResult.tone,
                content_accuracy: analysisResult.content_accuracy
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

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Determine tone and context
        let targetTone = req.body.targetTone || "General Social Cue";
        let promptContext = req.body.promptContext || scenarioContext || "User is practicing a social interaction.";

        // Transcribe video using ElevenLabs STT (required)
        const elevenLabsTranscript = await ElevenLabsService.transcribeAudio(filePath);
        console.log('ElevenLabs transcript:', elevenLabsTranscript);

        // Run AI analysis (Gemini analyzes video for facial/body/tone feedback)
        const analysisResult = await GeminiService.analyzeVideo(filePath, targetTone, promptContext, presageData);

        // Create practice result and add to array
        const practiceResult = {
            practiceIndex: parseInt(practiceIndex) || session.practices.length,
            scenarioContext: scenarioContext || promptContext,
            transcript: elevenLabsTranscript,
            videoUrl: filePath,
            completedAt: new Date(),
            durationSeconds: 0,
            analysis: {
                rawScore: 0,
                elevenlabs_transcript: elevenLabsTranscript,
                gemini_transcript: analysisResult.transcript || '',
                facial_expression: analysisResult.facial_expression,
                eye_contact: analysisResult.eye_contact,
                body_language: analysisResult.body_language,
                tone: analysisResult.tone,
                content_accuracy: analysisResult.content_accuracy
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
            .populate('userId', 'name email');

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