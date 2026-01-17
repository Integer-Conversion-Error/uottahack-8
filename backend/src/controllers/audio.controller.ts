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
        const { lessonId, pageOrder, voiceId, tone } = req.body;
        let { text, tonalPrompt } = req.body;

        if (!lessonId || pageOrder === undefined) {
            res.status(400).json({ message: 'Missing required fields: lessonId, pageOrder' });
            return;
        }

        // Lookup lesson data from file if text is missing
        if (!text) {
            try {
                // Adjust path based on deployment/dev environment.
                // Assuming standard repo structure: backend/src/controllers -> frontend/cuely/data
                const dataDir = path.join(__dirname, '../../../frontend/cuely/data');

                if (fs.existsSync(dataDir)) {
                    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

                    let lessonData = null;
                    for (const file of files) {
                        try {
                            const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
                            if (content.lessonId === lessonId) {
                                lessonData = content;
                                break;
                            }
                        } catch (e) {
                            console.warn(`Failed to parse lesson file ${file}`, e);
                        }
                    }

                    if (!lessonData) {
                        // Fallback: If not found in file (maybe implied lessonId mismatch?), error out
                        // unless we strictly require text.
                        // For now, if text is missing AND we can't find the lesson, it's an error.
                        res.status(404).json({ message: 'Lesson data not found. Please provide text explicitly.' });
                        return;
                    }

                    const page = lessonData.pages ? lessonData.pages.find((p: any) => p.pageOrder === pageOrder) : null;
                    if (!page) {
                        res.status(404).json({ message: 'Page not found in lesson' });
                        return;
                    }

                    text = page.transcript;
                    tonalPrompt = page.audioSample?.tonalPrompt;

                    if (!text) {
                        res.status(400).json({ message: 'Page has no transcript to speak' });
                        return;
                    }
                } else {
                    console.warn(`Data directory not found at ${dataDir}`);
                    res.status(500).json({ message: 'Server configuration error: Data directory missing' });
                    return;
                }

            } catch (err) {
                console.error("Error looking up lesson data:", err);
                res.status(500).json({ message: 'Failed to retrieve lesson data from backend' });
                return;
            }
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
