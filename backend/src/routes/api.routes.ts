import { Router } from 'express';
import * as LearningController from '../controllers/learning.controller';
import * as AnalysisController from '../controllers/analysis.controller';
import * as TTSController from '../controllers/tts.controller';
import * as sessionController from '../controllers/session.controller';
import * as scenarioController from '../controllers/scenario.controller';
import Session from '../models/Session';

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

// Learning Routes
router.get('/modules', LearningController.getModules);
router.get('/modules/:moduleId/lessons', LearningController.getLessonsByModule);

router.post('/lessons/complete', LearningController.completeLesson);

// Analysis Routes - Image upload handled by multer middleware in controller export, but applied here
router.post('/analyze/video', AnalysisController.upload.single('video'), AnalysisController.analyzeVideo);


// TTS Routes
router.post('/tts/speak', TTSController.speakText);

// Session routes
router.post('/sessions/start', sessionController.startSession);
router.put('/sessions/:sessionId/complete', AnalysisController.upload.single('video'), sessionController.completeSession);
router.post('/sessions/:sessionId/practice', AnalysisController.upload.single('video'), sessionController.addPractice);
router.get('/sessions/:sessionId', sessionController.getSession);
router.get('/sessions/user/:userId', sessionController.getUserSessions);

// Scenario routes
router.get('/scenarios', scenarioController.getAllScenarios);
router.get('/scenarios/:scenarioId', scenarioController.getScenarioById);
router.get('/scenarios/difficulty/:difficulty', scenarioController.getScenariosByDifficulty);

export default router;
