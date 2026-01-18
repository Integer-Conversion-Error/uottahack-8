import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Lesson from '../src/models/Lesson';

dotenv.config();

async function seedLessons() {
    console.log('Starting lesson seeding...');

    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        // Read lessons from JSON file
        const lessonsPath = path.join(__dirname, '../../frontend/cuely/data/lessons.json');
        const lessonsData = JSON.parse(fs.readFileSync(lessonsPath, 'utf-8'));

        console.log(`Found ${lessonsData.length} lessons to seed.`);

        // Clear existing lessons
        await Lesson.deleteMany({});
        console.log('Cleared existing lessons');

        // Insert new lessons
        for (const lessonData of lessonsData) {
            const lesson = new Lesson(lessonData);
            await lesson.save();
            console.log(`✓ Seeded lesson: ${lessonData.lessonName}`);
        }

        console.log('Lesson seeding completed successfully!');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedLessons();
