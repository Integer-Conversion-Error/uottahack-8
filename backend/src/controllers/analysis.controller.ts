import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';
import multer from 'multer';

// Setup multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

export const analyzeFace = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const analysis = await GeminiService.analyzeFacialCues(req.file.buffer, req.file.mimetype);
        res.json({ analysis });
    } catch (error) {
        res.status(500).json({ message: 'Analysis failed' });
    }
};

export const analyzeResponse = async (req: Request, res: Response) => {
    const { userResponse, context } = req.body;
    try {
        const result = await GeminiService.analyzeResponse(userResponse, context);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Analysis failed' });
    }
};
