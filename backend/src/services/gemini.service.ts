import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize the standard Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// Initialize the File Manager for uploads
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || '');

export class GeminiService {

<<<<<<< HEAD
  static async analyzeVideo(filePath: string, tone: string, promptContext: string): Promise<any> {
=======




  static async analyzeVideo(filePath: string, tone: string, promptContext: string, presageData?: any): Promise<any> {
>>>>>>> origin/backend
    try {
      const absolutePath = path.resolve(filePath);
      console.log(`[GeminiService] Starting upload: ${absolutePath}`);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found at path: ${absolutePath}`);
      }

      const stats = fs.statSync(absolutePath);
      if (stats.size === 0) {
        throw new Error("File is empty (0 bytes)");
      }

      // 1. Upload using GoogleAIFileManager
      const uploadResponse = await fileManager.uploadFile(absolutePath, {
        mimeType: "video/mp4",
        displayName: "User Session Video",
      });

      console.log(`[GeminiService] Uploaded file: ${uploadResponse.file.name} (${uploadResponse.file.uri})`);

      // 2. Poll for processing completion
      let file = await fileManager.getFile(uploadResponse.file.name);
      while (file.state === FileState.PROCESSING) {
        console.log("[GeminiService] Processing video...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        file = await fileManager.getFile(uploadResponse.file.name);
      }

      if (file.state === FileState.FAILED) {
        throw new Error("Video processing failed.");
      }

      console.log(`[GeminiService] Processing complete. State: ${file.state}`);

      // 3. Generate Content
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use 1.5 Flash for video

      let prompt = `
          Analyze this video for social cues. 
          
          Context:
          - Target Tone: "${tone}"
          - Situation/Prompt user is responding to: "${promptContext}"`;

      if (presageData) {
        prompt += `\n          - Supplementary Biometric Data (Presage): ${JSON.stringify(presageData)}`;
      }

      prompt += `
          
          Grade the user on these 4 items:
          1. Facial Expression
          2. Eye Contact
          3. Body Language
          4. Tone (Vocal/Speech)

          For each item, provide:
          - A score from these options: "thumbs-up", "thumbs-sideways", "thumbs-down"
          - A 30-40 word feedback section explaining the score.

          Return the result ONLY as a valid JSON object with the following schema:
          {
            "facial_expression": { "score": "string", "feedback": "string" },
            "eye_contact": { "score": "string", "feedback": "string" },
            "body_language": { "score": "string", "feedback": "string" },
            "tone": { "score": "string", "feedback": "string" }
          }
        `;

      const result = await model.generateContent([
        {
          fileData: {
            mimeType: file.mimeType,
            fileUri: file.uri
          }
        },
        { text: prompt }
      ]);

      const responseText = result.response.text();
      console.log("[GeminiService] Raw Response:", responseText);

      // Parse JSON
      const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedAnalysis = JSON.parse(jsonStr);

      // Cleanup: delete file from Gemini to save storage
      await fileManager.deleteFile(uploadResponse.file.name);
      console.log("[GeminiService] Cleaned up remote file");

      return parsedAnalysis;

    } catch (error) {
      console.error("Gemini Video Analysis Error:", error);
      throw error;
    }
  }
}
