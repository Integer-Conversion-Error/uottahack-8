import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class GeminiService {





  static async analyzeVideo(filePath: string, tone: string, promptContext: string = "No specific context provided"): Promise<any> {
    try {
      const uploadResult = await ai.files.upload({
        file: filePath,
        config: {
          mimeType: "video/mp4",
          displayName: "User Uploaded Video"
        }
      });

      if (!uploadResult.name) {
        throw new Error("Upload failed: No file name returned");
      }
      const file = uploadResult;
      console.log(`Uploaded video: ${file.name} (${file.uri})`);

      let processedFile = await ai.files.get({ name: file.name! });

      while (processedFile.state === "PROCESSING") {
        console.log("Processing video...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        processedFile = await ai.files.get({ name: file.name! });
      }

      if (processedFile.state === "FAILED") {
        throw new Error("Video processing failed.");
      }

      if (!processedFile.uri || !processedFile.mimeType) {
        throw new Error("Video processing completed but returned no URI or MIME type");
      }

      console.log(`Video processing complete: ${processedFile.uri}`);

      const prompt = `
          Analyze this video for social cues. 
          
          Context:
          - Target Tone: "${tone}"
          - Situation/Prompt user is responding to: "${promptContext}"
          
          Grade the user on these 4 items based on how well they respond to the situation:
          1. Facial Expression
          2. Eye Contact
          3. Body Language
          4. Tone (Vocal/Speech)

          For each item, provide:
          - A score from these options: "thumbs-up", "thumbs-sideways", "thumbs-down"
          - A 30-40 word feedback section explaining the score and offering advice.

          Return the result ONLY as a valid JSON object with the following schema:
          {
            "facial_expression": { "score": "string", "feedback": "string" },
            "eye_contact": { "score": "string", "feedback": "string" },
            "body_language": { "score": "string", "feedback": "string" },
            "tone": { "score": "string", "feedback": "string" }
          }
        `;

      let retries = 3;
      while (retries > 0) {
        try {
          const result = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [
              {
                fileData: {
                  mimeType: processedFile.mimeType!,
                  fileUri: processedFile.uri!
                }
              },
              { text: prompt }
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  facial_expression: {
                    type: "object",
                    properties: {
                      score: { type: "string", enum: ["thumbs-up", "thumbs-sideways", "thumbs-down"] },
                      feedback: { type: "string" }
                    },
                    required: ["score", "feedback"]
                  },
                  eye_contact: {
                    type: "object",
                    properties: {
                      score: { type: "string", enum: ["thumbs-up", "thumbs-sideways", "thumbs-down"] },
                      feedback: { type: "string" }
                    },
                    required: ["score", "feedback"]
                  },
                  body_language: {
                    type: "object",
                    properties: {
                      score: { type: "string", enum: ["thumbs-up", "thumbs-sideways", "thumbs-down"] },
                      feedback: { type: "string" }
                    },
                    required: ["score", "feedback"]
                  },
                  tone: {
                    type: "object",
                    properties: {
                      score: { type: "string", enum: ["thumbs-up", "thumbs-sideways", "thumbs-down"] },
                      feedback: { type: "string" }
                    },
                    required: ["score", "feedback"]
                  }
                },
                required: ["facial_expression", "eye_contact", "body_language", "tone"]
              }
            }
          });

          // result.text should be valid JSON now
          const responseText = result.text || "{}";
          return JSON.parse(responseText);
        } catch (jsonError) {
          console.warn(`Analysis failed, retrying... (${retries} left)`, jsonError);
          retries--;
          if (retries === 0) throw jsonError;
          await new Promise(r => setTimeout(r, 1000));
        }
      }

    } catch (error) {
      console.error("Gemini Video Analysis Error:", error);
      throw error;
    }
  }
}
