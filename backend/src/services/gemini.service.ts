import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
        model: "gemini-3-pro-preview",
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
            model: "gemini-3-pro-preview", // Updated to a model known to support this feature if needed, or stick to what works. Using 2.0-flash as it is robust for video.
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
          const parsed = JSON.parse(responseText);
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
      console.log(`Generating ${count} example modules for lesson: ${lessonName}`);

      const practicePageSchema = {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            pageType: { type: "STRING", enum: ["practice"] },
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
          required: ["pageType", "scenario", "audioSample", "transcript", "appropriateResponse"]
        }
      };

      const prompt = `
        You are an expert educational content creator for a social skills learning app.
        Generate ${count} NEW practice scenarios (modules) for the lesson "${lessonName}".
        
        Metadata: ${JSON.stringify(metadata)}
        Difficulty: ${difficulty}
        
        CRITICAL: 
        1. Ensure "transcript" matches the "tonalPrompt" in style.
        2. Make scenarios realistic and challenging based on valid social dynamics.
      `;

      let retries = 5;
      let modules: any[] = [];

      while (retries > 0) {
        try {
          const result = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
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

      for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];

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

      for (let i = 0; i < lessonData.pages.length; i++) {
        const page = lessonData.pages[i];
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
