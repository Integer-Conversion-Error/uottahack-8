import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Lesson from '../src/models/Lesson';
import { ElevenLabsService } from '../src/services/elevenlabs.service';
import { parseFile } from 'music-metadata';

dotenv.config();

const AUDIO_DIR = path.join(__dirname, '../public/audio');

// Ensure audio directory exists
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

async function seedAudioDB() {
    console.log('Starting audio seeding (MongoDB)...');

    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const lessons = await Lesson.find({});
        console.log(`Found ${lessons.length} lessons.`);

        for (const lesson of lessons) {
            console.log(`Processing lesson: ${lesson.lessonName}`);
            let modified = false;

            if (lesson.pages) {
                // We need to mutate the pages array.
                for (const page of lesson.pages) {
                    // Check if it's a practice page and has audioSample
                    // Accessing via 'any' since strict:false and it might not be typed
                    const p = page as any;

                    if (page.pageType === 'practice' && p.audioSample) {

                        // Check if audioSample.url is missing or empty
                        if (!p.audioSample.url) {
                            console.log(`  Generating audio for page ${page.pageOrder}...`);

                            const text = p.transcript;
                            const tonalPrompt = p.audioSample.tonalPrompt;
                            const tone = "Sarcastic"; // Default fallback

                            if (!text) {
                                console.warn(`    No transcript for page ${page.pageOrder}, skipping.`);
                                continue;
                            }

                            try {
                                const audioBuffer = await ElevenLabsService.generateSpeech(
                                    text,
                                    undefined, // Default voice
                                    tonalPrompt,
                                    tone
                                );

                                if (audioBuffer) {
                                    const fileName = `${lesson.lessonId}_${page.pageOrder}_${Date.now()}.mp3`;
                                    const audioPath = path.join(AUDIO_DIR, fileName);

                                    fs.writeFileSync(audioPath, audioBuffer);
                                    console.log(`    Saved to ${fileName}`);

                                    // Get duration
                                    const metadata = await parseFile(audioPath);
                                    const duration = metadata.format.duration || 0;

                                    // Update Document
                                    p.audioSample.url = `/audio/${fileName}`;
                                    p.audioSample.duration = parseFloat(duration.toFixed(2));
                                    modified = true;
                                } else {
                                    console.warn(`    Failed to generate audio for page ${page.pageOrder}`);
                                }
                            } catch (err: any) {
                                console.error(`    Error generating/saving audio:`, err.message);
                            }
                        } else {
                            // If URL exists, maybe assert it is valid? 
                            // For now, assume if it's there, it's good.
                        }
                    }
                }
            }

            if (modified) {
                lesson.markModified('pages');
                await lesson.save();
                console.log(`  Updated lesson ${lesson.lessonId}`);
            } else {
                console.log(`  No changes for lesson ${lesson.lessonId}`);
            }
        }

        console.log('Audio seeding completed.');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedAudioDB();
