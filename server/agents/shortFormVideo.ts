import OpenAI from "openai";
import { BaseAgent } from "./base.js";
import { getDb } from "../db/schema.js";

const WAVESPEED_API = "https://api.wavespeed.ai/api/v3";

export class ShortFormVideoAgent extends BaseAgent {
  private openai: OpenAI;

  constructor() {
    super("short-form-video", "Short-Form Video Agent");
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async run(): Promise<void> {
    this.info("Starting short-form video content pipeline...");

    // 1. Pick a trending topic
    const db = getDb();
    const trend = db.prepare("SELECT keyword, analysis FROM trends ORDER BY created_at DESC LIMIT 1").get() as
      | { keyword: string; analysis: string }
      | undefined;

    const topic = trend?.keyword || "AI tools that save 10 hours per week";
    this.info(`Creating video content for topic: "${topic}"`);

    // 2. Generate video script with OpenAI
    this.info("Generating TikTok/Reels script with OpenAI...");
    const scriptCompletion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a viral short-form video content creator. Create engaging 30-60 second scripts for TikTok and Instagram Reels. Return JSON only.",
        },
        {
          role: "user",
          content: `Create a viral TikTok/Reels script about "${topic}". Include:
- title: catchy hook title
- hook: first 3 seconds attention grabber (text overlay)
- scenes: array of 4-5 scene objects with {scene_number, duration_seconds, visual_description, narration, text_overlay}
- cta: call to action at the end
- hashtags: array of 5-8 relevant hashtags
- estimated_duration_seconds: total video length

Return as JSON object.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 1500,
    });

    const scriptRaw = scriptCompletion.choices[0]?.message?.content;
    if (!scriptRaw) throw new Error("No script response from OpenAI");

    const script = JSON.parse(scriptRaw);
    this.info(`Script created: "${script.title}" — ${script.scenes?.length || 0} scenes, ~${script.estimated_duration_seconds || 30}s`, {
      hook: script.hook,
      scenes: script.scenes?.length,
    });

    // 3. Generate scene images with WaveSpeed
    const sceneImages: string[] = [];
    if (process.env.WAVESPEED_API_KEY && script.scenes) {
      this.info("Generating scene images with WaveSpeed AI...");
      for (let i = 0; i < Math.min(script.scenes.length, 3); i++) {
        const scene = script.scenes[i];
        try {
          const imageUrl = await this.generateSceneImage(scene.visual_description || scene.narration, i + 1);
          sceneImages.push(imageUrl);
          this.info(`Scene ${i + 1} image generated`, { url: imageUrl });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          this.warn(`Scene ${i + 1} image failed: ${msg}`);
        }
      }
    } else if (!process.env.WAVESPEED_API_KEY) {
      this.warn("WAVESPEED_API_KEY not set — skipping scene image generation");
    }

    // 4. Store product in database
    const productData = {
      title: script.title,
      hook: script.hook,
      scenes: script.scenes,
      cta: script.cta,
      hashtags: script.hashtags,
      estimated_duration: script.estimated_duration_seconds,
      scene_images: sceneImages,
      topic,
    };

    db.prepare("INSERT INTO products (agent_id, type, title, content, metadata) VALUES (?, ?, ?, ?, ?)").run(
      this.id, "video_script", script.title, scriptRaw.slice(0, 5000), JSON.stringify(productData),
    );

    this.success(`Video script created: "${script.title}" — ${script.scenes?.length || 0} scenes, ${sceneImages.length} images generated`);
  }

  private async generateSceneImage(description: string, sceneNum: number): Promise<string> {
    const prompt = `TikTok video scene ${sceneNum}, cinematic vertical format 9:16, ${description}, vibrant colors, social media aesthetic, high quality`;

    const response = await fetch(`${WAVESPEED_API}/wavespeed-ai/flux-dev/text-to-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WAVESPEED_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        size: "576x1024",
        num_inference_steps: 20,
      }),
    });

    if (!response.ok) {
      throw new Error(`WaveSpeed API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data?.url || data.output?.url || data.url || JSON.stringify(data).slice(0, 200);
  }
}
