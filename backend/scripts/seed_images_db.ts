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

        for (const lesson of lessons) {
            console.log(`Processing lesson: ${lesson.lessonName}`);
            let modified = false;

            if (lesson.pages) {
                // We need to mutate the pages array. Mongoose arrays can be tricky, 
                // so we'll iterate and mark modified if we update something.
                for (const page of lesson.pages) {
                    if (page.pageType === 'practice' && page.scenario) {

                        // Check if imageUrl is missing or empty
                        // Accessing via 'any' or flexible schema since it might not be typed yet
                        const p = page as any;
                        if (!p.scenario.imageUrl) {
                            console.log(`  Generating image for page ${page.pageOrder}...`);

                            const prompt = `Create a scene for the following scenario:
                            Context: ${p.scenario.context}
                            Description: ${p.scenario.description}
                            
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
                                    p.scenario.imageUrl = `/images/${fileName}`;
                                    modified = true;
                                } else {
                                    console.warn(`    Failed to generate image for page ${page.pageOrder}`);
                                }
                            } catch (err: any) {
                                console.error(`    Error generating/saving image:`, err.message);
                            }
                        }
                    }
                }
            }

            if (modified) {
                // Mark the pages path as modified to ensure Mongoose saves the mixed type changes
                lesson.markModified('pages');
                await lesson.save();
                console.log(`  Updated lesson ${lesson.lessonId}`);
            } else {
                console.log(`  No changes for lesson ${lesson.lessonId}`);
            }
        }

        console.log('Image seeding completed.');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedImagesDB();
