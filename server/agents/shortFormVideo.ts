import OpenAI from "openai";
import { BaseAgent } from "./base.js";
import { getDb } from "../db/schema.js";

const WAVESPEED_API = "https://api.wavespeed.ai/api/v3";
const WAVESPEED_TEXT2IMG = `${WAVESPEED_API}/google/nano-banana-2/text-to-image-fast`;
const WAVESPEED_EDIT = `${WAVESPEED_API}/google/nano-banana-2/edit-fast`;
const WAVESPEED_POLL_INTERVAL = 2000;
const WAVESPEED_MAX_POLLS = 30;

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

    // 3. Generate scene images with WaveSpeed nano-banana-2
    const sceneImages: string[] = [];
    if (process.env.WAVESPEED_API_KEY && script.scenes) {
      this.info("Generating scene images with WaveSpeed nano-banana-2...");
      for (let i = 0; i < Math.min(script.scenes.length, 3); i++) {
        const scene = script.scenes[i];
        try {
          const rawUrl = await this.generateSceneImage(scene.visual_description || scene.narration, i + 1);
          // Apply edit-fast to stylize for social media
          try {
            const styledUrl = await this.editImage(rawUrl, `Enhance for TikTok/Reels: add vibrant social media color grading, cinematic look, scene ${i + 1}`);
            sceneImages.push(styledUrl);
            this.info(`Scene ${i + 1} styled image generated`, { url: styledUrl });
          } catch (editErr) {
            const editMsg = editErr instanceof Error ? editErr.message : String(editErr);
            this.warn(`Scene ${i + 1} edit failed: ${editMsg} — using raw image`);
            sceneImages.push(rawUrl);
          }
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

    // Submit task to nano-banana-2 text-to-image-fast
    const response = await fetch(WAVESPEED_TEXT2IMG, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WAVESPEED_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: "9:16",
        resolution: "2k",
        output_format: "png",
        enable_web_search: true,
        enable_base64_output: false,
        enable_sync_mode: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`WaveSpeed submit error: ${response.status} ${errText}`);
    }

    const submitData = await response.json();
    const taskId = submitData.data?.id;
    if (!taskId) throw new Error("No task ID returned from WaveSpeed");

    // Poll for result
    return this.pollWaveSpeedResult(taskId);
  }

  private async editImage(imageUrl: string, editPrompt: string): Promise<string> {
    const response = await fetch(WAVESPEED_EDIT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WAVESPEED_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: editPrompt,
        images: [imageUrl],
        resolution: "2k",
        output_format: "png",
        enable_web_search: true,
        enable_base64_output: false,
        enable_sync_mode: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`WaveSpeed edit error: ${response.status} ${errText}`);
    }

    const submitData = await response.json();
    const taskId = submitData.data?.id;
    if (!taskId) throw new Error("No task ID returned from WaveSpeed edit");

    return this.pollWaveSpeedResult(taskId);
  }

  private async pollWaveSpeedResult(taskId: string): Promise<string> {
    for (let i = 0; i < WAVESPEED_MAX_POLLS; i++) {
      await new Promise(resolve => setTimeout(resolve, WAVESPEED_POLL_INTERVAL));

      const res = await fetch(`${WAVESPEED_API}/predictions/${taskId}/result`, {
        headers: { Authorization: `Bearer ${process.env.WAVESPEED_API_KEY}` },
      });

      if (!res.ok) continue;
      const result = await res.json();
      const status = result.data?.status;

      if (status === "completed") {
        const outputs = result.data?.outputs;
        if (Array.isArray(outputs) && outputs.length > 0) return outputs[0];
        throw new Error("WaveSpeed completed but no outputs");
      }
      if (status === "failed") {
        throw new Error(`WaveSpeed task failed: ${result.data?.error || "unknown"}`);
      }
    }
    throw new Error("WaveSpeed polling timed out");
  }
}
