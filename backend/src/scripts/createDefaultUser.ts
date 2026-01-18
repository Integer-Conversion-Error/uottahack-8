// src/scripts/createDefaultUser.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const createDefaultUser = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cuely';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // The hardcoded user ID from the frontend
        const defaultUserId = '65a000000000000000000000';

        // Check if user already exists
        const existingUser = await User.findById(defaultUserId);
        if (existingUser) {
            console.log('Default user already exists:', existingUser.email);
            mongoose.connection.close();
            process.exit(0);
            return;
        }

        // Create the default user with the specific ID
        const defaultUser = new User({
            _id: new mongoose.Types.ObjectId(defaultUserId),
            name: 'Alex Chen',
            email: 'alex@cuely.app',
            preferences: {
                voiceFeedback: true,
                liveTranscription: true,
                difficultyLevel: 'beginner',
                focusAreas: ['sarcasm', 'empathy']
            },
            stats: {
                overallEmpathyScore: 0,
                totalSessions: 0,
                totalPracticeTimeMinutes: 0,
                currentStreakDays: 0,
                longestStreakDays: 0,
                scenariosCompleted: 0,
                scenariosMastered: 0
            },
            skills: {
                facialExpression: 0,
                toneControl: 0,
                eyeContact: 0,
                bodyLanguage: 0
            },
            achievements: []
        });

        await defaultUser.save();
        console.log('Created default user successfully!');
        console.log('User ID:', defaultUser._id);
        console.log('Email:', defaultUser.email);
        console.log('Name:', defaultUser.name);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error creating default user:', error);
        process.exit(1);
    }
};

createDefaultUser();
