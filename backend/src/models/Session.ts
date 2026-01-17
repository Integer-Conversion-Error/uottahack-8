// src/models/Session.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    scenarioId: mongoose.Types.ObjectId;
    startedAt: Date;
    completedAt?: Date;
    durationSeconds: number;
    sessionType: 'practice' | 'retry' | 'assessment';
    difficulty: 'beginner' | 'intermediate' | 'advanced';

    // Response data
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

    // Analysis results
    analysis?: {
        rawScore: number;
        facial_expression: { score: string; feedback: string };
        eye_contact: { score: string; feedback: string };
        body_language: { score: string; feedback: string };
        tone: { score: string; feedback: string };
    };
}

const SessionSchema = new Schema<ISession>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    scenarioId: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 },
    sessionType: { type: String, enum: ['practice', 'retry', 'assessment'], default: 'practice' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },

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
        rawScore: Number, // Calculated numeric score
        facial_expression: { score: String, feedback: String },
        eye_contact: { score: String, feedback: String },
        body_language: { score: String, feedback: String },
        tone: { score: String, feedback: String }
    }
}, { timestamps: true });

export default mongoose.model<ISession>('Session', SessionSchema);