// src/models/Session.ts

import mongoose, { Document, Schema } from 'mongoose';

// Individual practice result within a lesson
export interface IPracticeResult {
    practiceIndex: number;
    scenarioContext: string;
    transcript: string;
    videoUrl?: string;
    completedAt: Date;
    durationSeconds: number;
    analysis: {
        rawScore: number;
        facial_expression: { score: string; feedback: string };
        eye_contact: { score: string; feedback: string };
        body_language: { score: string; feedback: string };
        tone: { score: string; feedback: string };
    };
}

export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    lessonId?: string;
    startedAt: Date;
    completedAt?: Date;
    durationSeconds: number;
    sessionType: 'practice' | 'retry' | 'assessment';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    totalPractices: number;
    completedPractices: number;

    // Array of practice results for multi-practice lessons
    practices: IPracticeResult[];

    // Legacy single response (for backward compatibility)
    response: {
        audioUrl?: string;
        transcript?: string;
        webcamSnapshots: Array<{
            timestampSeconds: number;
            imageUrl: string;
            detectedEmotion: string;
        }>;
        presageData?: {
            baselineHeartRate: number;
            avgHeartRateDuringResponse: number;
            stressLevel: 'low' | 'medium' | 'high';
            engagementScore: number;
        };
    };

    // Legacy single analysis (for backward compatibility)
    analysis?: {
        rawScore: number;
        facial_expression: { score: string; feedback: string };
        eye_contact: { score: string; feedback: string };
        body_language: { score: string; feedback: string };
        tone: { score: string; feedback: string };
    };
}

const PracticeResultSchema = new Schema({
    practiceIndex: { type: Number, required: true },
    scenarioContext: { type: String },
    transcript: { type: String },
    videoUrl: { type: String },
    completedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 },
    analysis: {
        rawScore: Number,
        facial_expression: { score: String, feedback: String },
        eye_contact: { score: String, feedback: String },
        body_language: { score: String, feedback: String },
        tone: { score: String, feedback: String }
    }
}, { _id: false });

const SessionSchema = new Schema<ISession>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    lessonId: { type: String, required: false },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 },
    sessionType: { type: String, enum: ['practice', 'retry', 'assessment'], default: 'practice' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    totalPractices: { type: Number, default: 1 },
    completedPractices: { type: Number, default: 0 },

    // Array of practice results
    practices: [PracticeResultSchema],

    // Legacy fields for backward compatibility
    response: {
        audioUrl: String,
        transcript: String,
        webcamSnapshots: [{
            timestampSeconds: Number,
            imageUrl: String,
            detectedEmotion: String
        }],
        presageData: {
            baselineHeartRate: Number,
            avgHeartRateDuringResponse: Number,
            stressLevel: { type: String, enum: ['low', 'medium', 'high'] },
            engagementScore: Number
        }
    },

    analysis: {
        rawScore: Number,
        facial_expression: { score: String, feedback: String },
        eye_contact: { score: String, feedback: String },
        body_language: { score: String, feedback: String },
        tone: { score: String, feedback: String }
    }
}, { timestamps: true });

export default mongoose.model<ISession>('Session', SessionSchema);