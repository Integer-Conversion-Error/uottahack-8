import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const API_URL = "https://api.elevenlabs.io/v1";

export class ElevenLabsService {

    static async generateSpeech(text: string, voiceId: string = "21m00Tcm4TlvDq8ikWAM"): Promise<Buffer> {
        if (!ELEVENLABS_API_KEY) {
            throw new Error("ElevenLabs API Key is missing");
        }

        try {
            const response = await axios.post(
                `${API_URL}/text-to-speech/${voiceId}`,
                {
                    text,
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
