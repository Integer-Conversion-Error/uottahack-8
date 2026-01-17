import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
    title: string;
    type: 'video_analysis' | 'context_guessing' | 'dialogue_practice' | 'static_learning';
    content: any; // Flexible content structure depending on type (JSON)
    xpReward: number;
    moduleId: mongoose.Types.ObjectId;
}

export interface IModule extends Document {
    title: string;
    description: string;
    order: number;
    lessons: mongoose.Types.ObjectId[];
}

const LessonSchema: Schema = new Schema({
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['video_analysis', 'context_guessing', 'dialogue_practice', 'static_learning'],
        required: true
    },
    content: { type: Schema.Types.Mixed, required: true },
    xpReward: { type: Number, default: 10 },
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
}, { timestamps: true });

const ModuleSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true },
    lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
}, { timestamps: true });

export const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);
export const Module = mongoose.model<IModule>('Module', ModuleSchema);
