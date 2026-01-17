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

        // Read generated lessons from Python script
        const lessonsPath = path.join(__dirname, '../../scripts/generated_structure.json');

        if (!fs.existsSync(lessonsPath)) {
            console.error('❌ generated_structure.json not found!');
            console.log('💡 Run: python scripts/generate_json.py --modules 3');
            process.exit(1);
        }

        const lessonsData = JSON.parse(fs.readFileSync(lessonsPath, 'utf-8'));

        // Handle both single lesson and array of lessons
        const lessons = Array.isArray(lessonsData) ? lessonsData : [lessonsData];

        // Clear existing lessons
        await Lesson.deleteMany({});
        console.log('🗑️  Cleared existing lessons');

        // Insert new lessons
        const result = await Lesson.insertMany(lessons);
        console.log(`✅ Seeded ${result.length} lessons\n`);

        console.log('📊 Lessons added:');
        result.forEach(lesson => {
            console.log(`   - ${lesson.lessonName} (Lesson ${lesson.lessonNumber})`);
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