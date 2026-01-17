import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export class GeminiService {





  static async generateToneTags(text: string, tone: string, context: string = ""): Promise<string> {
    try {
      const prompt = `
        Enhance the following text to clearly convey a "${tone}" tone.
        Context: ${context}
        Original Text: "${text}"

        Instructions:
        1. Add a descriptive tag at the beginning, e.g., [Sarcastic], [Warmly], [Angry].
        2. You may slightly adjust punctuation or add non-verbal cues (like *sigh*) if it significantly helps the TTS engine (ElevenLabs) understand the delivery, but keep the core message the same.
        3. Return ONLY the final text string.
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
          const parsedResponse = JSON.parse(responseText);

          // Add token usage metadata if available
          if (result.usageMetadata) {
            const promptTokens = result.usageMetadata.promptTokenCount || 0;
            const candidatesTokens = result.usageMetadata.candidatesTokenCount || 0;
            const totalTokens = result.usageMetadata.totalTokenCount || 0;

            let inputPricePerMillion = 0;
            let outputPricePerMillion = 0;

            // Pricing Tiers
            if (promptTokens <= 200000) {
              inputPricePerMillion = 2.00;
              outputPricePerMillion = 12.00;
            } else {
              inputPricePerMillion = 4.00;
              outputPricePerMillion = 18.00;
            }

            const inputCost = (promptTokens / 1000000) * inputPricePerMillion;
            const outputCost = (candidatesTokens / 1000000) * outputPricePerMillion;
            const totalCost = inputCost + outputCost;

            parsedResponse.token_usage = {
              totalTokens: totalTokens,
              promptTokens: promptTokens,
              candidatesTokens: candidatesTokens,
              estimatedCostUSD: parseFloat(totalCost.toFixed(6))
            };
          }

          return parsedResponse;
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
