export interface PresageExpressionData {
    happiness: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    neutral: number;
    disgust: number;
}

export interface PresageSessionData {
    baselineHeartRate?: number;
    avgHeartRateDuringResponse?: number;
    stressLevel?: 'low' | 'medium' | 'high';
    engagementScore?: number;
    expressions?: PresageExpressionData;
}

export class PresageService {
    /**
     * Placeholder for processing raw Presage data if we were receiving it directly.
     * Since the frontend is sending processed metrics, this serves as a type validator/pass-through.
     */
    static processData(data: any): PresageSessionData {
        // In a real SDK scenario, this might convert raw signals to these metrics.
        // For now, we sanitize/validate the input.
        return {
            baselineHeartRate: data.baselineHeartRate,
            avgHeartRateDuringResponse: data.avgHeartRateDuringResponse,
            stressLevel: data.stressLevel,
            engagementScore: data.engagementScore,
            expressions: data.expressions
        };
    }

    /**
     * Analyzes a video file using the Presage C++ SDK.
     * Steps:
     * 1. Extract frames from video using ffmpeg
     * 2. Call presage-cli with frame path pattern
     * 3. Parse and return metrics JSON
     * 
     * @param videoPath Absolute path to the video file
     */
    static async analyzeVideoFile(videoPath: string): Promise<PresageSessionData | null> {
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);
        const path = require('path');
        const fs = require('fs');
        const os = require('os');

        // Determine whether to use real CLI or mock
        const USE_MOCK = process.env.PRESAGE_USE_MOCK === 'true';

        try {
            console.log(`[PresageService] Analyzing video: ${videoPath}`);

            if (USE_MOCK) {
                // Use mock script for development/demo
                const mockScriptPath = path.join(__dirname, '../scripts/mock_presage_cli.js');
                const { stdout } = await execAsync(`node "${mockScriptPath}" "${videoPath}"`);
                const data = JSON.parse(stdout);
                return PresageService.processData(data);
            }

            // REAL PRESAGE FLOW:
            // 1. Create temp directory for frames
            const framesDir = path.join(os.tmpdir(), `presage_frames_${Date.now()}`);
            fs.mkdirSync(framesDir, { recursive: true });

            // 2. Extract frames using ffmpeg (30fps, numbered with microsecond timestamps)
            // Presage expects format: frame0000000000000.png (13 digits)
            console.log(`[PresageService] Extracting frames to: ${framesDir}`);
            await execAsync(`ffmpeg -i "${videoPath}" -vf fps=30 "${framesDir}/frame%013d.png" -hide_banner -loglevel error`);

            // 3. Call presage-cli with frame path pattern
            const cliPath = path.resolve(__dirname, '../../../presage-cpp/build/presage-cli');
            const framePattern = `${framesDir}/frame%013d.png`;

            console.log(`[PresageService] Running CLI: ${cliPath} "${framePattern}"`);
            const { stdout, stderr } = await execAsync(`"${cliPath}" "${framePattern}"`, {
                env: { ...process.env }
            });

            if (stderr) {
                console.warn("[PresageService] CLI stderr:", stderr);
            }

            // 4. Cleanup frames directory
            fs.rmSync(framesDir, { recursive: true, force: true });

            // 5. Parse and return metrics
            const data = JSON.parse(stdout);
            return PresageService.processData(data);

        } catch (error) {
            console.warn("[PresageService] Analysis failed:", error);
            return null;
        }
    }
}
