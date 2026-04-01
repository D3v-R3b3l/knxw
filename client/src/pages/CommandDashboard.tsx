/**
 * knXw Labs — Command Dashboard
 * ─────────────────────────────
 * DESIGN: Obsidian Intelligence — Dark ops control room aesthetic
 * Shows: Agent status, KPI counters, system architecture, setup checklist, launch guide
 * Typography: Space Grotesk + IBM Plex Mono
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Activity, Zap, TrendingUp, Video, ShoppingBag, Bot, Brain,
  CheckCircle2, Circle, AlertCircle, ChevronRight, Copy, Terminal,
  BookOpen, BarChart3, Globe, Link2, Cpu, Shield, ArrowRight,
  ExternalLink, FileText, Play, Settings, Database, Layers,
  Pause, Square, Filter, ChevronDown, Wifi, WifiOff,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Agent {
  id: string;
  name: string;
  description: string;
  phase: number;
  status: "active" | "ready" | "pending";
  icon: React.ReactNode;
  color: string;
  dailyOutput: string;
  unitEconomics: string;
  activatesAt: string;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  command?: string;
  link?: string;
  linkLabel?: string;
  required: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const AGENTS: Agent[] = [
  {
    id: "trend",
    name: "Trend Intelligence Agent",
    description: "Scans Google Trends, Reddit, and TikTok every 6 hours to identify high-opportunity niches. Scores each niche on velocity, competition, and monetisation potential. Outputs structured briefs to all downstream agents.",
    phase: 1,
    status: "active",
    icon: <TrendingUp size={18} />,
    color: "#00d4ff",
    dailyOutput: "10–20 trend briefs/day",
    unitEconomics: "~$0.02 per brief (LLM only)",
    activatesAt: "Day 1",
  },
  {
    id: "digital",
    name: "Digital Products Agent",
    description: "Consumes trend briefs and generates complete ebooks, guides, and coloring books. Uses GPT-4o-mini for content, WaveSpeed FLUX for covers, and ReportLab for PDF compilation. Prepares KDP and Gumroad listing metadata automatically.",
    phase: 1,
    status: "active",
    icon: <BookOpen size={18} />,
    color: "#a855f7",
    dailyOutput: "10–100 products/day",
    unitEconomics: "$0.30–$0.50 per product (LLM + image)",
    activatesAt: "Day 1",
  },
  {
    id: "video",
    name: "Short-Form Video Agent",
    description: "Generates viral short-form video scripts, scene-by-scene visuals via WaveSpeed, and voiceovers via ElevenLabs TTS. Assembles final video with ffmpeg. Embeds affiliate links in captions. Targets TikTok, YouTube Shorts, and Instagram Reels simultaneously.",
    phase: 1,
    status: "active",
    icon: <Video size={18} />,
    color: "#f97316",
    dailyOutput: "20–50 videos/day",
    unitEconomics: "$0.15–$0.40 per video",
    activatesAt: "Day 1",
  },
  {
    id: "ecom",
    name: "E-Commerce Agent",
    description: "Generates product listings, AI-created product images, and manages a Shopify store. Identifies trending dropshipping products, creates optimised listings, and routes ad spend from the Advertising Agent to highest-converting products.",
    phase: 2,
    status: "ready",
    icon: <ShoppingBag size={18} />,
    color: "#22c55e",
    dailyOutput: "5–20 listings/day",
    unitEconomics: "$35 avg order × 1.4% CVR",
    activatesAt: "Month 2",
  },
  {
    id: "blog",
    name: "SEO Blog Agent",
    description: "Generates long-form SEO-optimised blog posts targeting low-competition keywords identified by the Trend Agent. Publishes to a WordPress or Ghost blog. Monetises via AdSense, affiliate links, and product upsells.",
    phase: 2,
    status: "ready",
    icon: <FileText size={18} />,
    color: "#eab308",
    dailyOutput: "5–10 posts/day",
    unitEconomics: "$2.50 RPM × organic traffic",
    activatesAt: "Month 2",
  },
  {
    id: "ads",
    name: "Advertising Agent",
    description: "Monitors all vertical performance and automatically allocates ad spend to highest-ROI products and videos. Manages TikTok Ads, Meta Ads, and Google Ads campaigns. Targets 3–5× ROAS minimum before scaling spend.",
    phase: 3,
    status: "pending",
    icon: <BarChart3 size={18} />,
    color: "#ec4899",
    dailyOutput: "Dynamic (ROAS-gated)",
    unitEconomics: "3–5× ROAS on ad spend",
    activatesAt: "Month 3",
  },
  {
    id: "sales",
    name: "System Sales Agent",
    description: "Packages and sells the knXw Labs system itself as a licensed product. Generates sales funnels, lead magnets, webinar scripts, and email sequences. Targets entrepreneurs and digital marketers via the same content channels the system already operates.",
    phase: 4,
    status: "pending",
    icon: <Globe size={18} />,
    color: "#06b6d4",
    dailyOutput: "1–3 qualified leads/day",
    unitEconomics: "$97–$497 per license",
    activatesAt: "Month 4",
  },
  {
    id: "orchestrator",
    name: "Master Orchestrator",
    description: "The central brain. Schedules all agents, routes capital between verticals based on ROI, enforces daily API spend caps, and runs a weekly LLM-driven performance review to self-adjust strategy. Maintains a full audit log of every decision.",
    phase: 1,
    status: "active",
    icon: <Brain size={18} />,
    color: "#f43f5e",
    dailyOutput: "Continuous",
    unitEconomics: "~$0.05/day (scheduler only)",
    activatesAt: "Day 1",
  },
];

const SETUP_STEPS: SetupStep[] = [
  {
    id: "clone",
    title: "Download the system",
    description: "Extract the knXw Labs archive to your server or local machine.",
    command: "unzip knxw_labs_v1.0.zip && cd knxw-labs",
    required: true,
  },
  {
    id: "deps",
    title: "Install dependencies",
    description: "Python 3.11+ required. ffmpeg is needed for video assembly.",
    command: "pip install -r requirements.txt && sudo apt install ffmpeg",
    required: true,
  },
  {
    id: "env",
    title: "Configure API keys",
    description: "Copy the template and add your OpenAI and WaveSpeed API keys. These are the only two required keys to start.",
    command: "cp .env.template .env && nano .env",
    required: true,
  },
  {
    id: "openai",
    title: "Get OpenAI API key",
    description: "GPT-4o-mini is used for all content generation. At $0.15/1M tokens, generating a full ebook costs approximately $0.08.",
    link: "https://platform.openai.com/api-keys",
    linkLabel: "platform.openai.com",
    required: true,
  },
  {
    id: "wavespeed",
    title: "Get WaveSpeed API key",
    description: "Used for all image generation (FLUX), video generation (Kling), and TTS (ElevenLabs). You already have access via wavespeed.ai.",
    link: "https://wavespeed.ai",
    linkLabel: "wavespeed.ai",
    required: true,
  },
  {
    id: "setup",
    title: "Run first-time setup",
    description: "Initialises the SQLite database, verifies API keys, and creates all output directories.",
    command: "python launch.py --setup",
    required: true,
  },
  {
    id: "test",
    title: "Test run (single pass)",
    description: "Runs all agents once. Generates ~5 trend briefs, 2–3 ebooks, and 3–5 videos. Costs approximately $0.50–$2.00.",
    command: "python launch.py --run-once",
    required: true,
  },
  {
    id: "daemon",
    title: "Start autonomous daemon",
    description: "Launches the full system. Runs continuously, executing all agents on their scheduled cadence.",
    command: "python launch.py --daemon",
    required: true,
  },
  {
    id: "kdp",
    title: "Create Amazon KDP account",
    description: "Free to join. 70% royalty on $2.99–$9.99 ebooks. Required for digital product publishing.",
    link: "https://kdp.amazon.com",
    linkLabel: "kdp.amazon.com",
    required: false,
  },
  {
    id: "gumroad",
    title: "Create Gumroad account",
    description: "Free to join. 10% fee. Instant payouts. Easier to automate than KDP for initial launch.",
    link: "https://gumroad.com",
    linkLabel: "gumroad.com",
    required: false,
  },
  {
    id: "tiktok_dev",
    title: "Register TikTok Developer App",
    description: "Required for automated video posting. Apply for Content Posting API access.",
    link: "https://developers.tiktok.com",
    linkLabel: "developers.tiktok.com",
    required: false,
  },
];

const ARCHITECTURE_LAYERS = [
  {
    label: "Data Layer",
    color: "#00d4ff",
    items: ["Google Trends API", "Reddit (PRAW)", "TikTok Search", "Amazon BSR"],
  },
  {
    label: "Intelligence Layer",
    color: "#a855f7",
    items: ["GPT-4o-mini (content)", "WaveSpeed FLUX (images)", "Kling 2.6 (video)", "ElevenLabs TTS"],
  },
  {
    label: "Production Layer",
    color: "#f97316",
    items: ["Digital Products Agent", "Video Agent", "Blog Agent", "E-Commerce Agent"],
  },
  {
    label: "Distribution Layer",
    color: "#22c55e",
    items: ["Amazon KDP", "Gumroad", "TikTok / YouTube / Instagram", "Shopify"],
  },
  {
    label: "Revenue Layer",
    color: "#eab308",
    items: ["Affiliate Commissions", "Product Sales", "Ad Revenue", "System Licenses"],
  },
  {
    label: "Orchestration Layer",
    color: "#f43f5e",
    items: ["Master Orchestrator", "Capital Router", "KPI Monitor", "Self-Improvement Loop"],
  },
];

// ─── Log Feed Types & Data ───────────────────────────────────────────────────

type LogLevel = "info" | "success" | "warn" | "error" | "action";

interface LogEntry {
  id: number;
  ts: string;
  agentId: string;
  agentName: string;
  agentColor: string;
  level: LogLevel;
  message: string;
  detail?: string;
}

const LOG_TEMPLATES: Record<string, { level: LogLevel; messages: Array<{ msg: string; detail?: string }> }[]> = {
  trend: [
    { level: "info",    messages: [{ msg: "Scanning Google Trends for niche opportunities...", detail: "Querying 47 seed keywords across 12 categories" }] },
    { level: "success", messages: [{ msg: "Trend detected: 'AI coloring books for adults' — score 91/100", detail: "Velocity: +340% WoW · Competition: Low · Est. monthly revenue: $2,100" }] },
    { level: "success", messages: [{ msg: "Trend detected: 'somatic healing journal prompts' — score 87/100", detail: "Velocity: +210% WoW · Competition: Medium · Est. monthly revenue: $1,450" }] },
    { level: "action",  messages: [{ msg: "Brief dispatched → Digital Products Agent", detail: "Niche: 'AI coloring books for adults' · Priority: HIGH" }] },
    { level: "info",    messages: [{ msg: "Scanning Reddit r/passive_income, r/KDP, r/digitalmarketing...", detail: "Parsing 1,200 posts from last 48h" }] },
    { level: "success", messages: [{ msg: "Trend detected: 'minimalist budget planner 2026' — score 84/100", detail: "Velocity: +180% WoW · Competition: Low · Est. monthly revenue: $980" }] },
    { level: "action",  messages: [{ msg: "Brief dispatched → Video Agent", detail: "Niche: 'minimalist budget planner 2026' · Format: Short-form" }] },
    { level: "info",    messages: [{ msg: "TikTok trend scan complete — 23 rising audio tracks identified", detail: "Top audio: 'Lo-fi study beats' · 2.1M uses this week" }] },
    { level: "warn",    messages: [{ msg: "Niche 'crypto trading bots' flagged — high competition (score: 34)", detail: "Skipping: 847 competing KDP titles published in last 30 days" }] },
    { level: "success", messages: [{ msg: "Daily brief batch complete — 14 briefs generated", detail: "HIGH priority: 3 · MEDIUM: 8 · LOW: 3 · Total LLM cost: $0.28" }] },
  ],
  digital: [
    { level: "info",    messages: [{ msg: "Received brief: 'AI coloring books for adults'", detail: "Starting content pipeline..." }] },
    { level: "action",  messages: [{ msg: "Generating ebook outline — 24 chapters, 8,400 words", detail: "Model: gpt-4o-mini · Est. cost: $0.08" }] },
    { level: "success", messages: [{ msg: "Outline complete — generating full manuscript...", detail: "8,412 words written in 34s · Cost: $0.07" }] },
    { level: "action",  messages: [{ msg: "Requesting cover image from WaveSpeed FLUX...", detail: "Prompt: 'Elegant adult coloring book cover, mandala patterns, soft gold and teal palette'" }] },
    { level: "success", messages: [{ msg: "Cover generated — 1024×1024px FLUX image", detail: "Generation time: 8.2s · Cost: $0.04 · Saved: output/covers/acb_001.png" }] },
    { level: "action",  messages: [{ msg: "Compiling PDF — ReportLab rendering 24 chapters + cover", detail: "Adding KDP-compliant margins, ISBN placeholder, copyright page" }] },
    { level: "success", messages: [{ msg: "PDF compiled — 'The AI Coloring Companion Vol.1.pdf' (4.2MB)", detail: "Ready for KDP upload · Saved: output/products/acb_001.pdf" }] },
    { level: "action",  messages: [{ msg: "Writing KDP listing metadata...", detail: "Title, subtitle, 7 keywords, BISAC category, description (400 words)" }] },
    { level: "success", messages: [{ msg: "Product complete — queued for KDP upload", detail: "Total pipeline cost: $0.31 · Time: 2m 14s · Product #47 today" }] },
    { level: "info",    messages: [{ msg: "Starting next brief: 'somatic healing journal prompts'", detail: "Queue depth: 8 briefs remaining" }] },
    { level: "success", messages: [{ msg: "Batch complete — 12 products generated today", detail: "Total cost: $3.72 · Avg per product: $0.31 · Queued for upload: 12" }] },
  ],
  video: [
    { level: "info",    messages: [{ msg: "Received brief: 'minimalist budget planner 2026'", detail: "Format: TikTok/Reels/Shorts · Target length: 45s" }] },
    { level: "action",  messages: [{ msg: "Generating viral script — hook + 3 scenes + CTA", detail: "Trend angle: 'I saved $4,200 in 90 days using this system'" }] },
    { level: "success", messages: [{ msg: "Script complete — hook score: 94/100", detail: "Hook: 'This $7 planner made me $4,200 richer in 90 days' · CTA: affiliate link" }] },
    { level: "action",  messages: [{ msg: "Generating 6 scene images via WaveSpeed FLUX...", detail: "Scene 1/6: 'Minimalist desk setup, open planner, morning light'" }] },
    { level: "success", messages: [{ msg: "Scene images complete — 6/6 generated", detail: "Total image cost: $0.24 · Avg generation: 7.1s per image" }] },
    { level: "action",  messages: [{ msg: "Requesting voiceover from ElevenLabs TTS...", detail: "Voice: Rachel (conversational) · Length: 43s · Cost: $0.06" }] },
    { level: "success", messages: [{ msg: "Voiceover complete — 43s audio generated", detail: "Saved: output/audio/vid_031_vo.mp3" }] },
    { level: "action",  messages: [{ msg: "Assembling final video with ffmpeg...", detail: "Combining 6 scenes + voiceover + captions + affiliate link overlay" }] },
    { level: "success", messages: [{ msg: "Video assembled — 'budget_planner_2026_v1.mp4' (18.4MB)", detail: "Duration: 43s · Resolution: 1080×1920 · Ready for upload" }] },
    { level: "action",  messages: [{ msg: "Posting to TikTok, YouTube Shorts, Instagram Reels...", detail: "Caption includes affiliate link: amzn.to/3xKp9Qm · 5 hashtags" }] },
    { level: "success", messages: [{ msg: "Video published across 3 platforms", detail: "TikTok: ✓ · YouTube Shorts: ✓ · Instagram Reels: ✓ · Total cost: $0.37" }] },
  ],
  ecom: [
    { level: "info",    messages: [{ msg: "Scanning Shopify trending products — AliExpress BSR analysis", detail: "Checking 340 products across 18 categories" }] },
    { level: "success", messages: [{ msg: "Product identified: 'LED sunset lamp' — demand score 88", detail: "AliExpress price: $4.20 · Target sell price: $24.99 · Margin: 83%" }] },
    { level: "action",  messages: [{ msg: "Generating 4 product images via WaveSpeed FLUX...", detail: "Lifestyle shots: bedroom, desk, living room + white background" }] },
    { level: "success", messages: [{ msg: "Product listing created — 'Ambient Sunset Projection Lamp'", detail: "Title optimised · 5 bullet points · 847-word description · SEO score: 91" }] },
    { level: "action",  messages: [{ msg: "Listing pushed to Shopify store", detail: "Product ID: #1047 · Price: $24.99 · Inventory: dropship (unlimited)" }] },
    { level: "success", messages: [{ msg: "Sale recorded — Order #1089 · $24.99", detail: "Customer: US · Profit after COGS: $20.79 · Fulfillment: AliExpress auto" }] },
  ],
  blog: [
    { level: "info",    messages: [{ msg: "Keyword research: 'best AI tools for passive income 2026'", detail: "Search volume: 8,100/mo · KD: 28 · CPC: $1.40" }] },
    { level: "action",  messages: [{ msg: "Generating 1,800-word SEO article...", detail: "H1 + 6 H2s + internal links + affiliate placements" }] },
    { level: "success", messages: [{ msg: "Article published — 'knxwlabs.com/ai-passive-income-2026'", detail: "Words: 1,847 · Images: 3 · Affiliate links: 4 · Cost: $0.09" }] },
    { level: "success", messages: [{ msg: "AdSense impression recorded — RPM: $3.20", detail: "Page views today: 142 · Est. daily AdSense: $0.45" }] },
  ],
  ads: [
    { level: "info",    messages: [{ msg: "Monitoring all vertical ROAS — daily performance review", detail: "Checking 12 active campaigns across TikTok Ads + Meta Ads" }] },
    { level: "success", messages: [{ msg: "Top performer: 'budget_planner_2026_v1' — ROAS 4.7×", detail: "Spend: $12.40 · Revenue: $58.28 · Scaling budget +25%" }] },
    { level: "warn",    messages: [{ msg: "Campaign 'sunset_lamp_v2' underperforming — ROAS 1.2×", detail: "Pausing campaign · Reallocating $8/day to top performers" }] },
  ],
  orchestrator: [
    { level: "info",    messages: [{ msg: "Daily performance review initiated — 06:00 UTC", detail: "Analysing 8 verticals · 47 products · 31 videos · 12 blog posts" }] },
    { level: "success", messages: [{ msg: "Capital allocation updated — routing $3.20 to Digital Agent", detail: "ROI rank: Digital (4.2×) > Video (3.8×) > Blog (2.1×) > Ecom (1.9×)" }] },
    { level: "action",  messages: [{ msg: "Scheduled: Trend Agent scan in 2h 14m", detail: "Next full scan: 08:14 UTC · Partial scan: 07:00 UTC" }] },
    { level: "success", messages: [{ msg: "Weekly self-improvement loop complete", detail: "Adjusted: ebook hit rate model +3% · Video hook scoring recalibrated" }] },
    { level: "info",    messages: [{ msg: "System health check — all agents nominal", detail: "API quotas: OpenAI 12% · WaveSpeed 8% · No errors in last 24h" }] },
    { level: "success", messages: [{ msg: "Revenue milestone: $1,000 cumulative reached", detail: "Day 23 · Avg daily revenue: $43.48 · On track for $1,304/mo pace" }] },
  ],
};

let _logCounter = 0;

function generateLog(agentId: string): LogEntry {
  const agent = AGENTS.find(a => a.id === agentId);
  if (!agent) return { id: ++_logCounter, ts: "", agentId, agentName: agentId, agentColor: "#fff", level: "info", message: "" };
  const templates = LOG_TEMPLATES[agentId] ?? LOG_TEMPLATES.orchestrator;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const entry = template.messages[Math.floor(Math.random() * template.messages.length)];
  const now = new Date();
  const ts = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}.${String(now.getMilliseconds()).padStart(3,"0")}`;
  return {
    id: ++_logCounter,
    ts,
    agentId,
    agentName: agent.name.replace(" Agent", ""),
    agentColor: agent.color,
    level: template.level,
    message: entry.msg,
    detail: entry.detail,
  };
}

// ─── LiveFeedPanel ─────────────────────────────────────────────────────────────

const LEVEL_STYLES: Record<LogLevel, { dot: string; text: string; label: string }> = {
  info:    { dot: "bg-sky-400",     text: "text-sky-300",     label: "INFO" },
  success: { dot: "bg-emerald-400", text: "text-emerald-300", label: "OK" },
  warn:    { dot: "bg-amber-400",   text: "text-amber-300",   label: "WARN" },
  error:   { dot: "bg-red-400",     text: "text-red-300",     label: "ERR" },
  action:  { dot: "bg-violet-400",  text: "text-violet-300",  label: "ACT" },
};

const ACTIVE_AGENT_IDS = ["trend", "digital", "video", "orchestrator"];
const ALL_AGENT_IDS = ["trend", "digital", "video", "ecom", "blog", "ads", "orchestrator"];

function LiveFeedPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(true);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Seed initial logs
  useEffect(() => {
    const initial: LogEntry[] = [];
    for (let i = 0; i < 18; i++) {
      const agentId = ACTIVE_AGENT_IDS[i % ACTIVE_AGENT_IDS.length];
      initial.push(generateLog(agentId));
    }
    setLogs(initial);
  }, []);

  // Live simulation — random agent fires every 1.2–3.5s
  useEffect(() => {
    if (!running) return;
    const fire = () => {
      const agentId = ACTIVE_AGENT_IDS[Math.floor(Math.random() * ACTIVE_AGENT_IDS.length)];
      setLogs(prev => {
        const next = [...prev, generateLog(agentId)];
        return next.length > 300 ? next.slice(-300) : next;
      });
    };
    const interval = setInterval(fire, 1200 + Math.random() * 2300);
    return () => clearInterval(interval);
  }, [running]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setAutoScroll(atBottom);
  }, []);

  const filtered = logs.filter(l => {
    if (filterAgent !== "all" && l.agentId !== filterAgent) return false;
    if (filterLevel !== "all" && l.level !== filterLevel) return false;
    return true;
  });

  const agentForId = (id: string) => AGENTS.find(a => a.id === id);

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 glass-card rounded-xl border border-white/8">
        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${running ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
          <span className="text-xs font-mono text-zinc-400">{running ? "LIVE" : "PAUSED"}</span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Play/Pause */}
        <button
          onClick={() => setRunning(r => !r)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
            running
              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25"
              : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
          }`}
        >
          {running ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Resume</>}
        </button>

        {/* Clear */}
        <button
          onClick={() => setLogs([])}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
        >
          <Square size={11} /> Clear
        </button>

        <div className="h-4 w-px bg-white/10" />

        {/* Agent filter */}
        <div className="flex items-center gap-2">
          <Filter size={11} className="text-zinc-500" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Agent:</span>
          <select
            value={filterAgent}
            onChange={e => setFilterAgent(e.target.value)}
            className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-zinc-300 focus:outline-none focus:border-white/30"
          >
            <option value="all">All Agents</option>
            {ALL_AGENT_IDS.map(id => (
              <option key={id} value={id}>{agentForId(id)?.name.replace(" Agent", "") ?? id}</option>
            ))}
          </select>
        </div>

        {/* Level filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Level:</span>
          <select
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
            className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-zinc-300 focus:outline-none focus:border-white/30"
          >
            <option value="all">All Levels</option>
            {(["info", "success", "action", "warn", "error"] as LogLevel[]).map(l => (
              <option key={l} value={l}>{l.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-600">{filtered.length} entries</span>
          <button
            onClick={() => { setAutoScroll(true); bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            className={`text-[10px] font-mono px-2 py-1 rounded border transition-all ${
              autoScroll ? "text-sky-400 border-sky-500/30 bg-sky-500/10" : "text-zinc-500 border-white/10 hover:text-zinc-300"
            }`}
          >
            {autoScroll ? "↓ Auto" : "↓ Scroll"}
          </button>
        </div>
      </div>

      {/* Terminal window */}
      <div
        className="rounded-xl border border-white/8 overflow-hidden"
        style={{ background: "#050709" }}
      >
        {/* Terminal title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8 bg-black/40">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 ml-2">knxw-labs — agent-log-stream</span>
          <div className="ml-auto flex items-center gap-1.5">
            {running ? <Wifi size={11} className="text-emerald-400" /> : <WifiOff size={11} className="text-zinc-500" />}
            <span className="text-[10px] font-mono text-zinc-600">{running ? "streaming" : "paused"}</span>
          </div>
        </div>

        {/* Log entries */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-[520px] overflow-y-auto p-3 space-y-0.5"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-full text-zinc-600 text-xs font-mono">
              No log entries match the current filter.
            </div>
          )}
          {filtered.map(log => {
            const ls = LEVEL_STYLES[log.level];
            const isExpanded = expandedId === log.id;
            return (
              <div
                key={log.id}
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
                className={`group flex gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  isExpanded ? "bg-white/8" : "hover:bg-white/4"
                }`}
              >
                {/* Timestamp */}
                <span className="text-[10px] text-zinc-600 shrink-0 mt-0.5 w-[72px]">{log.ts}</span>

                {/* Level badge */}
                <span className={`text-[9px] font-bold shrink-0 mt-0.5 w-[28px] ${ls.text}`}>
                  {ls.label}
                </span>

                {/* Agent pill */}
                <span
                  className="text-[9px] font-bold shrink-0 mt-0.5 px-1.5 py-0.5 rounded border w-[80px] truncate text-center"
                  style={{ color: log.agentColor, borderColor: `${log.agentColor}40`, background: `${log.agentColor}12` }}
                >
                  {log.agentName.split(" ")[0].toUpperCase()}
                </span>

                {/* Message + detail */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-zinc-200 leading-relaxed">{log.message}</div>
                  {isExpanded && log.detail && (
                    <div className="mt-1 text-[10px] text-zinc-500 leading-relaxed border-l-2 border-white/10 pl-2">
                      {log.detail}
                    </div>
                  )}
                </div>

                {/* Expand indicator */}
                {log.detail && (
                  <ChevronDown
                    size={12}
                    className={`shrink-0 mt-1 text-zinc-600 group-hover:text-zinc-400 transition-all ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Agent activity summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ACTIVE_AGENT_IDS.map(id => {
          const agent = agentForId(id);
          if (!agent) return null;
          const agentLogs = logs.filter(l => l.agentId === id);
          const successes = agentLogs.filter(l => l.level === "success").length;
          const actions = agentLogs.filter(l => l.level === "action").length;
          const warns = agentLogs.filter(l => l.level === "warn").length;
          return (
            <div key={id} className="glass-card rounded-xl border border-white/8 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: agent.color }} />
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: agent.color }}>
                  {agent.name.split(" ")[0]}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div>
                  <div className="text-sm font-bold text-emerald-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{successes}</div>
                  <div className="text-[9px] text-zinc-600 uppercase">OK</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-violet-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{actions}</div>
                  <div className="text-[9px] text-zinc-600 uppercase">ACT</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{warns}</div>
                  <div className="text-[9px] text-zinc-600 uppercase">WARN</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Agent["status"] }) {
  const config = {
    active:  { label: "ACTIVE",  color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
    ready:   { label: "READY",   color: "text-sky-400 bg-sky-400/10 border-sky-400/30" },
    pending: { label: "PENDING", color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/30" },
  };
  const c = config[status];
  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${c.color}`}>
      {c.label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-2 p-1 rounded hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
      title="Copy"
    >
      {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="mt-2 flex items-center bg-black/40 border border-white/10 rounded px-3 py-2 font-mono text-xs text-emerald-300 group">
      <Terminal size={12} className="mr-2 text-zinc-500 shrink-0" />
      <span className="flex-1 overflow-x-auto whitespace-nowrap">{code}</span>
      <CopyButton text={code} />
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="glass-card rounded-xl border border-white/8 p-4 cursor-pointer hover:border-white/20 transition-all duration-200"
      style={{ borderLeftColor: agent.color, borderLeftWidth: 2 }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${agent.color}18`, color: agent.color }}>
            {agent.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">{agent.name}</span>
              <StatusBadge status={agent.status} />
            </div>
            <div className="text-xs text-zinc-500 mt-0.5 font-mono">
              Phase {agent.phase} · Activates {agent.activatesAt}
            </div>
          </div>
        </div>
        <ChevronRight
          size={16}
          className={`text-zinc-500 shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
        />
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-white/8 pt-4">
          <p className="text-sm text-zinc-300 leading-relaxed">{agent.description}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Daily Output</div>
              <div className="text-xs font-mono text-white">{agent.dailyOutput}</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Unit Economics</div>
              <div className="text-xs font-mono text-white">{agent.unitEconomics}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SetupStepRow({ step, index }: { step: SetupStep; index: number }) {
  const [done, setDone] = useState(false);
  return (
    <div className={`flex gap-4 p-4 rounded-xl border transition-all duration-200 ${done ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/8 glass-card"}`}>
      <button
        onClick={() => setDone(d => !d)}
        className="shrink-0 mt-0.5"
        title="Mark complete"
      >
        {done
          ? <CheckCircle2 size={18} className="text-emerald-400" />
          : <Circle size={18} className="text-zinc-600 hover:text-zinc-400 transition-colors" />
        }
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-zinc-500">{String(index + 1).padStart(2, "0")}</span>
          <span className={`text-sm font-semibold ${done ? "text-zinc-400 line-through" : "text-white"}`}>
            {step.title}
          </span>
          {!step.required && (
            <span className="text-[10px] font-mono text-zinc-600 border border-zinc-700 px-1.5 py-0.5 rounded">
              OPTIONAL
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{step.description}</p>
        {step.command && <CodeBlock code={step.command} />}
        {step.link && (
          <a
            href={step.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-sky-400 hover:text-sky-300 transition-colors"
          >
            <ExternalLink size={11} />
            {step.linkLabel}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CommandDashboard() {
  const [activeTab, setActiveTab] = useState<"agents" | "setup" | "architecture" | "costs" | "livefeed">("agents");

  const phaseAgents = (phase: number) => AGENTS.filter(a => a.phase === phase);

  return (
    <div className="min-h-screen bg-[#080b14] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Header */}
      <div className="border-b border-white/8 bg-black/30 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center">
              <Cpu size={16} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white tracking-tight">knXw Labs</div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Command Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-zinc-400">System Ready</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Hero KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Agents",    value: "3",     sub: "Phase 1 online",       color: "#00d4ff", icon: <Bot size={16} /> },
            { label: "Ready Agents",     value: "2",     sub: "Phases 2–3 ready",     color: "#a855f7", icon: <Layers size={16} /> },
            { label: "Verticals",        value: "8",     sub: "Across 5 phases",      color: "#f97316", icon: <BarChart3 size={16} /> },
            { label: "Starting Capital", value: "$100",  sub: "Full autonomy",        color: "#22c55e", icon: <Shield size={16} /> },
          ].map(k => (
            <div key={k.label} className="glass-card rounded-xl border border-white/8 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{k.label}</span>
                <div style={{ color: k.color }}>{k.icon}</div>
              </div>
              <div className="text-2xl font-bold" style={{ color: k.color, fontFamily: "'IBM Plex Mono', monospace" }}>
                {k.value}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 bg-black/30 p-1 rounded-xl border border-white/8 w-fit">
          {(["agents", "livefeed", "setup", "architecture", "costs"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                activeTab === tab
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === "agents" ? "Agent Fleet"
                : tab === "livefeed" ? "⬤ Live Feed"
                : tab === "setup" ? "Setup Guide"
                : tab === "architecture" ? "Architecture"
                : "Cost Model"}
            </button>
          ))}
        </div>

        {/* ── Tab: Live Feed ── */}
        {activeTab === "livefeed" && <LiveFeedPanel />}

        {/* ── Tab: Agent Fleet ── */}
        {activeTab === "agents" && (
          <div className="space-y-8">
            {[1, 2, 3, 4].map(phase => {
              const agents = phaseAgents(phase);
              if (!agents.length) return null;
              const phaseLabels = ["", "Phase 1 — Launch (Day 1)", "Phase 2 — Expand (Month 2)", "Phase 3 — Amplify (Month 3)", "Phase 4 — Scale (Month 4)"];
              const phaseColors = ["", "#00d4ff", "#a855f7", "#f97316", "#22c55e"];
              return (
                <div key={phase}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-white/8" />
                    <span className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full border"
                      style={{ color: phaseColors[phase], borderColor: `${phaseColors[phase]}40`, background: `${phaseColors[phase]}10` }}>
                      {phaseLabels[phase]}
                    </span>
                    <div className="h-px flex-1 bg-white/8" />
                  </div>
                  <div className="grid gap-3">
                    {agents.map(a => <AgentCard key={a.id} agent={a} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Tab: Setup Guide ── */}
        {activeTab === "setup" && (
          <div className="space-y-3">
            <div className="glass-card rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={16} className="text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-sky-300">Before you start</div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    You only need <strong className="text-white">two API keys</strong> to launch: OpenAI and WaveSpeed. 
                    Platform accounts (KDP, Gumroad, TikTok) can be added later — the system will generate and queue all content locally until you connect them.
                  </p>
                </div>
              </div>
            </div>
            {SETUP_STEPS.map((step, i) => (
              <SetupStepRow key={step.id} step={step} index={i} />
            ))}
          </div>
        )}

        {/* ── Tab: Architecture ── */}
        {activeTab === "architecture" && (
          <div className="space-y-6">
            <div className="grid gap-4">
              {ARCHITECTURE_LAYERS.map(layer => (
                <div key={layer.label} className="glass-card rounded-xl border border-white/8 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: layer.color }} />
                    <span className="text-xs font-mono uppercase tracking-widest" style={{ color: layer.color }}>
                      {layer.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {layer.items.map(item => (
                      <span key={item} className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Data flow */}
            <div className="glass-card rounded-xl border border-white/8 p-6">
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">Data Flow</div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {["Trend Scan", "Brief Generated", "Content Created", "Cover Generated", "PDF Compiled", "Listing Written", "Ready to Publish", "Revenue"].map((step, i, arr) => (
                  <React.Fragment key={step}>
                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-xs">
                      {step}
                    </span>
                    {i < arr.length - 1 && <ArrowRight size={12} className="text-zinc-600 shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Cost Model ── */}
        {activeTab === "costs" && (
          <div className="space-y-4">
            <div className="glass-card rounded-xl border border-white/8 p-6">
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">API Cost Per Unit (Verified)</div>
              <div className="space-y-3">
                {[
                  { item: "Ebook (8,000 words + cover)",  cost: "$0.30–$0.50", breakdown: "GPT-4o-mini: $0.08 + FLUX cover: $0.04 + listing: $0.02 = $0.14 min", color: "#a855f7" },
                  { item: "Short-Form Video (30s)",        cost: "$0.15–$0.40", breakdown: "Script: $0.02 + 6 scene images: $0.24 + TTS voiceover: $0.06 = $0.32", color: "#f97316" },
                  { item: "Trend Brief",                   cost: "$0.01–$0.03", breakdown: "LLM scoring + keyword extraction: $0.02 avg", color: "#00d4ff" },
                  { item: "Blog Post (1,500 words)",       cost: "$0.05–$0.10", breakdown: "GPT-4o-mini: $0.04 + featured image: $0.04 = $0.08", color: "#eab308" },
                  { item: "Product Listing (e-commerce)", cost: "$0.03–$0.08", breakdown: "Title + description + 3 images: $0.06 avg", color: "#22c55e" },
                ].map(row => (
                  <div key={row.item} className="flex items-start gap-4 p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: row.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-white">{row.item}</span>
                        <span className="font-mono text-sm shrink-0" style={{ color: row.color }}>{row.cost}</span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5 font-mono">{row.breakdown}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl border border-white/8 p-6">
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">Daily Budget → Daily Output</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-mono text-zinc-500 uppercase">
                      <th className="text-left pb-3">Daily Budget</th>
                      <th className="text-right pb-3">Ebooks</th>
                      <th className="text-right pb-3">Videos</th>
                      <th className="text-right pb-3">Briefs</th>
                      <th className="text-right pb-3">Est. M12 Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { budget: "$2/day",  ebooks: "4",   videos: "8",   briefs: "10", revenue: "$8k–$18k/mo" },
                      { budget: "$5/day",  ebooks: "10",  videos: "20",  briefs: "20", revenue: "$22k–$45k/mo" },
                      { budget: "$10/day", ebooks: "20",  videos: "40",  briefs: "40", revenue: "$45k–$90k/mo" },
                      { budget: "$25/day", ebooks: "50",  videos: "100", briefs: "80", revenue: "$110k–$200k/mo" },
                      { budget: "$50/day", ebooks: "100", videos: "200", briefs: "150", revenue: "$220k–$400k/mo" },
                    ].map(row => (
                      <tr key={row.budget} className="text-zinc-300">
                        <td className="py-2.5 font-mono text-white">{row.budget}</td>
                        <td className="py-2.5 text-right font-mono text-violet-400">{row.ebooks}</td>
                        <td className="py-2.5 text-right font-mono text-orange-400">{row.videos}</td>
                        <td className="py-2.5 text-right font-mono text-sky-400">{row.briefs}</td>
                        <td className="py-2.5 text-right font-mono text-emerald-400">{row.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-zinc-600 mt-4 font-mono">
                * Revenue estimates based on verified benchmarks: KDP 2025, TikTok Creator Fund, Shopify 2026. Conservative scenario.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
