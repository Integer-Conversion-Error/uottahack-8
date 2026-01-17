/**
 * This script simulates the output of the Presage C++ SDK for testing purposes.
 * It accepts a video file path as an argument (ignored) and outputs a JSON object
 * matching the PresageSessionData interface.
 */

// Random number generator helper
const random = (min, max) => Math.random() * (max - min) + min;

const mockData = {
    baselineHeartRate: Math.round(random(60, 80)),
    avgHeartRateDuringResponse: Math.round(random(70, 90)),
    stressLevel: ['low', 'medium', 'high'][Math.floor(random(0, 3))],
    engagementScore: Math.round(random(60, 95)),
    expressions: {
        happiness: parseFloat(random(0, 1).toFixed(2)),
        sadness: parseFloat(random(0, 0.3).toFixed(2)),
        anger: parseFloat(random(0, 0.2).toFixed(2)),
        fear: parseFloat(random(0, 0.2).toFixed(2)),
        surprise: parseFloat(random(0, 0.5).toFixed(2)),
        neutral: parseFloat(random(0.1, 0.4).toFixed(2)),
        disgust: parseFloat(random(0, 0.1).toFixed(2))
    }
};

console.log(JSON.stringify(mockData));
