// src/scripts/seedDatabase.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Scenario from '../models/Scenario';
import Achievement from '../models/Achievement';

dotenv.config();

const scenarios = [
    {
        title: "Friend Lost Job",
        category: "friends",
        difficulty: "intermediate",
        durationMinutes: 5,
        description: "Your close friend Sarah has been acting distant lately. She just called you, sounding upset.",
        context: {
            characterName: "Sarah",
            characterRelationship: "Close friend from college",
            characterEmotionalState: "Devastated, feeling like a failure",
            situation: "Just got laid off from dream job"
        },
        audio: {
            elevenlabsVoiceId: "21m00Tcm4TlvDq8ikWAM",
            audioUrl: "/scenarios/friend_lost_job.mp3",
            durationSeconds: 45,
            transcript: "I just got laid off today. I feel like such a failure. I don't know what I'm going to do. I've been working there for three years and they just... let me go. What am I supposed to tell my parents?",
            voiceSettings: {
                stability: 0.4,
                similarityBoost: 0.75,
                style: 0.6,
                useSpeakerBoost: true
            }
        },
        focusAreas: ["facial_empathy", "tone_warmth", "avoiding_premature_solutions"],
        idealResponses: [
            "That sounds incredibly overwhelming. How are you feeling right now?",
            "I'm so sorry you're going through this. That must be really scary."
        ],
        commonMistakes: [
            "Jumping to solutions immediately",
            "Minimizing emotions ('It'll be fine!')",
            "Making it about themselves"
        ],
        stats: {
            timesAttempted: 0,
            averageScore: 0,
            completionRate: 0
        }
    },
    {
        title: "Angry Customer",
        category: "customer_service",
        difficulty: "advanced",
        durationMinutes: 6,
        description: "A customer received a damaged product and is furious about the lack of response.",
        context: {
            characterName: "Michael",
            characterRelationship: "Upset customer",
            characterEmotionalState: "Angry, frustrated, feeling ignored",
            situation: "Damaged delivery, no response for 3 days"
        },
        audio: {
            elevenlabsVoiceId: "ErXwobaYiN019PkySvjV",
            audioUrl: "/scenarios/angry_customer.mp3",
            durationSeconds: 38,
            transcript: "This is absolutely unacceptable! I've been waiting for THREE DAYS and nobody has responded to my emails. The product arrived damaged and I have an important presentation tomorrow!",
            voiceSettings: {
                stability: 0.3,
                similarityBoost: 0.8,
                style: 0.8,
                useSpeakerBoost: true
            }
        },
        focusAreas: ["de-escalation", "maintaining_composure", "active_listening"],
        idealResponses: [
            "I understand your frustration. Let me make this right for you.",
            "You're absolutely right to be upset. I apologize for the delay."
        ],
        commonMistakes: [
            "Getting defensive",
            "Interrupting while customer vents",
            "Making excuses"
        ],
        stats: {
            timesAttempted: 0,
            averageScore: 0,
            completionRate: 0
        }
    },
    {
        title: "Anxious Team Member",
        category: "workplace",
        difficulty: "beginner",
        durationMinutes: 4,
        description: "Your coworker is worried about an upcoming presentation to executives.",
        context: {
            characterName: "Alex",
            characterRelationship: "Coworker",
            characterEmotionalState: "Anxious, self-doubting",
            situation: "Big presentation tomorrow"
        },
        audio: {
            elevenlabsVoiceId: "21m00Tcm4TlvDq8ikWAM",
            audioUrl: "/scenarios/anxious_coworker.mp3",
            durationSeconds: 30,
            transcript: "I'm really nervous about tomorrow's presentation. What if I mess up in front of everyone? I keep forgetting what I'm supposed to say...",
            voiceSettings: {
                stability: 0.5,
                similarityBoost: 0.75,
                style: 0.5,
                useSpeakerBoost: true
            }
        },
        focusAreas: ["reassurance", "validation", "encouragement"],
        idealResponses: [
            "It's completely normal to feel nervous. What specifically worries you most?",
            "You've prepared well. Let's practice together if that helps."
        ],
        commonMistakes: [
            "Dismissing their concerns",
            "Saying 'don't worry' without acknowledging feelings"
        ],
        stats: {
            timesAttempted: 0,
            averageScore: 0,
            completionRate: 0
        }
    }
];

const achievements = [
    {
        badgeId: "first_session",
        name: "First Steps",
        description: "Complete your first training session",
        iconUrl: "/badges/first_session.svg",
        criteria: { type: "sessions_completed", threshold: 1 },
        rarity: "common",
        points: 10
    },
    {
        badgeId: "7_day_streak",
        name: "Week Warrior",
        description: "Practice for 7 days in a row",
        iconUrl: "/badges/7_day_streak.svg",
        criteria: { type: "streak_days", threshold: 7 },
        rarity: "uncommon",
        points: 25
    },
    {
        badgeId: "tone_master",
        name: "Tone Master",
        description: "Match target tone with 90%+ accuracy 10 times",
        iconUrl: "/badges/tone_master.svg",
        criteria: { type: "tone_score", threshold: 90, count: 10 },
        rarity: "rare",
        points: 50
    },
    {
        badgeId: "empathy_expert",
        name: "Empathy Expert",
        description: "Achieve overall empathy score of 90+",
        iconUrl: "/badges/empathy_expert.svg",
        criteria: { type: "overall_score", threshold: 90 },
        rarity: "legendary",
        points: 100
    },
    {
        badgeId: "face_reader",
        name: "Face Reader",
        description: "Correctly identify 50 facial expressions",
        iconUrl: "/badges/face_reader.svg",
        criteria: { type: "facial_expressions_identified", threshold: 50 },
        rarity: "uncommon",
        points: 30
    }
];

async function seedDatabase() {
    console.log('🌱 Starting database seed...\n');

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ Connected to MongoDB\n');

        // Seed Scenarios
        console.log('📚 Seeding scenarios...');
        await Scenario.deleteMany({});
        const scenarioResult = await Scenario.insertMany(scenarios);
        console.log(`✅ Seeded ${scenarioResult.length} scenarios\n`);

        // Seed Achievements
        console.log('🏆 Seeding achievements...');
        await Achievement.deleteMany({});
        const achievementResult = await Achievement.insertMany(achievements);
        console.log(`✅ Seeded ${achievementResult.length} achievements\n`);

        console.log('🎉 Database seeding complete!');
        console.log('\n📊 Summary:');
        console.log(`   - Scenarios: ${scenarioResult.length}`);
        console.log(`   - Achievements: ${achievementResult.length}`);
        console.log('\n✨ Your database is ready to use!\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📦 MongoDB connection closed');
        process.exit(0);
    }
}

seedDatabase();