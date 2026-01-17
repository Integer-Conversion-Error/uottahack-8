import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username: string; // Just a display name
    xp: number;
    streak: number;
    completedLessons: mongoose.Types.ObjectId[]; // IDs of completed lessons
    stats: {
        visualCuesIdentified: number;
        audioCuesIdentified: number;
        contextGuessedCorrectly: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, default: 'Learner' },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    stats: {
        visualCuesIdentified: { type: Number, default: 0 },
        audioCuesIdentified: { type: Number, default: 0 },
        contextGuessedCorrectly: { type: Number, default: 0 },
    },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
