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
          You are an EXTREMELY CRITICAL social skills coach analyzing a user's video response. Be VERY nit-picky and detail-oriented. Your feedback should help them improve their social communication skills.
          
          Context:
          - Target Tone/Emotion: "${tone}"
          - Situation they are responding to: "${promptContext}"`;

      if (presageData) {
        prompt += `\n          - Supplementary Biometric Data (Presage): ${JSON.stringify(presageData)}`;
      }

      prompt += `
          
          IMPORTANT: Be a HARSH but CONSTRUCTIVE critic. Point out every small issue you notice. Users are here to LEARN and IMPROVE.

          Grade the user on these 4 items. For each, scrutinize carefully:

          1. FACIAL EXPRESSION - Be extremely critical:
             - Does their face ACTUALLY match the "${tone}" emotion?
             - Are their eyebrows positioned appropriately? (raised for surprise, furrowed for concern, etc.)
             - Is there genuine emotion in their eyes or do they look dead/fake?
             - Is their smile genuine (crow's feet) or forced/fake?
             - Do micro-expressions betray their true feelings?
             - Is their face too stiff, too exaggerated, or asymmetrical?
             - Does their expression change naturally or is it frozen?

          2. EYE CONTACT - Be extremely critical:
             - Are they looking at the camera or constantly looking away?
             - Do they blink too much (nervous) or too little (staring)?
             - Is their gaze steady and confident or darting around?
             - Do they look down when speaking (submissive) or maintain presence?
             - Is there appropriate eye engagement for the emotional context?
             - Do they break eye contact at awkward moments?

          3. BODY LANGUAGE - Be extremely critical:
             - Is their posture open and confident or closed/defensive?
             - Are their shoulders relaxed or tense/hunched?
             - Do they use appropriate hand gestures or are they frozen/fidgeting?
             - Is there unnecessary movement or distracting mannerisms?
             - Do they lean in appropriately for the emotional context?
             - Are there nervous ticks like touching face, playing with hair, etc.?
             - Is their head position appropriate (tilted for empathy, straight for confidence)?

          4. VOCAL TONE - Be extremely critical:
             - Does their voice match the "${tone}" emotion?
             - Is the pace too fast (nervous), too slow (boring), or just right?
             - Is there enough vocal variety or is it monotone?
             - Is the volume appropriate - too quiet (timid) or too loud (aggressive)?
             - Are there filler words (um, uh, like) that detract from delivery?
             - Does their voice sound genuine/authentic or performative/fake?
             - Is there appropriate emotional emphasis on key words?
             - Do they sound engaged or bored/disconnected?

          5. CONTENT ACCURACY - Be extremely critical:
             - Did the user actually respond to the situation: "${promptContext}"?
             - Is their verbal response appropriate for the context?
             - Did they say something relevant or completely off-topic?
             - Did they convey the right message for the situation?
             - Would their response make sense in a real conversation?
             - Did they miss key elements that should have been addressed?

          SCORING CRITERIA:
          - "thumbs-up": Nearly perfect. Minor issues at most. Would impress in real life.
          - "thumbs-sideways": Acceptable but needs work. Noticeable issues that could be improved.
          - "thumbs-down": Significant problems. Needs substantial improvement before real-world use.

          For EACH category, provide 40-50 words of SPECIFIC, ACTIONABLE feedback. Point out EXACTLY what was wrong and HOW to fix it. Don't be vague.

          Return the result ONLY as a valid JSON object with the following schema:
          {
            "transcript": "string (the user's exact spoken words)",
            "facial_expression": { "score": "string", "feedback": "string" },
            "eye_contact": { "score": "string", "feedback": "string" },
            "body_language": { "score": "string", "feedback": "string" },
            "tone": { "score": "string", "feedback": "string" },
            "content_accuracy": { "score": "string", "feedback": "string" }
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
                  transcript: {
                    type: "string",
                    description: "The user's exact spoken words transcribed from the video"
                  },
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
                  },
                  content_accuracy: {
                    type: "object",
                    properties: {
                      score: { type: "string", enum: ["thumbs-up", "thumbs-sideways", "thumbs-down"] },
                      feedback: { type: "string" }
                    },
                    required: ["score", "feedback"]
                  }
                },
                required: ["transcript", "facial_expression", "eye_contact", "body_language", "tone", "content_accuracy"]
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
