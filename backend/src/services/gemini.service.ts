import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

export class GeminiService {

    // Generates a structured lesson plan (static JSON)
    static async generateLessonJSON(topic: string, difficulty: string): Promise<any> {
        const prompt = `
      Create a structured lesson plan for learning about social cues, specifically focusing on "${topic}". 
      Difficulty level: ${difficulty}.
      Return the response ONLY as a valid JSON object with this structure:
      {
        "title": "Lesson Title",
        "sections": [
          {
            "header": "Section Header",
            "content": "Educational content..."
          }
        ],
        "quiz": [
          {
            "question": "Question text",
            "options": ["Option A", "Option B", "Option C"],
            "correctAnswer": 0 // index
          }
        ]
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Basic cleanup to ensure JSON
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Gemini Lesson Generation Error:", error);
            throw new Error("Failed to generate lesson content");
        }
    }

    // Analyzes facial expressions from an image (base64 or buffer logic would go here)
    // For now, accepting text description for simulation or prompt construction for Vision
    // Note: Gemini Pro Vision requires image parts.
    static async analyzeFacialCues(imageData: Buffer, mimeType: string): Promise<any> {
        try {
            const prompt = "Analyze the facial cues in this image. Identify the emotion, and list specific facial features (brows, eyes, mouth) that indicate this emotion. Provide feedback on how to interpret this.";

            const imagePart = {
                inlineData: {
                    data: imageData.toString('base64'),
                    mimeType
                },
            };

            const result = await visionModel.generateContent([prompt, imagePart]);
            const response = await result.response;
            return response.text(); // Returning raw text for now, could structure it via prompt engineering
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
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Gemini Response Analysis Error:", error);
            throw new Error("Failed to analyze response");
        }
    }
}
