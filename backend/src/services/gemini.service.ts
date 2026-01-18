import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Use Cloudflare Worker proxy to bypass Google's IP blocking on cloud providers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    baseUrl: 'https://gemini-proxy.esad-n-kaya.workers.dev'
  }
});

export class GeminiService {




  static async generateImage(prompt: string): Promise<Buffer | null> {
    try {
      const imagePrompt = `Generate a realistic image representing this scene: ${prompt}`;
      console.log(`[DEBUG] Generating image with prompt: "${imagePrompt}"`);
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: imagePrompt,
      });

      console.log(`[DEBUG] Image API Response received. Candidates: ${response?.candidates?.length}`);

      if (response && response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        console.log("[DEBUG] Response Parts:", JSON.stringify(response.candidates[0].content.parts, null, 2));
        for (const part of response.candidates[0].content.parts) {
          // Check for inlineData
          if (part.inlineData && part.inlineData.data) {
            const imageData = part.inlineData.data;
            const buffer = Buffer.from(imageData, "base64");
            console.log(`[DEBUG] Image data found! Buffer size: ${buffer.length} bytes`);
            return buffer;
          }
        }
      }
      console.warn("[DEBUG] No image data found in response parts.");
      return null;
    } catch (error) {
      console.error("[DEBUG] Gemini Image Generation Error:", error);
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
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const responseText = result.text;
      return responseText ? responseText.trim() : text;
    } catch (error) {
      console.error("Gemini Tone Tag Error:", error);
      return text; // Fallback to original text
    }
  }

  /**
   * Strictly enforces thumbs-rating based on numerical score and difficulty.
   */
  private static getStrictRating(score: number, difficulty: string): 'thumbs-up' | 'thumbs-sideways' | 'thumbs-down' {
    const diff = difficulty.toLowerCase();

    // Easy / Beginner
    if (diff === 'beginner' || diff === 'easy') {
      if (score > 50) return 'thumbs-up';
      if (score >= 25) return 'thumbs-sideways';
      return 'thumbs-down';
    }

    // Intermediate
    if (diff === 'intermediate') {
      if (score > 70) return 'thumbs-up';
      if (score >= 40) return 'thumbs-sideways';
      return 'thumbs-down';
    }

    // Hard / Advanced
    // 90 and above is thumbs up. 50-90 is sideways, below 50 is down.
    if (score >= 90) return 'thumbs-up';
    if (score >= 50) return 'thumbs-sideways';
    return 'thumbs-down';
  }

  static async analyzeVideo(filePath: string, tone: string, promptContext: string, difficulty: string = 'beginner', presageData?: any): Promise<any> {
    try {
      // Read video file as Base64
      const videoBuffer = fs.readFileSync(filePath);
      const videoBase64 = videoBuffer.toString('base64');

      console.log(`Read video file: ${filePath}, size: ${videoBuffer.length} bytes`);

      let systemPrompt = "";

      // SELECT PROMPT BASED ON DIFFICULTY
      switch (difficulty.toLowerCase()) {
        case 'beginner':
          systemPrompt = `
            You are a SUPPORTIVE and ENCOURAGING social skills teacher. Your student is a beginner.
            Focus on the basics. Be lenient with grading.
            
            GUIDING PRINCIPLES:
            - Award "thumbs-up" if the user makes a GENUINE ATTEMPT and gets the general vibe right, even if it's not perfect.
            - Only give "thumbs-down" for complete mismatches, total lack of effort, or very obvious errors.
            - Use encouraging language in feedback (e.g., "Good try," "You're on the right track," "Next time try...").
            - Ignore minor imperfections in micro-expressions or fleeting eye contact breaks.
          `;
          break;

        case 'intermediate':
          systemPrompt = `
            You are a PROFESSIONAL social skills coach. Be FIRM but FAIR.
            Expect competency but allow for minor imperfections if the core message and tone are correct.
            
            GUIDING PRINCIPLES:
            - Award "thumbs-up" for solid, competent performance that would be acceptable in a casual setting.
            - Award "thumbs-down" for clear mistakes, obvious mismatches, or lack of effort.
            - Feedback should be constructive and specific, pointing out exactly what to polish.
            - Don't nitpick micro-mismatches unless they confuse the message.
          `;
          break;

        case 'advanced':
        default:
          systemPrompt = `
            You are a RIGOROUS and HIGH-STANDARD social skills evaluator.
            Expect polished, professional-level social calibration.
            
            GUIDING PRINCIPLES:
            - Award "thumbs-up" for high-quality responses that demonstrate strong social awareness and control.
            - Award "thumbs-down" for responses that feel awkward, uncalibrated, or lack nuance.
            - Feedback should be sophisticated, focusing on elevating the user from "good" to "great".
            - Point out subtle opportunities for improvement in tone and micro-expressions, but acknowledge competence.
          `;
          break;
      }

      let prompt = `
          ${systemPrompt}
          
          Context:
          - Target Tone/Emotion: "${tone}"
          - Situation they are responding to: "${promptContext}"
          - Difficulty Level: ${difficulty}
      `;

      if (presageData) {
        prompt += `\n          - Supplementary Biometric Data (Presage): ${JSON.stringify(presageData)}`;
      }

      console.log(`[DEBUG] Analyzing Video with Difficulty: ${difficulty}`);
      console.log(`[DEBUG] Generated Prompt Preview:\n${prompt.substring(0, 500)}...`);

      prompt += `
          
          CRITICAL: Grade the user on these 5 areas according to the "${difficulty}" persona defined above.
          
          For EACH category, you MUST provide:
          1. A "numerical_score" (0-100) representing their performance quality.
          2. Specific feedback (40-50 words).

          STRICTNESS GUIDE for Numerical Scores (0-100):
          - Beginner/Easy: >50 is Good. <25 is Fail.
          - Intermediate: >70 is Good. <40 is Fail.
          - Advanced/Hard: >=90 is Good. <50 is Fail.

          Return the result ONLY as a valid JSON object with the following schema:
          {
            "transcript": "string",
            "facial_expression": { "numerical_score": number, "feedback": "string" },
            "eye_contact": { "numerical_score": number, "feedback": "string" },
            "body_language": { "numerical_score": number, "feedback": "string" },
            "tone": { "numerical_score": number, "feedback": "string" },
            "content": { "numerical_score": number, "feedback": "string" }
          }
        `;


      let retries = 3;
      while (retries > 0) {
        try {
          const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview", // Updated to a model known to support this feature if needed, or stick to what works. Using 2.0-flash as it is robust for video.
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
                      numerical_score: { type: "number" },
                      feedback: { type: "string" }
                    },
                    required: ["numerical_score", "feedback"]
                  },
                  eye_contact: {
                    type: "object",
                    properties: {
                      numerical_score: { type: "number" },
                      feedback: { type: "string" }
                    },
                    required: ["numerical_score", "feedback"]
                  },
                  body_language: {
                    type: "object",
                    properties: {
                      numerical_score: { type: "number" },
                      feedback: { type: "string" }
                    },
                    required: ["numerical_score", "feedback"]
                  },
                  tone: {
                    type: "object",
                    properties: {
                      numerical_score: { type: "number" },
                      feedback: { type: "string" }
                    },
                    required: ["numerical_score", "feedback"]
                  },
                  content: {
                    type: "object",
                    properties: {
                      numerical_score: { type: "number" },
                      feedback: { type: "string" }
                    },
                    required: ["numerical_score", "feedback"]
                  }
                },
                required: ["transcript", "facial_expression", "eye_contact", "body_language", "tone", "content"]
              }
            }
          });

          // result.text should be valid JSON now
          const responseText = result.text || "{}";
          const parsed = JSON.parse(responseText);

          // Post-process: Calculate strict thumbs rating
          const categories = ['facial_expression', 'eye_contact', 'body_language', 'tone', 'content'];
          for (const cat of categories) {
            if (parsed[cat] && typeof parsed[cat].numerical_score === 'number') {
              parsed[cat].score = GeminiService.getStrictRating(parsed[cat].numerical_score, difficulty);
            } else if (parsed[cat]) {
              // Fallback if AI hallucinates strictly
              parsed[cat].score = 'thumbs-sideways';
              parsed[cat].numerical_score = 50;
            }
          }

          console.log('Gemini analysis result:', JSON.stringify(parsed, null, 2));
          return parsed;
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
  static async generateExampleModules(lessonId: string, lessonName: string, metadata: any, count: number, difficulty: string): Promise<any[]> {
    try {
      console.log(`Generating ${count} example modules for lesson: ${lessonName} `);

      const practicePageSchema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            pageType: { type: "STRING", enum: ["practice"] },
            difficulty: { type: "STRING", enum: ["beginner", "intermediate", "advanced"] },
            pageOrder: { type: "INTEGER" },
            scenario: {
              type: "OBJECT",
              properties: {
                context: { type: "STRING" },
                description: { type: "STRING" },
                imageUrl: { type: "STRING" }
              },
              required: ["context", "description"]
            },
            audioSample: {
              type: "OBJECT",
              properties: {
                url: { type: "STRING" },
                duration: { type: "NUMBER" },
                tonalPrompt: { type: "STRING" },
                toneTag: { type: "STRING" }
              },
              required: ["tonalPrompt", "toneTag"]
            },
            transcript: { type: "STRING" },
            appropriateResponse: {
              type: "OBJECT",
              properties: {
                description: { type: "STRING" },
                keyElements: { type: "ARRAY", items: { type: "STRING" } }
              },
              required: ["description", "keyElements"]
            }
          },
          required: ["pageType", "difficulty", "scenario", "audioSample", "transcript", "appropriateResponse"]
        }
      };

      const prompt = `
        You are an expert educational content creator for a social skills learning app.
        Generate ${count} NEW practice scenarios(modules) for the lesson "${lessonName}".

        Metadata: ${JSON.stringify(metadata)}
      Difficulty: ${difficulty}

      CRITICAL:
      1. Set "difficulty" to "${difficulty}" for ALL generated modules.
        2. Ensure "transcript" matches the "tonalPrompt" in style.
        3. Make scenarios realistic and challenging based on valid social dynamics.
      `;

      let retries = 5;
      let modules: any[] = [];

      while (retries > 0) {
        try {
          const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
              responseMimeType: "application/json",
              // @ts-ignore
              responseSchema: practicePageSchema
            }
          });

          const responseText = result.text || "[]";
          modules = JSON.parse(responseText);

          if (!Array.isArray(modules)) {
            modules = [modules];
          }

          // If successful, break the loop
          break;
        } catch (e) {
          console.warn(`Gemini module generation failed, retrying... (${retries} left)`, e);
          retries--;
          if (retries === 0) {
            console.error("Failed to generate modules after multiple attempts");
            return [];
          }
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      // Post-Processing: Generate Assets
      let ElevenLabsService: any;
      try {
        const module = require('./elevenlabs.service');
        ElevenLabsService = module.ElevenLabsService;
      } catch (e) {
        console.warn("Could not load ElevenLabsService, audio generation will be skipped.", e);
      }

      for (const [i, mod] of modules.entries()) {
        // 1. Audio
        if (mod.transcript && mod.audioSample && ElevenLabsService) {
          try {
            const audioBuffer = await ElevenLabsService.generateSpeech(
              mod.transcript,
              "21m00Tcm4TlvDq8ikWAM",
              mod.audioSample.tonalPrompt,
              mod.audioSample.toneTag
            );
            const timestamp = Date.now();
            const audioFileName = `${lessonId}_gen_${timestamp}_${i}.mp3`;
            const audioDir = './public/audio';
            if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
            const audioPath = `${audioDir}/${audioFileName}`;
            fs.writeFileSync(audioPath, audioBuffer);
            mod.audioSample.url = `/audio/${audioFileName}`;
            mod.audioSample.duration = 5;
          } catch (err) {
            console.error("Failed to generate audio for module:", err);
          }
        }

        // 2. Image
        if (mod.scenario && mod.scenario.description) {
          // Default to placeholder (overwriting any hallucination)
          mod.scenario.imageUrl = "https://placehold.co/600x400/5E7381/ffffff?text=Scenario+Image+Generating...";

          try {
            console.log(`[DEBUG] Attempting to generate image for module ${i}...`);
            const imageBuffer = await this.generateImage(mod.scenario.description);
            if (imageBuffer) {
              const timestamp = Date.now();
              const imageFileName = `${lessonId}_gen_${timestamp}_${i}.png`;
              const imageDir = './public/images';
              if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
              const imagePath = `${imageDir}/${imageFileName}`;
              fs.writeFileSync(imagePath, imageBuffer);
              mod.scenario.imageUrl = `/images/${imageFileName}`;
              console.log(`[DEBUG] Image saved to: ${imagePath}, URL set to: ${mod.scenario.imageUrl}`);
            } else {
              // Keep placeholder or set to a static "failed" image
              console.warn(`[DEBUG] Image generation returned null for module ${i}, using fallback.`);
              mod.scenario.imageUrl = "https://placehold.co/600x400/E1D3BE/5E7381?text=Image+Unavailable";
            }
          } catch (err) {
            console.error(`[DEBUG] Failed to generate image for module ${i}:`, err);
            mod.scenario.imageUrl = "https://placehold.co/600x400/E1D3BE/5E7381?text=Image+Unavailable";
          }
        }
      }

      return modules;
    } catch (error) {
      console.error("Gemini Module Generation Error:", error);
      throw error;
    }
  }

  static async generateFullLesson(lessonName: string, count: number, difficulty: string): Promise<any> {
    try {
      console.log(`Generating FULL lesson for: ${lessonName}`);

      const fullLessonSchema = {
        type: "OBJECT",
        properties: {
          lessonId: { type: "STRING", description: "kebab-case-slug-of-lesson-name" },
          lessonName: { type: "STRING" },
          pages: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                pageType: { type: "STRING", enum: ["definition", "practice"] },
                difficulty: { type: "STRING", enum: ["beginner", "intermediate", "advanced"] },
                pageOrder: { type: "INTEGER" },
                term: { type: "STRING" },
                definition: { type: "STRING" },
                visualCues: { type: "ARRAY", items: { type: "STRING" } },
                toneCues: { type: "ARRAY", items: { type: "STRING" } },
                scenario: {
                  type: "OBJECT",
                  properties: {
                    context: { type: "STRING" },
                    description: { type: "STRING" },
                    imageUrl: { type: "STRING" }
                  }
                },
                audioSample: {
                  type: "OBJECT",
                  properties: {
                    url: { type: "STRING" },
                    duration: { type: "NUMBER" },
                    tonalPrompt: { type: "STRING" },
                    toneTag: { type: "STRING" }
                  }
                },
                transcript: { type: "STRING" },
                appropriateResponse: {
                  type: "OBJECT",
                  properties: {
                    description: { type: "STRING" },
                    keyElements: { type: "ARRAY", items: { type: "STRING" } }
                  }
                }
              },
              required: ["pageType", "pageOrder", "visualCues", "toneCues"]
            }
          }
        },
        required: ["lessonId", "lessonName", "pages"]
      };

      const prompt = `
        Create a FULL lesson on "${lessonName}".
        Difficulty: ${difficulty}
        
        The lesson MUST have exactly ${count + 1} pages in this specific order:
        1. Page 1: "definition" page (Explaining the concept).
        2. Pages 2 to ${count + 1}: "practice" pages (Scenarios).
        
        CRITICAL RULES:
        1. For the "definition" page (ONLY the first page):
           - "pageType" MUST be "definition".
           - "term" and "definition" must be filled.
           - "visualCues" and "toneCues" MUST have at least 3 items.
           - "scenario", "audioSample", "transcript", "appropriateResponse" can be empty/null.
           
        2. For "practice" pages (All subsequent pages):
           - "pageType" MUST be "practice".
           - "difficulty" MUST be "${difficulty}".
           - "scenario", "audioSample", "transcript", "appropriateResponse" MUST be filled.
           - "visualCues" and "toneCues" MUST be empty arrays [].
           - "term" and "definition" MUST be empty strings.
        
        3. "pageOrder" must be sequential starting from 1.
        4. Generate realistic social scenarios.
      `;

      let retries = 5;
      let lessonData: any = null;

      while (retries > 0) {
        try {
          const result = await ai.models.generateContent({
            model: "gemini-3-pro-image-preview",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
              responseMimeType: "application/json",
              // @ts-ignore
              responseSchema: fullLessonSchema
            }
          });

          lessonData = JSON.parse(result.text || "{}");
          if (!lessonData.pages) throw new Error("Invalid lesson data structure");

          break; // Success
        } catch (e) {
          console.warn(`Gemini full lesson generation failed, retrying... (${retries} left)`, e);
          retries--;
          if (retries === 0) {
            console.error("Failed to generate full lesson after multiple attempts");
            return null;
          }
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      if (!lessonData) return null;

      let ElevenLabsService: any;
      try {
        const module = require('./elevenlabs.service');
        ElevenLabsService = module.ElevenLabsService;
      } catch (e) {
        console.warn("Could not load ElevenLabsService", e);
      }

      for (const [i, page] of lessonData.pages.entries()) {
        const lessonId = lessonData.lessonId || "temp_lesson";

        // ENFORCE Page Order
        page.pageOrder = i + 1;

        if (page.pageType === 'practice') {
          if (page.transcript && page.audioSample && ElevenLabsService) {
            try {
              const audioBuffer = await ElevenLabsService.generateSpeech(
                page.transcript,
                "21m00Tcm4TlvDq8ikWAM",
                page.audioSample.tonalPrompt,
                page.audioSample.toneTag
              );
              const timestamp = Date.now();
              const audioFileName = `${lessonId}_gen_${timestamp}_${i}.mp3`;
              const audioDir = './public/audio';
              if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
              const audioPath = `${audioDir}/${audioFileName}`;
              fs.writeFileSync(audioPath, audioBuffer);
              page.audioSample.url = `/audio/${audioFileName}`;
              page.audioSample.duration = 5;
            } catch (err) {
              console.error("Failed to generate audio for module:", err);
            }
          }

          if (page.scenario && page.scenario.description) {
            // Default to placeholder
            page.scenario.imageUrl = "https://placehold.co/600x400/5E7381/ffffff?text=Scenario+Image+Generating...";

            try {
              console.log(`[DEBUG] Attempting to generate image for FULL lesson page ${i}...`);
              const imageBuffer = await this.generateImage(page.scenario.description);
              if (imageBuffer) {
                const timestamp = Date.now();
                const imageFileName = `${lessonId}_gen_${timestamp}_${i}.png`;
                const imageDir = './public/images';
                if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
                const imagePath = `${imageDir}/${imageFileName}`;
                fs.writeFileSync(imagePath, imageBuffer);
                page.scenario.imageUrl = `/images/${imageFileName}`;
                console.log(`[DEBUG] Image saved to: ${imagePath}, URL set to: ${page.scenario.imageUrl}`);
              } else {
                console.warn(`[DEBUG] Image generation returned null for page ${i}, using fallback.`);
                page.scenario.imageUrl = "https://placehold.co/600x400/E1D3BE/5E7381?text=Image+Unavailable";
              }
            } catch (err) {
              console.error(`[DEBUG] Failed to generate image for page ${i}:`, err);
              page.scenario.imageUrl = "https://placehold.co/600x400/E1D3BE/5E7381?text=Image+Unavailable";
            }
          }
        }
      }

      return lessonData;
    } catch (error) {
      console.error("Gemini Full Lesson Generation Error:", error);
      throw error;
    }
  }
}
