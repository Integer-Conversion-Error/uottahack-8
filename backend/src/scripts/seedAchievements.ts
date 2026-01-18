// src/scripts/seedAchievements.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Achievement from '../models/Achievement';

dotenv.config();

const achievements = [
    {
        badgeId: 'first_lesson',
        name: 'First Steps',
        description: 'Complete your first practice scenario.',
        iconUrl: '/badges/first_steps.png',
        criteria: {
            type: 'lessons_completed',
            threshold: 1
        },
        rarity: 'common',
        points: 10
    },
    {
        badgeId: 'consistent_learner',
        name: 'Consistency is Key',
        description: 'Maintain a 3-day streak.',
        iconUrl: '/badges/streak_3.png',
        criteria: {
            type: 'streak',
            threshold: 3
        },
        rarity: 'common',
        points: 20
    },
    {
        badgeId: 'empathy_master',
        name: 'Empathy Master',
        description: 'Achieve an overall empathy score of 90 or higher.',
        iconUrl: '/badges/empathy_pro.png',
        criteria: {
            type: 'overall_score',
            threshold: 90
        },
        rarity: 'rare',
        points: 50
    },
    {
        badgeId: 'facial_pro',
        name: 'Facial Expression Pro',
        description: 'Get a facial expression score of 80 or higher.',
        iconUrl: '/badges/facial_pro.png',
        criteria: {
            type: 'facial_expression',
            threshold: 80
        },
        rarity: 'uncommon',
        points: 30
    },
    {
        badgeId: 'ten_scenarios',
        name: 'Decathlete',
        description: 'Complete 10 scenarios.',
        iconUrl: '/badges/ten_scenarios.png',
        criteria: {
            type: 'lessons_completed',
            threshold: 10
        },
        rarity: 'uncommon',
        points: 40
    }
];

const seedAchievements = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cuely';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing achievements
        await Achievement.deleteMany({});
        console.log('Cleared existing achievements');

        // Insert new achievements
        await Achievement.insertMany(achievements);
        console.log('Seeded initial achievements');

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding achievements:', error);
        process.exit(1);
    }
};

seedAchievements();
