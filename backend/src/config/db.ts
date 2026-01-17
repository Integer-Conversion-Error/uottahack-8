// src/config/db.ts

import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        await mongoose.connect(mongoURI);

        console.log('✅ MongoDB connected successfully');

        if (mongoose.connection.db) {
            console.log(`🔌 Connected to database: ${mongoose.connection.db.databaseName}`);
        }

    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
    process.exit(0);
});

export default connectDB;