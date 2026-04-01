import OpenAI from "openai";
import { BaseAgent } from "./base.js";
import { getDb } from "../db/schema.js";

const WAVESPEED_API = "https://api.wavespeed.ai/api/v3";

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

    // 4. Generate cover image with WaveSpeed
    let coverUrl: string | null = null;
    if (process.env.WAVESPEED_API_KEY) {
      this.info("Generating ebook cover with WaveSpeed AI...");
      try {
        coverUrl = await this.generateCover(outline.title, topic);
        this.success(`Cover image generated: ${coverUrl}`);
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

    const response = await fetch(`${WAVESPEED_API}/wavespeed-ai/flux-dev/image-to-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WAVESPEED_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        size: "768x1024",
        num_inference_steps: 20,
      }),
    });

    if (!response.ok) {
      // Try text-to-image endpoint instead
      const resp2 = await fetch(`${WAVESPEED_API}/wavespeed-ai/flux-dev/text-to-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WAVESPEED_API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          size: "768x1024",
          num_inference_steps: 20,
        }),
      });

      if (!resp2.ok) {
        throw new Error(`WaveSpeed API error: ${resp2.status} ${resp2.statusText}`);
      }

      const data = await resp2.json();
      return data.data?.url || data.output?.url || data.url || JSON.stringify(data).slice(0, 200);
    }

    const data = await response.json();
    return data.data?.url || data.output?.url || data.url || JSON.stringify(data).slice(0, 200);
  }
}
