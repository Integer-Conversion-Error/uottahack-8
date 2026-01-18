import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Lesson from '../src/models/Lesson';
import { GeminiService } from '../src/services/gemini.service';

dotenv.config();

const IMAGES_DIR = path.join(__dirname, '../public/images');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

async function seedImagesDB() {
    console.log('Starting image seeding (MongoDB)...');

    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const lessons = await Lesson.find({});
        console.log(`Found ${lessons.length} lessons.`);

        // Process all lessons in parallel
        await Promise.all(lessons.map(async (lesson) => {
            console.log(`Processing lesson: ${lesson.lessonName}`);
            let modified = false;

            if (lesson.pages && lesson.pages.length > 0) {
                // Process all pages in parallel
                await Promise.all(lesson.pages.map(async (page: any) => {
                    if (page.pageType === 'practice' && page.scenario) {

                        // Check if imageUrl is missing or if the file doesn't exist
                        let shouldGenerate = !page.scenario.imageUrl;

                        if (page.scenario.imageUrl) {
                            const existingFileName = path.basename(page.scenario.imageUrl);
                            const existingPath = path.join(IMAGES_DIR, existingFileName);
                            if (!fs.existsSync(existingPath)) {
                                console.log(`  File missing for page ${page.pageOrder}: ${existingFileName}. Regenerating...`);
                                shouldGenerate = true;
                            }
                        }

                        if (shouldGenerate) {
                            console.log(`  Generating image for page ${page.pageOrder} of ${lesson.lessonName}...`);

                            const prompt = `Create a scene for the following scenario:
                            Context: ${page.scenario.context}
                            Description: ${page.scenario.description}
                            
                            Style: Modern, sleek, slightly stylized digital art.
                            `;

                            try {
                                const imageBuffer = await GeminiService.generateImage(prompt);

                                if (imageBuffer) {
                                    const fileName = `${lesson.lessonId}_${page.pageOrder}_${Date.now()}.png`;
                                    const imagePath = path.join(IMAGES_DIR, fileName);

                                    fs.writeFileSync(imagePath, imageBuffer);
                                    console.log(`    Saved to ${fileName}`);

                                    // Update Document
                                    page.scenario.imageUrl = `/images/${fileName}`;
                                    modified = true;
                                } else {
                                    console.warn(`    Failed to generate image for page ${page.pageOrder}`);
                                }
                            } catch (err: any) {
                                console.error(`    Error generating/saving image for page ${page.pageOrder}:`, err.message);
                            }
                        }
                    }
                }));
            }

            if (modified) {
                // Mark the pages path as modified to ensure Mongoose saves the mixed type changes
                lesson.markModified('pages');
                await lesson.save();
                console.log(`  Updated lesson ${lesson.lessonId}`);
            } else {
                console.log(`  No changes for lesson ${lesson.lessonId}`);
            }
        }));

        console.log('Image seeding completed.');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedImagesDB();
