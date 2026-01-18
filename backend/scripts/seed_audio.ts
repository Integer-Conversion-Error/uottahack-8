import fs from 'fs';
import path from 'path';
import { ElevenLabsService } from '../src/services/elevenlabs.service';
import { parseFile } from 'music-metadata';

const DATA_DIR = path.join(__dirname, '../../frontend/cuely/data');
const AUDIO_DIR = path.join(__dirname, '../public/audio');

// Ensure audio directory exists
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

async function seedAudio() {
    console.log('Starting audio seeding...');

    if (!fs.existsSync(DATA_DIR)) {
        console.error(`Data directory not found at ${DATA_DIR}`);
        return;
    }

    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(DATA_DIR, file);
        console.log(`Processing ${file}...`);

        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            let modified = false;

            if (content.pages) {
                for (const page of content.pages) {
                    if (page.audioSample && page.audioSample.url === "") {
                        console.log(`  Generating audio for page ${page.pageOrder}...`);

                        const text = page.transcript;
                        const tonalPrompt = page.audioSample.tonalPrompt;
                        // Use Sarcasm or derived tone if specific tone tag isn't available, 
                        // but logic in ElevenLabsService handles tone/tonalPrompt.
                        // We can pass the lesson name or a default tone if needed, 
                        // but let's rely on what's in the page or service default.
                        const tone = "Sarcastic"; // Defaulting to Sarcastic as per the lesson context usually

                        try {
                            const audioBuffer = await ElevenLabsService.generateSpeech(
                                text,
                                undefined, // Use default voice
                                tonalPrompt,
                                tone
                            );

                            const fileName = `${content.lessonId}_${page.pageOrder}_${Date.now()}.mp3`;
                            const audioPath = path.join(AUDIO_DIR, fileName);

                            fs.writeFileSync(audioPath, audioBuffer);
                            console.log(`    Saved to ${fileName}`);

                            // Get duration
                            const metadata = await parseFile(audioPath);
                            const duration = metadata.format.duration || 0;

                            // Update JSON
                            page.audioSample.url = `/audio/${fileName}`;
                            page.audioSample.duration = parseFloat(duration.toFixed(2)); // Round to 2 decimal places

                            modified = true;

                        } catch (err: any) {
                            console.error(`    Failed to generate/save audio for page ${page.pageOrder}:`, err.message);
                        }
                    }
                }
            }

            if (modified) {
                fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
                console.log(`  Updated ${file}`);
            } else {
                console.log(`  No changes for ${file}`);
            }

        } catch (e: any) {
            console.error(`Error processing ${file}:`, e.message);
        }
    }

    console.log('Audio seeding completed.');
}

seedAudio();
