// src/models/Lesson.ts

import mongoose, { Document, Schema } from 'mongoose';

// Sub-interfaces for practice pages
export interface IScenario {
    context: string;
    description: string;
    imageUrl?: string;
}

export interface IAudioSample {
    url: string;
    duration: number;
    tonalPrompt?: string;
    toneTag?: string;
}

export interface IAppropriateResponse {
    description: string;
    keyElements: string[];
}

// Unified page interface (flat structure for frontend)
export interface ILessonPage {
    pageType: 'definition' | 'practice';
    pageOrder: number;
    // Definition fields
    term?: string;
    definition?: string;
    visualCues?: string[];
    toneCues?: string[];
    // Practice fields
    scenario?: IScenario;
    audioSample?: IAudioSample;
    transcript?: string;
    appropriateResponse?: IAppropriateResponse;
}

export interface ILesson extends Document {
    lessonId: string;
    lessonNumber: number;
    lessonName: string;
    difficulty?: string;
    pages: ILessonPage[];
    createdAt: Date;
    updatedAt: Date;
}

const ScenarioSchema = new Schema({
    context: String,
    description: String,
    imageUrl: String
}, { _id: false });

const AudioSampleSchema = new Schema({
    url: String,
    duration: Number,
    tonalPrompt: String,
    toneTag: String
}, { _id: false });

const AppropriateResponseSchema = new Schema({
    description: String,
    keyElements: [String]
}, { _id: false });

const LessonPageSchema = new Schema({
    pageType: {
        type: String,
        enum: ['definition', 'practice'],
        required: true
    },
    pageOrder: {
        type: Number,
        required: true
    },
    // Definition fields
    term: String,
    definition: String,
    visualCues: [String],
    toneCues: [String],
    // Practice fields
    scenario: ScenarioSchema,
    audioSample: AudioSampleSchema,
    transcript: String,
    appropriateResponse: AppropriateResponseSchema
}, { _id: false });

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
    difficulty: {
        type: String,
        default: 'beginner'
    },
    pages: [LessonPageSchema]
}, {
    timestamps: true
});

export default mongoose.model<ILesson>('Lesson', LessonSchema);