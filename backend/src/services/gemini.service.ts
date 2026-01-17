import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class GeminiService {




  static async generateImage(prompt: string): Promise<Buffer | null> {
    try {
      console.log(`Generating image with prompt: ${prompt}`);
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: prompt,
      });

      if (response && response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          // Check for inlineData
          if (part.inlineData && part.inlineData.data) {
            const imageData = part.inlineData.data;
            return Buffer.from(imageData, "base64");
          }
        }
      }
      console.warn("No image data found in response");
      return null;
    } catch (error) {
      console.error("Gemini Image Generation Error:", error);
      return null;
    }
  }

  static async generateToneTags(text: string, tone: string, context: string = ""): Promise<string> {
    try {
      const prompt = `
        Add descriptive tone tags to the beginning of the following text to convey a "${tone}" tone.
        Context: ${context}
        Original Text: "${text}"

        Instructions:
        1. Return the text exactly as is, but prepend 2-3 bracketed tags describing the emotional delivery, pacing, and intensity.
        2. Example: "[Sarcastic] [Slow Paced] [Mocking] Original Text"
        3. DO NOT change the words, punctuation, or formatting of the original text.
        4. The output should be: [Tags...] Original Text
      `;

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const responseText = result.text;
      return responseText ? responseText.trim() : text;
    } catch (error) {
      console.error("Gemini Tone Tag Error:", error);
      return text; // Fallback to original text
    }
  }

  static async analyzeVideo(filePath: string, tone: string, promptContext: string, presageData?: any): Promise<any> {
    try {
      // Read video file as Base64
      const videoBuffer = fs.readFileSync(filePath);
      const videoBase64 = videoBuffer.toString('base64');

      console.log(`Read video file: ${filePath}, size: ${videoBuffer.length} bytes`);

      let prompt = `
          Analyze this video for social cues. 
          
          Context:
          - Target Tone: "${tone}"
          - Situation/Prompt user is responding to: "${promptContext}"`;

      if (presageData) {
        prompt += `\n          - Supplementary Biometric Data (Presage): ${JSON.stringify(presageData)}`;
      }

      prompt += `
          
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
            model: "gemini-2.0-flash", // Updated to a model known to support this feature if needed, or stick to what works. Using 2.0-flash as it is robust for video.
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: "video/mp4",
                      data: videoBase64
                    },
                    // @ts-ignore
                    videoMetadata: {
                      fps: 5
                    }
                  },
                  { text: prompt }
                ]
              }
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
