import axios from 'axios';
import dotenv from 'dotenv';
import { GeminiService } from './gemini.service';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const API_URL = "https://api.elevenlabs.io/v1";

export class ElevenLabsService {

    /**
     * Generates speech from text using ElevenLabs TTS.
     * @param text - The transcript to speak.
     * @param voiceId - The ElevenLabs voice ID.
     * @param tonalPrompt - Pre-existing tonal directions from the lesson file (e.g., "Slow, drawn out...").
     * @param tone - The general tone (e.g., "Sarcastic"). Used for dynamic Gemini generation if tonalPrompt is absent.
     * @param context - Additional context for Gemini if generating dynamically.
     */
    static async generateSpeech(
        text: string,
        voiceId: string = "21m00Tcm4TlvDq8ikWAM",
        tonalPrompt?: string,
        tone?: string,
        context?: string
    ): Promise<Buffer> {
        if (!ELEVENLABS_API_KEY) {
            throw new Error("ElevenLabs API Key is missing");
        }

        let finalText = text;

        if (tonalPrompt) {
            // Use the pre-existing tonal prompt from the lesson file directly.
            finalText = `[${tonalPrompt}] ${text}`;
            console.log(`Using pre-existing tonalPrompt: "${finalText}"`);
        } else if (tone) {
            // Fallback: Generate tone tags dynamically using Gemini.
            try {
                finalText = await GeminiService.generateToneTags(text, tone, context);
                console.log(`Gemini generated: "${text}" -> "${finalText}"`);
            } catch (error) {
                console.warn("Failed to generate tone tags, using original text.", error);
            }
        }

        try {
            const response = await axios.post(
                `${API_URL}/text-to-speech/${voiceId}`,
                {
                    text: finalText,
                    model_id: "eleven_multilingual_v2",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    },
                },
                {
                    headers: {
                        'xi-api-key': ELEVENLABS_API_KEY,
                        'Content-Type': 'application/json',
                    },
                    responseType: 'arraybuffer',
                }
            );

            return Buffer.from(response.data);
        } catch (error: any) {
            console.error("ElevenLabs TTS Error:", error.response?.data || error.message);
            throw new Error("Failed to generate speech");
        }
    }
}
