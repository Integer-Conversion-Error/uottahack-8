import { Router } from 'express';
import * as LearningController from '../controllers/learning.controller';
import * as AnalysisController from '../controllers/analysis.controller';
import * as TTSController from '../controllers/tts.controller';

const router = Router();

// Learning Routes
router.get('/modules', LearningController.getModules);
router.get('/modules/:moduleId/lessons', LearningController.getLessonsByModule);
router.post('/lessons/generate', LearningController.generateLesson); // Admin/Dev tool
router.post('/lessons/complete', LearningController.completeLesson);

// Analysis Routes - Image upload handled by multer middleware in controller export, but applied here
router.post('/analyze/face', AnalysisController.upload.single('image'), AnalysisController.analyzeFace);
router.post('/analyze/video', AnalysisController.upload.single('video'), AnalysisController.analyzeVideo);
router.post('/analyze/response', AnalysisController.analyzeResponse);

// TTS Routes
router.post('/tts/speak', TTSController.speakText);

export default router;
