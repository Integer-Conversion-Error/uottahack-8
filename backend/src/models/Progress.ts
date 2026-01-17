// src/models/Progress.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date;

    sessionsCompleted: number;
    totalPracticeMinutes: number;
    averageScore: number;

    skillScores: {
        facialExpression: number;
        toneControl: number;
        eyeContact: number;
        bodyLanguage: number;
    };

    achievementsUnlocked: string[];

    isStreakDay: boolean;
    currentStreak: number;
}

const ProgressSchema = new Schema<IProgress>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },

    sessionsCompleted: { type: Number, default: 0 },
    totalPracticeMinutes: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },

    skillScores: {
        facialExpression: { type: Number, default: 0 },
        toneControl: { type: Number, default: 0 },
        eyeContact: { type: Number, default: 0 },
        bodyLanguage: { type: Number, default: 0 }
    },

    achievementsUnlocked: [{ type: String }],

    isStreakDay: { type: Boolean, default: false },
    currentStreak: { type: Number, default: 0 }
}, { timestamps: true });

// Compound index for unique user + date
ProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IProgress>('Progress', ProgressSchema);