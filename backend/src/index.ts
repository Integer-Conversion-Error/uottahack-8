// src/index.ts

import 'reflect-metadata';
import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 4000;

async function startServer() {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('✅ MongoDB connected');

        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Backend server running on http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();