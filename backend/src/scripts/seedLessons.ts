// src/scripts/seedLessons.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lesson from '../models/Lesson';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function seedLessons() {
    console.log('📚 Starting lesson seed...\n');

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ Connected to MongoDB\n');

        // Path to frontend data directory
        const frontendDataPath = path.join(__dirname, '../../../frontend/cuely/data');
        const lessonFiles = ['Empathy_Introduction.json', 'Sarcasm.json'];

        const lessons: any[] = [];

        for (const fileName of lessonFiles) {
            const filePath = path.join(frontendDataPath, fileName);
            if (fs.existsSync(filePath)) {
                const lessonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                // Ensure difficulty is present (extracted from filename or added manually)
                if (!lessonData.difficulty) {
                    lessonData.difficulty = fileName.toLowerCase().includes('beg') ? 'beginner' : 'intermediate';
                }
                lessons.push(lessonData);
            } else {
                console.warn(`⚠️  Warning: ${fileName} not found at ${filePath}`);
            }
        }

        if (lessons.length === 0) {
            console.error('❌ No lesson files found to seed!');
            process.exit(1);
        }

        // Clear existing lessons
        await Lesson.deleteMany({});
        console.log('🗑️  Cleared existing lessons');

        // Insert new lessons
        const result = await Lesson.insertMany(lessons);
        console.log(`✅ Seeded ${result.length} lessons\n`);

        console.log('📊 Lessons added:');
        result.forEach(lesson => {
            console.log(`   - ${lesson.lessonName} (Lesson ${lesson.lessonNumber}) [${lesson.lessonId}]`);
        });

        console.log('\n🎉 Lesson seeding complete!\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('📦 MongoDB connection closed');
        process.exit(0);
    }
}

seedLessons();