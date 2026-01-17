// src/models/User.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    email: string;
    name: string;
    createdAt: Date;
    lastLogin: Date;

    preferences: {
        voiceFeedback: boolean;
        liveTranscription: boolean;
        difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
        focusAreas: string[];
    };

    stats: {
        overallEmpathyScore: number;
        totalSessions: number;
        totalPracticeTimeMinutes: number;
        currentStreakDays: number;
        longestStreakDays: number;
        scenariosCompleted: number;
        scenariosMastered: number;
    };

    skills: {
        facialExpression: number;
        toneControl: number;
        eyeContact: number;
        bodyLanguage: number;
    };

    achievements: Array<{
        badgeId: string;
        unlockedAt: Date;
        progress: number;
    }>;
}

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },

    preferences: {
        voiceFeedback: { type: Boolean, default: true },
        liveTranscription: { type: Boolean, default: true },
        difficultyLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        },
        focusAreas: [{ type: String }]
    },

    stats: {
        overallEmpathyScore: { type: Number, default: 0 },
        totalSessions: { type: Number, default: 0 },
        totalPracticeTimeMinutes: { type: Number, default: 0 },
        currentStreakDays: { type: Number, default: 0 },
        longestStreakDays: { type: Number, default: 0 },
        scenariosCompleted: { type: Number, default: 0 },
        scenariosMastered: { type: Number, default: 0 }
    },

    skills: {
        facialExpression: { type: Number, default: 0 },
        toneControl: { type: Number, default: 0 },
        eyeContact: { type: Number, default: 0 },
        bodyLanguage: { type: Number, default: 0 }
    },

    achievements: [{
        badgeId: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 }
    }]
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);