import mongoose, { Document, Schema } from 'mongoose';

export interface IFacialCue extends Document {
    name: string; // e.g., "Raised Eyebrows"
    description: string;
    emotion: string; // e.g., "Surprise", "Skepticism"
    exampleImageUrls: string[]; // URLs to example images
    tips: string[]; // Tips for identifying or interpreting this cue
}

const FacialCueSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    emotion: { type: String, required: true },
    exampleImageUrls: [{ type: String }],
    tips: [{ type: String }],
}, { timestamps: true });

export default mongoose.model<IFacialCue>('FacialCue', FacialCueSchema);
