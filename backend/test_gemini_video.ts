
import dotenv from 'dotenv';
import { GeminiService } from './src/services/gemini.service';
import path from 'path';

dotenv.config();

async function testVideoAnalysis() {
    console.log("Starting Video Analysis Test...");

    // Hardcoded test parameters
    // Ensure you have a file named 'test_video.mp4' in the backend root or update this path
    const videoPath = path.join(__dirname, 'test_video.mp4');

    const tone = "Sarcasm";
    const promptContext = "Friend: 'Wow, amazing weather we're having today.' (It is pouring rain)";

    console.log(`\nParameters:`);
    console.log(`- Video: ${videoPath}`);
    console.log(`- Tone: ${tone}`);
    console.log(`- Context: ${promptContext}`);

    try {
        console.log("\nSending to Gemini...");
        const result = await GeminiService.analyzeVideo(videoPath, tone, promptContext);

        console.log("\nAnalysis Result (Raw JSON):");
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error("\nTest Failed:", error);
    }
}

testVideoAnalysis();
