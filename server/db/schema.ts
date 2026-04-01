import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = process.env.DATABASE_PATH || path.resolve(import.meta.dirname, "..", "..", "data", "app.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    const dir = path.dirname(DB_PATH);
    fs.mkdirSync(dir, { recursive: true });
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    initSchema(_db);
  }
  return _db;
}

export interface AgentRow {
  id: string;
  name: string;
  description: string;
  phase: number;
  status: string;
  last_run_at: string | null;
  created_at: string;
}

export interface LogRow {
  id: number;
  agent_id: string;
  level: string;
  message: string;
  data: string | null;
  created_at: string;
}

export interface ProductRow {
  id: number;
  agent_id: string;
  type: string;
  title: string | null;
  content: string | null;
  metadata: string | null;
  created_at: string;
}

export interface TrendRow {
  id: number;
  keyword: string;
  score: number | null;
  source: string | null;
  analysis: string | null;
  created_at: string;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      phase INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'idle',
      last_run_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'info',
      message TEXT NOT NULL,
      data TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT,
      content TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS trends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      score REAL,
      source TEXT,
      analysis TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const count = db.prepare("SELECT COUNT(*) as c FROM agents").get() as { c: number };
  if (count.c === 0) {
    const insert = db.prepare("INSERT INTO agents (id, name, description, phase) VALUES (?, ?, ?, ?)");
    const seeds: [string, string, string, number][] = [
      ["trend-intelligence", "Trend Intelligence Agent", "Monitors Google Trends, Reddit, TikTok for emerging micro-niches using OpenAI analysis", 1],
      ["digital-products", "Digital Products Agent", "Generates ebooks, templates, printables using OpenAI for content and WaveSpeed for cover art", 2],
      ["short-form-video", "Short-Form Video Agent", "Creates TikTok/Reels scripts with OpenAI and scene images with WaveSpeed", 2],
      ["seo-content", "SEO Content Engine", "Generates SEO-optimized blog posts and articles for organic traffic", 2],
      ["email-marketing", "Email Marketing Agent", "Creates email sequences and newsletter content for audience nurturing", 3],
      ["ad-creative", "Ad Creative Agent", "Generates ad copy and creative assets for paid campaigns", 3],
      ["analytics", "Analytics Agent", "Tracks performance metrics across all revenue streams", 4],
      ["master-orchestrator", "Master Orchestrator", "Coordinates all agents, manages execution pipeline and resource allocation", 1],
    ];
    for (const [id, name, desc, phase] of seeds) {
      insert.run(id, name, desc, phase);
    }
  }
}
