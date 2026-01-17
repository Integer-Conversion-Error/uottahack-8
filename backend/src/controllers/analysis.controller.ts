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

export const analyzeFace = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        // For existing facial analysis that expects buffer, we need to read the file
        // Since we switched to disk storage, req.file.buffer is undefined.
        // We modify this to read from disk or existing logic needs adaptation.
        // Reading file to buffer for compatibility with existing service method
        const fileBuffer = fs.readFileSync(req.file.path);
        const analysis = await GeminiService.analyzeFacialCues(fileBuffer, req.file.mimetype);

        // Optimize: verify if we want to delete image immediately after analysis
        fs.unlinkSync(req.file.path);

        res.json({ analysis });
    } catch (error) {
        console.error("Facial Analysis Error:", error);
        // Cleanup if error occurred and file exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
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

export const analyzeVideo = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No video uploaded" });
        }

        const { tone } = req.body;
        if (!tone) {
            // cleanup
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Tone/Context is required" });
        }

        const analysis = await GeminiService.analyzeVideo(req.file.path, tone);

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
