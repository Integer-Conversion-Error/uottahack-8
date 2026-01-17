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
        overallScore: number;
        scores: {
            facialExpression: { score: number; issues: string[]; positives: string[] };
            tone: { score: number; issues: string[]; positives: string[] };
            content: { score: number; issues: string[]; positives: string[] };
            authenticity: { score: number; note: string };
        };
        coachingTips: string[];
    };
}

const SessionSchema = new Schema<ISession>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
        overallScore: Number,
        scores: {
            facialExpression: {
                score: Number,
                issues: [String],
                positives: [String]
            },
            tone: {
                score: Number,
                issues: [String],
                positives: [String]
            },
            content: {
                score: Number,
                issues: [String],
                positives: [String]
            },
            authenticity: {
                score: Number,
                note: String
            }
        },
        coachingTips: [String]
    }
}, { timestamps: true });

export default mongoose.model<ISession>('Session', SessionSchema);