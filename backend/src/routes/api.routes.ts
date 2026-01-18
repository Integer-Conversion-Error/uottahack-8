import { Router } from 'express';
import * as AnalysisController from '../controllers/analysis.controller';
import * as TTSController from '../controllers/tts.controller';
import * as AudioController from '../controllers/audio.controller';
import * as sessionController from '../controllers/session.controller';
import * as lessonController from '../controllers/lesson.controller';
import * as AchievementController from '../controllers/achievement.controller';
import * as UserController from '../controllers/user.controller';
import Session from '../models/Session';
import { validationMiddleware } from '../middleware/validation.middleware';
import { CreateSessionDTO, SubmitPracticeResultDTO, AnalyzeVideoDTO } from '../dtos/session.dto';
import { GetLessonAudioDTO, GenerateAudioDTO } from '../dtos/generation.dto';

const router = Router();

// Debug endpoint - list all sessions
router.get('/debug/sessions', async (req, res) => {
    try {
        const sessions = await Session.find().sort({ createdAt: -1 }).limit(10);
        res.json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: String(error) });
    }
});

// Lesson Routes
router.get('/lessons', lessonController.getAllLessons);
router.get('/lessons/:lessonId', lessonController.getLessonById);
router.post('/lessons/generate', lessonController.generateLessonOrModules);

// Achievement Routes
router.get('/achievements', AchievementController.getAllAchievements);
router.get('/achievements/user/:userId', AchievementController.getUserAchievements);
router.post('/achievements/user/:userId/check', AchievementController.checkAchievements);

// Analysis Routes - Image upload handled by multer middleware in controller export, but applied here
router.post('/analyze/video', AnalysisController.upload.single('video'), validationMiddleware(AnalyzeVideoDTO), AnalysisController.analyzeVideo);


// TTS & Audio Routes
router.post('/tts/speak', validationMiddleware(GenerateAudioDTO), TTSController.speakText);
router.post('/audio/get-or-create', validationMiddleware(GetLessonAudioDTO), AudioController.getLessonAudio);

// Session routes
router.post('/sessions/start', validationMiddleware(CreateSessionDTO), sessionController.startSession);
router.put('/sessions/:sessionId/complete', AnalysisController.upload.single('video'), validationMiddleware(SubmitPracticeResultDTO), sessionController.completeSession);
router.post('/sessions/:sessionId/practice', AnalysisController.upload.single('video'), validationMiddleware(SubmitPracticeResultDTO), sessionController.addPractice);
router.get('/sessions/:sessionId', sessionController.getSession);
router.get('/sessions/user/:userId', sessionController.getUserSessions);

// User Routes
router.get('/users/:userId', UserController.getUser);


export default router;
