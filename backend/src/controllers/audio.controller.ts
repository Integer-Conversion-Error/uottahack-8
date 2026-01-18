import { Request, Response } from 'express';
import { ElevenLabsService } from '../services/elevenlabs.service';
import { GetLessonAudioDTO } from '../dtos/generation.dto';

export const getLessonAudio = async (req: Request, res: Response) => {
    try {
        const { lessonId, pageOrder, voiceId, tone } = req.body as GetLessonAudioDTO;
        let { text, tonalPrompt } = req.body as GetLessonAudioDTO;

        if (!lessonId || pageOrder === undefined) {
            res.status(400).json({ message: 'Missing required fields: lessonId, pageOrder' });
            return;
        }

        // Lookup lesson data from MongoDB if text is missing
        if (!text) {
            try {
                const Lesson = require('../models/Lesson').default;
                const lessonDoc = await Lesson.findOne({ lessonId });

                if (!lessonDoc) {
                    res.status(404).json({ message: 'Lesson not found' });
                    return;
                }

                const page = lessonDoc.pages ? lessonDoc.pages.find((p: any) => p.pageOrder === pageOrder) : null;
                if (!page) {
                    res.status(404).json({ message: 'Page not found in lesson' });
                    return;
                }

                // Extract text and tonalPrompt from nested DTO structure
                if (page.pageType === 'definition' && page.definition) {
                    text = page.definition.transcript || page.definition.definition; // Fallback to definition if no transcript
                    tonalPrompt = page.definition.tonalPrompt;
                } else if (page.pageType === 'practice' && page.practice) {
                    text = page.practice.transcript;
                    tonalPrompt = page.practice.audioSample?.tonalPrompt;
                }

                if (!text) {
                    res.status(400).json({ message: 'Page has no transcript to speak' });
                    return;
                }
            } catch (e) {
                console.error('Error fetching lesson from MongoDB:', e);
                res.status(500).json({ message: 'Failed to fetch lesson data' });
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
