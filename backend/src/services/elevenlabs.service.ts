import axios from 'axios';
import dotenv from 'dotenv';
import { GeminiService } from './gemini.service';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const API_URL = "https://api.elevenlabs.io/v1";

export class ElevenLabsService {

    static async generateSpeech(text: string, voiceId: string = "21m00Tcm4TlvDq8ikWAM", tone?: string, context?: string): Promise<Buffer> {
        if (!ELEVENLABS_API_KEY) {
            throw new Error("ElevenLabs API Key is missing");
        }

        let finalText = text;
        if (tone) {
            try {
                finalText = await GeminiService.generateToneTags(text, tone, context);
                console.log(`Original Text: "${text}" -> Tagged Text: "${finalText}"`);
            } catch (error) {
                console.warn("Failed to generate tone tags, using original text.", error);
            }
        }

        try {
            const response = await axios.post(
                `${API_URL}/text-to-speech/${voiceId}`,
                {
                    text: finalText,
                    model_id: "eleven_monolingual_v1",
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
        } catch (error) {
            console.error("ElevenLabs TTS Error:", error);
            throw new Error("Failed to generate speech");
        }
    }
}
