import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lesson from '../src/models/Lesson';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const lessons = await Lesson.find({});

        lessons.forEach(lesson => {
            console.log(`Lesson: ${lesson.lessonName}`);
            lesson.pages.forEach((page: any) => {
                if (page.pageType === 'practice' && page.scenario) {
                    console.log(`  Page ${page.pageOrder} Image URL: ${page.scenario.imageUrl || 'MISSING'}`);
                }
            });
        });

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

verifyImages();
