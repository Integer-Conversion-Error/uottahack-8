// src/index.ts

import 'reflect-metadata';
import app from './app';
import connectDB from './config/db';

const PORT = parseInt(process.env.PORT || '4000', 10);

// Debugging global handlers
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION:', reason);
    process.exit(1);
});

async function startServer() {
    try {
        console.log('🏁 Starting server initialization...');

        // Connect to MongoDB
        console.log('🔄 Calling connectDB...');
        await connectDB();
        console.log('✅ MongoDB connected (in startServer)');

        // Start Express server
        console.log('🔄 Calling app.listen...');
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Backend server running on http://0.0.0.0:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        });

        // Increase timeout to 5 minutes to allow for long Gemini video analysis
        server.setTimeout(300000);
        console.log('✅ app.listen called');
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();