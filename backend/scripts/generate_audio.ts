import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ElevenLabsService } from '../src/services/elevenlabs.service';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const LESSON_FILE_PATH = path.join(__dirname, '../../frontend/cuely/data/Sarcasm.json');
const OUTPUT_DIR = path.join(__dirname, '../generated_audio');

async function generateAudioForLesson() {
    console.log(`Reading lesson file from: ${LESSON_FILE_PATH}`);

    if (!fs.existsSync(LESSON_FILE_PATH)) {
        console.error(`Lesson file not found at ${LESSON_FILE_PATH}`);
        process.exit(1);
    }

    const lessonData = JSON.parse(fs.readFileSync(LESSON_FILE_PATH, 'utf-8'));
    console.log(`Processing Lesson: ${lessonData.lessonName} (${lessonData.lessonId})`);

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const pages = lessonData.pages;
    for (const page of pages) {
        if (page.pageType === 'practice' && page.audioSample && page.transcript) {
            console.log(`\nGenerating audio for Page ${page.pageOrder}...`);
            console.log(`Transcript: "${page.transcript}"`);

            const tonalPrompt = page.audioSample.tonalPrompt;
            if (tonalPrompt) {
                console.log(`Tonal Prompt: "${tonalPrompt}"`);
            } else {
                console.log(`No tonal prompt found, using default/dynamic generation.`);
            }

            try {
                // Determine context if needed, though for now we rely on tonalPrompt or default
                const tone = "Sarcastic"; // Default fallback for this lesson if no prompt
                const context = page.scenario ? page.scenario.context : "";

                const audioBuffer = await ElevenLabsService.generateSpeech(
                    page.transcript,
                    "21m00Tcm4TlvDq8ikWAM", // Default voice (Rachel)
                    tonalPrompt,
                    tone,
                    context
                );

                const fileName = `${lessonData.lessonId}_page_${page.pageOrder}.mp3`;
                const filePath = path.join(OUTPUT_DIR, fileName);

                fs.writeFileSync(filePath, audioBuffer);
                console.log(`✅ Saved audio to: ${filePath}`);

            } catch (error) {
                console.error(`❌ Failed to generate/save audio for page ${page.pageOrder}:`, error);
            }
        }
    }
    console.log('\nAudio generation complete.');
}

generateAudioForLesson().catch(console.error);
