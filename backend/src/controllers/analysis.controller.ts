import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Setup multer for disk storage to handle large video files and provide path for Gemini File API
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

export const upload = multer({ storage: storage });



export const analyzeVideo = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No video uploaded" });
        }

        const { tone, context, presageData } = req.body;
        if (!tone || !context) {
            // cleanup
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Tone and Context are required" });
        }

        const analysis = await GeminiService.analyzeVideo(req.file.path, tone, context, presageData);

        // Cleanup video file from local disk after successful upload/analysis
        fs.unlinkSync(req.file.path);

        res.json(analysis);

    } catch (error) {
        console.error("Video Analysis Error:", error);
        // Cleanup if error occurred
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: "Video analysis failed" });
    }
};
