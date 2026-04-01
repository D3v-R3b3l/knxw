import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { getDb } from "./db/schema.js";
import { addSseClient, broadcastLog, setAgentStatus } from "./db/logger.js";
import { TrendIntelligenceAgent } from "./agents/trendIntelligence.js";
import { DigitalProductsAgent } from "./agents/digitalProducts.js";
import { ShortFormVideoAgent } from "./agents/shortFormVideo.js";
import { MasterOrchestrator } from "./agents/masterOrchestrator.js";
import type { BaseAgent } from "./agents/base.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Track running agents so we don't double-start them
const runningAgents = new Map<string, Promise<void>>();

function getAgentInstance(id: string): BaseAgent | null {
  switch (id) {
    case "trend-intelligence": return new TrendIntelligenceAgent();
    case "digital-products": return new DigitalProductsAgent();
    case "short-form-video": return new ShortFormVideoAgent();
    case "master-orchestrator": return new MasterOrchestrator();
    default: return null;
  }
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // Initialize database
  const db = getDb();
  console.log("Database initialized");

  // ─── API Routes ───────────────────────────────────────────────

  // GET /api/agents — list all agents with status
  app.get("/api/agents", (_req, res) => {
    const agents = db.prepare("SELECT * FROM agents ORDER BY phase ASC, name ASC").all();
    res.json(agents);
  });

  // GET /api/agents/:id — single agent detail
  app.get("/api/agents/:id", (req, res) => {
    const agent = db.prepare("SELECT * FROM agents WHERE id = ?").get(req.params.id);
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    res.json(agent);
  });

  // POST /api/agents/:id/run — execute an agent
  app.post("/api/agents/:id/run", (req, res) => {
    const agentId = req.params.id;
    const agentRow = db.prepare("SELECT * FROM agents WHERE id = ?").get(agentId) as { id: string; status: string } | undefined;
    if (!agentRow) return res.status(404).json({ error: "Agent not found" });

    if (runningAgents.has(agentId)) {
      return res.status(409).json({ error: "Agent is already running" });
    }

    const instance = getAgentInstance(agentId);
    if (!instance) {
      return res.status(400).json({ error: `Agent "${agentId}" does not have a real implementation yet` });
    }

    // Check for required API keys
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ error: "OPENAI_API_KEY environment variable is not set" });
    }

    // Start execution asynchronously
    const promise = instance.execute().finally(() => {
      runningAgents.delete(agentId);
    });
    runningAgents.set(agentId, promise);

    res.json({ status: "started", agent_id: agentId });
  });

  // POST /api/agents/:id/stop — stop an agent (sets status to idle)
  app.post("/api/agents/:id/stop", (req, res) => {
    const agentId = req.params.id;
    setAgentStatus(agentId, "idle");
    runningAgents.delete(agentId);
    broadcastLog(agentId, "warn", `${agentId} execution stopped by user`);
    res.json({ status: "stopped", agent_id: agentId });
  });

  // GET /api/logs — get recent logs
  app.get("/api/logs", (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const agentId = req.query.agent_id as string | undefined;
    let logs;
    if (agentId) {
      logs = db.prepare("SELECT * FROM logs WHERE agent_id = ? ORDER BY id DESC LIMIT ?").all(agentId, limit);
    } else {
      logs = db.prepare("SELECT * FROM logs ORDER BY id DESC LIMIT ?").all(limit);
    }
    res.json(logs);
  });

  // GET /api/logs/stream — SSE endpoint for live feed
  app.get("/api/logs/stream", (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write("data: {\"type\":\"connected\"}\n\n");
    addSseClient(res);

    // Keep alive every 30s
    const keepAlive = setInterval(() => {
      try { res.write(": keepalive\n\n"); } catch { clearInterval(keepAlive); }
    }, 30000);
    req.on("close", () => clearInterval(keepAlive));
  });

  // GET /api/products — get generated products
  app.get("/api/products", (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const products = db.prepare("SELECT * FROM products ORDER BY id DESC LIMIT ?").all(limit);
    res.json(products);
  });

  // GET /api/trends — get discovered trends
  app.get("/api/trends", (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const trends = db.prepare("SELECT * FROM trends ORDER BY id DESC LIMIT ?").all(limit);
    res.json(trends);
  });

  // GET /api/status — system health check
  app.get("/api/status", (_req, res) => {
    const agentCount = db.prepare("SELECT COUNT(*) as c FROM agents").get() as { c: number };
    const logCount = db.prepare("SELECT COUNT(*) as c FROM logs").get() as { c: number };
    const productCount = db.prepare("SELECT COUNT(*) as c FROM products").get() as { c: number };
    const trendCount = db.prepare("SELECT COUNT(*) as c FROM trends").get() as { c: number };
    res.json({
      status: "ok",
      openai_configured: !!process.env.OPENAI_API_KEY,
      wavespeed_configured: !!process.env.WAVESPEED_API_KEY,
      agents: agentCount.c,
      logs: logCount.c,
      products: productCount.c,
      trends: trendCount.c,
      running_agents: Array.from(runningAgents.keys()),
    });
  });

  // ─── Static file serving (production) ─────────────────────────
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3001;

  server.listen(port, () => {
    console.log(`API server running on http://localhost:${port}/`);
    console.log(`OpenAI configured: ${!!process.env.OPENAI_API_KEY}`);
    console.log(`WaveSpeed configured: ${!!process.env.WAVESPEED_API_KEY}`);
  });
}

startServer().catch(console.error);
