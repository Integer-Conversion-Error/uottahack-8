// src/models/Scenario.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IScenario extends Document {
    title: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    durationMinutes: number;
    description: string;

    context: {
        characterName: string;
        characterRelationship: string;
        characterEmotionalState: string;
        situation: string;
    };

    audio: {
        elevenlabsVoiceId: string;
        audioUrl: string;
        durationSeconds: number;
        transcript: string;
        voiceSettings: {
            stability: number;
            similarityBoost: number;
            style: number;
            useSpeakerBoost: boolean;
        };
    };

    focusAreas: string[];
    idealResponses: string[];
    commonMistakes: string[];

    stats: {
        timesAttempted: number;
        averageScore: number;
        completionRate: number;
    };
}

const ScenarioSchema = new Schema<IScenario>({
    title: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    durationMinutes: { type: Number, required: true },
    description: { type: String, required: true },

    context: {
        characterName: String,
        characterRelationship: String,
        characterEmotionalState: String,
        situation: String
    },

    audio: {
        elevenlabsVoiceId: String,
        audioUrl: String,
        durationSeconds: Number,
        transcript: String,
        voiceSettings: {
            stability: Number,
            similarityBoost: Number,
            style: Number,
            useSpeakerBoost: Boolean
        }
    },

    focusAreas: [String],
    idealResponses: [String],
    commonMistakes: [String],

    stats: {
        timesAttempted: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 }
    }
}, { timestamps: true });

export default mongoose.model<IScenario>('Scenario', ScenarioSchema);