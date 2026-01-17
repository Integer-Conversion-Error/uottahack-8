// src/models/Lesson.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
    lessonId: string;
    lessonNumber: number;
    lessonName: string;
    pages: Array<{
        pageType: 'loading' | 'definition' | 'practice' | 'results';
        pageOrder: number;
        [key: string]: any; // Allow flexible page content
    }>;
}

const LessonSchema = new Schema<ILesson>({
    lessonId: {
        type: String,
        required: true,
        unique: true
    },
    lessonNumber: {
        type: Number,
        required: true
    },
    lessonName: {
        type: String,
        required: true
    },
    pages: [{
        pageType: {
            type: String,
            enum: ['loading', 'definition', 'practice', 'results'],
            required: true
        },
        pageOrder: {
            type: Number,
            required: true
        }
    }]
}, {
    timestamps: true,
    strict: false // Allow flexible schema for different page types
});

export default mongoose.model<ILesson>('Lesson', LessonSchema);