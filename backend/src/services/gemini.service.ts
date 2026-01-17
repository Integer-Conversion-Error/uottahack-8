import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class GeminiService {



  // Analyzes facial expressions from an image
  static async analyzeFacialCues(imageData: Buffer, mimeType: string): Promise<any> {
    try {
      const prompt = "Analyze the facial cues in this image. Identify the emotion, and list specific facial features (brows, eyes, mouth) that indicate this emotion. Provide feedback on how to interpret this.";

      const contents = [
        {
          inlineData: {
            data: imageData.toString('base64'),
            mimeType: mimeType
          }
        },
        { text: prompt }
      ];

      const result = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: contents
      });
      return result.text || "";
    } catch (error) {
      console.error("Gemini Vision Analysis Error:", error);
      throw new Error("Failed to analyze image");
    }
  }

  static async analyzeResponse(userResponse: string, context: string): Promise<any> {
    const prompt = `
      Context: ${context}
      User Response: "${userResponse}"
      
      Analyze the user's response. Is it appropriate for the context? 
      Give constructive feedback and suggest 2 better alternatives.
      Return as JSON:
      {
        "isAppropriate": boolean,
        "feedback": "string",
        "betterAlternatives": ["string", "string"]
      }
    `;

    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: [{ text: prompt }]
      });
      const text = result.text || "";
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Gemini Response Analysis Error:", error);
      throw new Error("Failed to analyze response");
    }
  }

  static async analyzeVideo(filePath: string, tone: string): Promise<any> {
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
          Analyze this video for social cues. The user is attempting to convey a tone of: "${tone}".
          
          Grade the user on these 4 items:
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
            ]
          });
          const response = result.text || "";
          const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(jsonStr);
        } catch (jsonError) {
          console.warn(`JSON parsing failed, retrying... (${retries} left)`);
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
