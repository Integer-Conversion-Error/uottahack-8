import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

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
     * Helper to convert Windows path to WSL path (e.g., C:\foo -> /mnt/c/foo)
     */
    private static toWslPath(winPath: string): string {
        if (process.platform !== 'win32') return winPath;
        // Turn backslashes to forward slashes
        const normalized = winPath.replace(/\\/g, '/');
        // Replace drive letter (e.g. C:) with /mnt/c
        return normalized.replace(/^([a-zA-Z]):/, (match, drive) => `/mnt/${drive.toLowerCase()}`);
    }

    /**
     * Helper to execute a command using spawn, piping stderr to console for visibility
     * and collecting stdout for the result.
     */
    private static spawnCommand(commandStr: string): Promise<string> {
        const { spawn } = require('child_process');
        return new Promise((resolve, reject) => {
            // Run via shell to support command strings with arguments
            const child = spawn(commandStr, { shell: true });

            let stdoutData = '';
            let stderrData = '';

            child.stdout.on('data', (data: any) => {
                stdoutData += data.toString();
            });

            child.stderr.on('data', (data: any) => {
                const str = data.toString();
                stderrData += str;
                // stream stderr to console for user visibility
                process.stderr.write(`[CLI] ${str}`);
            });

            child.on('close', (code: number) => {
                if (code === 0) {
                    resolve(stdoutData);
                } else {
                    reject(new Error(`Command failed with code ${code}\nStderr: ${stderrData}`));
                }
            });

            child.on('error', (err: any) => {
                reject(err);
            });
        });
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
        // Determine whether to use real CLI or mock
        const USE_MOCK = process.env.PRESAGE_USE_MOCK === 'true';
        const IS_WINDOWS = process.platform === 'win32';

        try {
            console.log(`[PresageService] Analyzing video: ${videoPath}`);

            if (USE_MOCK) {
                // Use mock script for development/demo
                const mockScriptPath = path.join(__dirname, '../scripts/mock_presage_cli.js');
                const stdout = await PresageService.spawnCommand(`node "${mockScriptPath}" "${videoPath}"`);
                const data = JSON.parse(stdout);
                return PresageService.processData(data);
            }

            // REAL PRESAGE FLOW:
            // 1. Create temp directory for frames
            const framesDir = path.join(os.tmpdir(), `presage_frames_${Date.now()}`);
            fs.mkdirSync(framesDir, { recursive: true });

            // 2. Extract frames using ffmpeg (30fps, numbered with microsecond timestamps)
            // Presage expects format: frame0000000000000.png (13 digits)
            // Convert to WSL paths if on Windows, as we'll run ffmpeg via WSL (since it's installed there)
            const videoPathWsl = IS_WINDOWS ? PresageService.toWslPath(videoPath) : videoPath;
            const framesDirWslForFfmpeg = IS_WINDOWS ? PresageService.toWslPath(framesDir) : framesDir;

            console.log(`[PresageService] Extracting frames to: ${framesDir} (WSL: ${framesDirWslForFfmpeg})`);

            // Removing -loglevel error to ensure we see output via spawn
            let ffmpegCmd = `ffmpeg -i "${videoPathWsl}" -vf fps=30 "${framesDirWslForFfmpeg}/frame%013d.png" -hide_banner`;
            if (IS_WINDOWS) {
                ffmpegCmd = `wsl -d Ubuntu-22.04 ${ffmpegCmd}`;
            }

            await PresageService.spawnCommand(ffmpegCmd);

            // 3. Call presage-cli with frame path pattern
            // Locate the CLI binary (assuming standard relative path from source)
            const cliPathWin = path.resolve(__dirname, '../../../presage-cpp/build/presage-cli');

            // Convert everything to WSL paths if on Windows
            const cliPath = IS_WINDOWS ? PresageService.toWslPath(cliPathWin) : cliPathWin;
            const framesDirWsl = IS_WINDOWS ? PresageService.toWslPath(framesDir) : framesDir;
            const framePattern = `${framesDirWsl}/frame%013d.png`;

            // Prepare command
            let cmd = `"${cliPath}" "${framePattern}"`;
            if (IS_WINDOWS) {
                // On Windows, wrap in wsl -e bash -c to correctly handle env vars
                const apiKey = process.env.PRESAGE_API_KEY || '';
                // Escape paths for bash double quotes if needed (though clean paths usually work)
                const safeCliPath = cliPath.replace(/"/g, '\\"');
                const safePattern = framePattern.replace(/"/g, '\\"');

                cmd = `wsl -d Ubuntu-22.04 -e bash -c "PRESAGE_API_KEY='${apiKey}' '${safeCliPath}' '${safePattern}'"`;
            }

            console.log(`[PresageService] Running CLI: ${cmd}`);
            const stdout = await PresageService.spawnCommand(cmd);

            // 4. Cleanup frames directory
            fs.rmSync(framesDir, { recursive: true, force: true });

            // 5. Parse and return metrics
            const data = JSON.parse(stdout);
            return PresageService.processData(data);

        } catch (error) {
            console.warn("[PresageService] Analysis failed:", error);
            // Fallback to mock if real fails? Or return null?
            // For now, return null to indicate failure
            return null;
        }
    }
}
