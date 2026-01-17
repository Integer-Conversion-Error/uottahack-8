import { Request, Response } from 'express';
import { ElevenLabsService } from '../services/elevenlabs.service';

export const speakText = async (req: Request, res: Response) => {
    const { text, voiceId, tone, context } = req.body;
    try {
        const audioBuffer = await ElevenLabsService.generateSpeech(text, voiceId, tone, context);

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
        });

        res.send(audioBuffer);
    } catch (error) {
        res.status(500).json({ message: 'TTS Generation failed' });
    }
};
