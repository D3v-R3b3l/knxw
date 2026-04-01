import { BaseAgent } from "./base.js";
import { getDb } from "../db/schema.js";
import { createAIClient, completionOptions, extractJSON, aiBackendName } from "./aiClient.js";

export class TrendIntelligenceAgent extends BaseAgent {
  constructor() {
    super("trend-intelligence", "Trend Intelligence Agent");
  }

  async run(): Promise<void> {
    const ai = createAIClient();
    this.info(`Scanning for emerging micro-niches (via ${aiBackendName})...`);

    const categories = [
      "AI tools and automation",
      "health and wellness digital products",
      "personal finance templates",
      "remote work productivity",
      "creative side hustles",
    ];

    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    this.info(`Analyzing category: ${selectedCategory}`);

    this.info(`Querying ${aiBackendName} for trend analysis...`);
    const completion = await ai.chat.completions.create(
      completionOptions({
        json: true,
        temperature: 0.8,
        maxTokens: 1500,
        messages: [
          {
            role: "system",
            content: `You are a trend intelligence analyst specializing in digital economy opportunities. Analyze emerging micro-niches and score them by revenue potential.
You MUST respond with ONLY a valid JSON object. No explanations, no markdown, no extra text.`,
          },
          {
            role: "user",
            content: `Identify 3 trending micro-niches within "${selectedCategory}" that have high potential for digital product monetization in 2025-2026.

Respond with ONLY this JSON structure (no other text):
{
  "trends": [
    {
      "keyword": "specific niche keyword",
      "score": 85,
      "source": "Google Trends",
      "analysis": "Two sentence analysis of why this trends and how to monetize it."
    }
  ]
}`,
          },
        ],
      }),
    );

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error(`No response from ${aiBackendName}`);
    }

    this.info("Parsing trend data from AI response...");
    const cleaned = extractJSON(raw);
    const parsed = JSON.parse(cleaned);
    const trends: Array<{ keyword: string; score: number; source: string; analysis: string }> =
      parsed.trends || parsed.niches || parsed.results || (Array.isArray(parsed) ? parsed : []);

    if (trends.length === 0) {
      this.warn("No trends extracted from response, storing raw analysis");
      const db = getDb();
      db.prepare("INSERT INTO trends (keyword, score, source, analysis) VALUES (?, ?, ?, ?)").run(
        selectedCategory, 50, aiBackendName, raw.slice(0, 2000),
      );
      return;
    }

    const db = getDb();
    const insert = db.prepare("INSERT INTO trends (keyword, score, source, analysis) VALUES (?, ?, ?, ?)");

    for (const trend of trends) {
      insert.run(trend.keyword, trend.score || 50, trend.source || aiBackendName, trend.analysis || "");
      this.info(`Trend found: "${trend.keyword}" — score ${trend.score || 50}/100 via ${trend.source || "AI"}`, {
        keyword: trend.keyword,
        score: trend.score,
      });
    }

    this.success(`Identified ${trends.length} trending micro-niches in "${selectedCategory}"`);
  }
}
