import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import FormData from 'form-data';
import { GeminiService } from './gemini.service';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const API_URL = "https://api.elevenlabs.io/v1";

export class ElevenLabsService {

    /**
     * Converts video file to MP3 audio using ffmpeg.
     * @param inputPath - Path to the input video file.
     * @returns Path to the converted MP3 file.
     */
    static convertToMp3(inputPath: string): string {
        const outputPath = inputPath.replace(/\.[^/.]+$/, '.mp3');

        console.log(`Converting ${inputPath} to MP3...`);

        // Try ffmpeg from PATH first, fall back to specific path if needed
        const ffmpegCommands = [
            'ffmpeg',  // Try PATH first
            process.env.FFMPEG_PATH,  // Then environment variable
            'C:\\Users\\togoo\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin\\ffmpeg.exe'  // Hardcoded fallback
        ].filter(Boolean) as string[];

        for (const ffmpegPath of ffmpegCommands) {
            try {
                // Extract audio and convert to MP3
                execSync(`"${ffmpegPath}" -y -i "${inputPath}" -vn -acodec libmp3lame -q:a 2 "${outputPath}"`, {
                    stdio: 'pipe'
                });
                console.log(`Converted to: ${outputPath} (using ${ffmpegPath})`);
                return outputPath;
            } catch (error: any) {
                console.log(`FFmpeg not found at: ${ffmpegPath}, trying next...`);
                continue;
            }
        }

        throw new Error(`Failed to convert video to MP3. FFmpeg not found. Install ffmpeg: winget install ffmpeg`);
    }

    /**
     * Transcribes audio/video file using ElevenLabs Speech-to-Text API (Scribe v1).
     * @param filePath - Path to the audio or video file to transcribe.
     * @returns The transcribed text.
     */
    static async transcribeAudio(filePath: string): Promise<string> {
        if (!ELEVENLABS_API_KEY) {
            throw new Error("ElevenLabs API Key is missing");
        }

        // Verify file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        console.log(`Transcribing file: ${filePath}`);
        console.log(`File size: ${fs.statSync(filePath).size} bytes`);

        // Convert WebM to MP3 if needed
        let audioPath = filePath;
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.webm' || ext === '.mp4' || ext === '.mov') {
            audioPath = this.convertToMp3(filePath);
        }

        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(audioPath));
            formData.append('model_id', 'scribe_v1');

            const response = await axios.post(
                `${API_URL}/speech-to-text`,
                formData,
                {
                    headers: {
                        'xi-api-key': ELEVENLABS_API_KEY,
                        ...formData.getHeaders(),
                    },
                }
            );

            // Cleanup converted MP3 file if we created one
            if (audioPath !== filePath && fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath);
            }

            // Response format: { text: "transcribed text", words: [...], ... }
            console.log('ElevenLabs STT response:', JSON.stringify(response.data, null, 2));
            return response.data.text || '';
        } catch (error: any) {
            // Cleanup converted MP3 file on error too
            if (audioPath !== filePath && fs.existsSync(audioPath)) {
                fs.unlinkSync(audioPath);
            }

            console.error("ElevenLabs STT Error Details:");
            console.error("  Status:", error.response?.status);
            console.error("  Data:", JSON.stringify(error.response?.data, null, 2));
            console.error("  Message:", error.message);
            throw new Error(`Failed to transcribe audio: ${error.response?.data?.detail?.message || error.message}`);
        }
    }

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
            // Use Gemini to apply the tonal prompt styles to the text without adding spoken tags
            try {
                // We pass tonalPrompt as the 'tone' argument to the helper
                finalText = await GeminiService.generateToneTags(text, tonalPrompt, context);
                console.log(`Applied tonalPrompt via Gemini: "${text}" -> "${finalText}"`);
            } catch (error) {
                console.warn("Failed to apply tonal prompt tags, using original text.", error);
            }
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
                    model_id: "eleven_v3", // Using Turbo v3
                    voice_settings: {
                        stability: 0, // Lower stability (0.3) encourages more emotive/varied performance
                        similarity_boost: 0.5, // Higher boost (0.75) ensures the voice stays true to the original sample
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

