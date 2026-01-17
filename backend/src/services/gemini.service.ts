// src/services/gemini.service.ts

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
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Gemini Lesson Generation Error:", error);
      throw new Error("Failed to generate lesson content");
    }
  }

  // Analyzes facial expressions from an image
  static async analyzeFacialCues(imageData: Buffer, mimeType: string): Promise<any> {
    try {
      const prompt = "Analyze the facial cues in this image. Identify the emotion, and list specific facial features (brows, eyes, mouth) that indicate this emotion. Return as JSON: { emotion: string, features: { brows: string, eyes: string, mouth: string }, appropriateness: number (0-100), feedback: string }";

      const imagePart = {
        inlineData: {
          data: imageData.toString('base64'),
          mimeType
        },
      };

      const result = await visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
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

  // ✅ NEW: Complete analysis combining facial, tone, and content
  static async analyzeComplete(data: {
    transcript: string;
    facialImageBase64: string;
    scenarioContext: string;
    presageData: any;
  }): Promise<any> {
    try {
      // Step 1: Analyze facial expression
      const facialBuffer = Buffer.from(data.facialImageBase64, 'base64');
      const facialAnalysis = await this.analyzeFacialCues(facialBuffer, 'image/jpeg');

      // Step 2: Analyze tone and content
      const prompt = `
Analyze this empathetic response:

Scenario: ${data.scenarioContext}
User's Response: "${data.transcript}"

Provide a comprehensive analysis in JSON format:
{
  "toneScore": number (0-100),
  "contentScore": number (0-100),
  "toneIssues": ["issue1", "issue2"],
  "tonePositives": ["positive1"],
  "contentIssues": ["issue1", "issue2"],
  "contentPositives": ["positive1"],
  "coachingTips": ["tip1", "tip2", "tip3"]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const toneContentAnalysis = JSON.parse(jsonStr);

      // Step 3: Calculate scores
      const scores = {
        facialExpression: {
          score: facialAnalysis.appropriateness || 50,
          issues: facialAnalysis.feedback ? [facialAnalysis.feedback] : [],
          positives: facialAnalysis.emotion ? [`Detected emotion: ${facialAnalysis.emotion}`] : []
        },
        tone: {
          score: toneContentAnalysis.toneScore,
          issues: toneContentAnalysis.toneIssues || [],
          positives: toneContentAnalysis.tonePositives || []
        },
        content: {
          score: toneContentAnalysis.contentScore,
          issues: toneContentAnalysis.contentIssues || [],
          positives: toneContentAnalysis.contentPositives || []
        },
        authenticity: {
          score: data.presageData?.engagementScore || 50,
          note: `Heart rate: ${data.presageData?.avgHeartRateDuringResponse || 'N/A'} bpm, Stress: ${data.presageData?.stressLevel || 'unknown'}`
        }
      };

      // Step 4: Calculate overall score (weighted average)
      const overallScore = Math.round(
        (scores.facialExpression.score * 0.3) +
        (scores.tone.score * 0.3) +
        (scores.content.score * 0.3) +
        (scores.authenticity.score * 0.1)
      );

      return {
        overallScore,
        scores,
        coachingTips: toneContentAnalysis.coachingTips || []
      };

    } catch (error) {
      console.error("Complete analysis error:", error);
      throw new Error("Failed to complete analysis");
    }
  }
}