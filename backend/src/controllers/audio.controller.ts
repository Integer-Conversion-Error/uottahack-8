import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { ElevenLabsService } from '../services/elevenlabs.service';

const AUDIO_DIR = path.join(__dirname, '../../public/audio');

// Ensure audio directory exists
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

export const getLessonAudio = async (req: Request, res: Response) => {
    try {
        const { lessonId, pageOrder, text, tonalPrompt, voiceId, tone } = req.body;

        if (!lessonId || pageOrder === undefined || !text) {
            res.status(400).json({ message: 'Missing required fields: lessonId, pageOrder, text' });
            return;
        }

        const fileName = `${lessonId}_${pageOrder}.mp3`;
        const filePath = path.join(AUDIO_DIR, fileName);

        // 1. Check if file exists in cache
        if (fs.existsSync(filePath)) {
            console.log(`Audio cache hit for: ${fileName}`);
            res.sendFile(filePath);
            return;
        }

        // 2. Generate if missing
        console.log(`Audio cache miss. Generating for: ${fileName}`);
        const audioBuffer = await ElevenLabsService.generateSpeech(
            text,
            voiceId || "21m00Tcm4TlvDq8ikWAM",
            tonalPrompt,
            tone
        );

        // 3. Save to disk
        fs.writeFileSync(filePath, audioBuffer);
        console.log(`Saved new audio file to: ${filePath}`);

        // 4. Stream file
        res.sendFile(filePath);

    } catch (error) {
        console.error('Error in getLessonAudio:', error);
        res.status(500).json({ message: 'Failed to retrieve or generate audio' });
    }
};
