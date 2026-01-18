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
          You are an EXTREMELY STRICT and HARSH social skills evaluator. You have VERY HIGH standards. Most responses should receive "thumbs-down" unless they are genuinely excellent. Be BRUTALLY honest - sugar-coating helps no one.
          
          Context:
          - Target Tone/Emotion: "${tone}"
          - Situation they are responding to: "${promptContext}"`;

      if (presageData) {
        prompt += `\n          - Supplementary Biometric Data (Presage): ${JSON.stringify(presageData)}`;
      }

      prompt += `
          
          CRITICAL: You are NOT here to be nice. You are here to make them BETTER. If something is even slightly off, call it out. Award "thumbs-up" ONLY for genuinely impressive, professional-level performance.

          Grade the user on these 5 areas. Be MERCILESS:

          1. FACIAL EXPRESSION - Standards are HIGH:
             - Does their face PERFECTLY match "${tone}"? Even slight mismatch = thumbs-down
             - Eyebrows must be positioned EXACTLY right for the emotion
             - Eyes must show GENUINE emotion - any hint of fakeness = fail
             - Smiles must be authentic with crow's feet - forced smiles = thumbs-down
             - Micro-expressions that contradict the intended emotion = fail
             - Face frozen or stiff = immediate thumbs-down
             - Over-acting or exaggerated = thumbs-down

          2. EYE CONTACT - Must be PERFECT:
             - Looking away even briefly at wrong moments = thumbs-down
             - Excessive blinking = nervous = thumbs-down
             - Not enough blinking = unsettling = thumbs-down  
             - Darting eyes = thumbs-down
             - Looking down while speaking = submissive = thumbs-down
             - Breaking eye contact at emotional peaks = fail

          3. BODY LANGUAGE - Professional standards:
             - Closed posture (crossed arms, hunched) = immediate thumbs-down
             - Tense shoulders = nervous = thumbs-down
             - Frozen hands or fidgeting = thumbs-down
             - Nervous ticks (face touching, hair playing) = thumbs-down
             - Wrong head position for context = thumbs-down
             - Any distracting movement = thumbs-down

          4. VOCAL TONE - Must match emotion EXACTLY:
             - Voice doesn't match "${tone}" = immediate thumbs-down
             - Too fast = nervous = thumbs-down
             - Too slow = boring/disengaged = thumbs-down
             - Monotone delivery = thumbs-down
             - Too quiet = lacks confidence = thumbs-down
             - Too loud = aggressive = thumbs-down
             - ANY filler words (um, uh, like, you know) = thumbs-down
             - Fake or performative tone = thumbs-down

          5. CONTENT - What they SAID must be PERFECT:
             - Did they actually address: "${promptContext}"?
             - Is their response EXACTLY what the situation calls for?
             - Any irrelevant or off-topic content = thumbs-down
             - Wrong message for the situation = thumbs-down
             - Missing key elements = thumbs-down
             - Would this response work in REAL LIFE? If not = thumbs-down
             - Is the wording natural and appropriate? Awkward phrasing = thumbs-down

          STRICT SCORING (thumbs-up should be RARE):
          - "thumbs-up": EXCEPTIONAL. Professional-level. Almost flawless. Very few people achieve this.
          - "thumbs-sideways": Mediocre. Has clear issues but not terrible. This is the MOST COMMON score.
          - "thumbs-down": Problematic. Significant issues. Needs serious practice. Don't hesitate to use this.

          For EACH category, provide 40-50 words of BLUNT, SPECIFIC feedback. Don't be diplomatic - be direct about what's wrong and exactly how to fix it.

          Return the result ONLY as a valid JSON object with the following schema:
          {
            "transcript": "string (the user's exact spoken words)",
            "facial_expression": { "score": "string", "feedback": "string" },
            "eye_contact": { "score": "string", "feedback": "string" },
            "body_language": { "score": "string", "feedback": "string" },
            "tone": { "score": "string", "feedback": "string" },
            "content": { "score": "string", "feedback": "string" }
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
                  content: {
                    type: "object",
                    properties: {
                      score: { type: "string", enum: ["thumbs-up", "thumbs-sideways", "thumbs-down"] },
                      feedback: { type: "string" }
                    },
                    required: ["score", "feedback"]
                  }
                },
                required: ["transcript", "facial_expression", "eye_contact", "body_language", "tone", "content"]
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
