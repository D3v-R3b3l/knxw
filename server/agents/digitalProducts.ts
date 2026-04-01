import OpenAI from "openai";
import { BaseAgent } from "./base.js";
import { getDb } from "../db/schema.js";

const WAVESPEED_API = "https://api.wavespeed.ai/api/v3";
const WAVESPEED_TEXT2IMG = `${WAVESPEED_API}/google/nano-banana-2/text-to-image-fast`;
const WAVESPEED_EDIT = `${WAVESPEED_API}/google/nano-banana-2/edit-fast`;
const WAVESPEED_POLL_INTERVAL = 2000;
const WAVESPEED_MAX_POLLS = 30;

export class DigitalProductsAgent extends BaseAgent {
  private openai: OpenAI;

  constructor() {
    super("digital-products", "Digital Products Agent");
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async run(): Promise<void> {
    this.info("Starting digital product generation pipeline...");

    // 1. Pick a trending topic from DB or fallback
    const db = getDb();
    const trend = db.prepare("SELECT keyword, analysis FROM trends ORDER BY score DESC LIMIT 1").get() as
      | { keyword: string; analysis: string }
      | undefined;

    const topic = trend?.keyword || "AI productivity tools for solopreneurs";
    this.info(`Generating digital product for topic: "${topic}"`);

    // 2. Generate ebook outline with OpenAI
    this.info("Generating ebook outline with OpenAI...");
    const outlineCompletion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a digital product creator specializing in ebooks and guides. Return JSON only.",
        },
        {
          role: "user",
          content: `Create a short ebook outline about "${topic}". Include:
- title: catchy ebook title
- subtitle: brief subtitle
- chapters: array of 5 chapter objects with {title, summary} each
- target_audience: who this is for
- price_point: suggested price in USD

Return as JSON object.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1200,
    });

    const outlineRaw = outlineCompletion.choices[0]?.message?.content;
    if (!outlineRaw) throw new Error("No outline response from OpenAI");

    const outline = JSON.parse(outlineRaw);
    this.info(`Ebook outline: "${outline.title}"`, { chapters: outline.chapters?.length || 0, price: outline.price_point });

    // 3. Generate first chapter content
    this.info("Generating chapter 1 content with OpenAI...");
    const chapterCompletion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert ebook writer. Write engaging, actionable content.",
        },
        {
          role: "user",
          content: `Write chapter 1 of an ebook titled "${outline.title}" about "${topic}". 
Chapter title: "${outline.chapters?.[0]?.title || "Introduction"}".
Write 400-600 words of high-quality content. Include practical tips and examples.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const chapterContent = chapterCompletion.choices[0]?.message?.content || "";
    this.info(`Chapter 1 generated: ${chapterContent.length} characters`);

    // 4. Generate cover image with WaveSpeed nano-banana-2
    let coverUrl: string | null = null;
    if (process.env.WAVESPEED_API_KEY) {
      this.info("Generating ebook cover with WaveSpeed nano-banana-2...");
      try {
        const rawCoverUrl = await this.generateCover(outline.title, topic);
        this.info(`Raw cover generated, applying stylized edit...`);
        // Apply edit-fast to stylize the cover
        try {
          coverUrl = await this.editImage(rawCoverUrl, `Stylize as a premium ebook cover for "${outline.title}", add polished book cover layout, professional typography space`);
          this.success(`Styled cover image generated: ${coverUrl}`);
        } catch (editErr) {
          const editMsg = editErr instanceof Error ? editErr.message : String(editErr);
          this.warn(`Edit-fast failed: ${editMsg} — using raw cover`);
          coverUrl = rawCoverUrl;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.warn(`WaveSpeed cover generation failed: ${msg} — continuing without cover`);
      }
    } else {
      this.warn("WAVESPEED_API_KEY not set — skipping cover generation");
    }

    // 5. Store product in database
    const productData = {
      title: outline.title,
      subtitle: outline.subtitle,
      chapters: outline.chapters,
      chapter1_content: chapterContent.slice(0, 2000),
      target_audience: outline.target_audience,
      price_point: outline.price_point,
      cover_url: coverUrl,
      topic,
    };

    db.prepare("INSERT INTO products (agent_id, type, title, content, metadata) VALUES (?, ?, ?, ?, ?)").run(
      this.id, "ebook", outline.title, chapterContent.slice(0, 5000), JSON.stringify(productData),
    );

    this.success(`Digital product created: "${outline.title}" — ${outline.chapters?.length || 0} chapters, $${outline.price_point}`);
  }

  private async generateCover(title: string, topic: string): Promise<string> {
    const prompt = `Professional ebook cover design, modern minimalist style, gradient background, bold typography area for title "${title}", topic: ${topic}, digital product mockup, clean and premium look`;

    // Submit task to nano-banana-2 text-to-image-fast
    const response = await fetch(WAVESPEED_TEXT2IMG, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WAVESPEED_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: "3:4",
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
