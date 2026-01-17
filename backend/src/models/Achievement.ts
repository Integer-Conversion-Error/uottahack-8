// src/models/Achievement.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
    badgeId: string;
    name: string;
    description: string;
    iconUrl: string;

    criteria: {
        type: string;
        threshold: number;
        count?: number;
    };

    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
    points: number;
}

const AchievementSchema = new Schema<IAchievement>({
    badgeId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    iconUrl: {
        type: String,
        required: true
    },

    criteria: {
        type: {
            type: String,
            required: true
        },
        threshold: {
            type: Number,
            required: true
        },
        count: {
            type: Number
        }
    },

    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'legendary'],
        default: 'common'
    },
    points: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);