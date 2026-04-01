import OpenAI from "openai";
import { BaseAgent } from "./base.js";
import { getDb } from "../db/schema.js";

export class TrendIntelligenceAgent extends BaseAgent {
  private openai: OpenAI;

  constructor() {
    super("trend-intelligence", "Trend Intelligence Agent");
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async run(): Promise<void> {
    this.info("Scanning for emerging micro-niches across platforms...");

    const categories = [
      "AI tools and automation",
      "health and wellness digital products",
      "personal finance templates",
      "remote work productivity",
      "creative side hustles",
    ];

    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    this.info(`Analyzing category: ${selectedCategory}`);

    this.info("Querying OpenAI for trend analysis...");
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a trend intelligence analyst specializing in digital economy opportunities. Analyze emerging micro-niches and score them by revenue potential. Return JSON only.`,
        },
        {
          role: "user",
          content: `Identify 5 trending micro-niches within "${selectedCategory}" that have high potential for digital product monetization in 2025-2026. For each, provide:
- keyword: the specific niche keyword
- score: revenue potential score 0-100
- source: likely discovery platform (Google Trends / Reddit / TikTok / Twitter)
- analysis: 2-sentence analysis of why this is trending and monetization approach

Return as JSON array.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("No response from OpenAI");
    }

    this.info("Parsing trend data from OpenAI response...");
    const parsed = JSON.parse(raw);
    const trends: Array<{ keyword: string; score: number; source: string; analysis: string }> =
      parsed.trends || parsed.niches || parsed.results || (Array.isArray(parsed) ? parsed : []);

    if (trends.length === 0) {
      this.warn("No trends extracted from response, storing raw analysis");
      const db = getDb();
      db.prepare("INSERT INTO trends (keyword, score, source, analysis) VALUES (?, ?, ?, ?)").run(
        selectedCategory, 50, "OpenAI", raw.slice(0, 2000),
      );
      return;
    }

    const db = getDb();
    const insert = db.prepare("INSERT INTO trends (keyword, score, source, analysis) VALUES (?, ?, ?, ?)");

    for (const trend of trends) {
      insert.run(trend.keyword, trend.score, trend.source, trend.analysis);
      this.info(`Trend found: "${trend.keyword}" — score ${trend.score}/100 via ${trend.source}`, {
        keyword: trend.keyword,
        score: trend.score,
      });
    }

    this.success(`Identified ${trends.length} trending micro-niches in "${selectedCategory}"`);
  }
}
