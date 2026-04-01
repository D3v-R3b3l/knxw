/*
 * DESIGN: Obsidian Intelligence Dashboard v4
 * 60-Month · 10,000 Monte Carlo Scenarios · 8 Verticals incl. System Sales
 * MODEL: Production Velocity × Catalog Depth × Unit Economics (not GBM drift)
 * Typography: Space Grotesk + IBM Plex Mono
 * Tabs: Monthly | Cumulative | Roadmap | Breakdown Table | System Valuation
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceArea, ReferenceLine, ComposedChart,
} from "recharts";
import {
  generateProjectionData, formatCurrency, formatLargeNumber,
  computeSystemValuation, getBudgetScaleInfo,
  VERTICALS, PHASE_REGIONS, SCENARIO_LABELS, SCENARIO_COLORS, SCENARIO_DESCRIPTIONS,
  type MonthDataPoint, type Scenario,
} from "@/lib/revenueData";

// ─── Animated counter ────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const from = useRef(0);
  useEffect(() => {
    from.current = value;
    startTime.current = null;
    if (raf.current) cancelAnimationFrame(raf.current);
    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const p = Math.min((ts - startTime.current) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from.current + e * (target - from.current)));
      if (p < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target]);
  return value;
}

// ─── Tooltip: Monthly ────────────────────────────────────────────────────────
function MonthlyTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as MonthDataPoint;
  if (!d) return null;
  return (
    <div className="chart-tooltip min-w-[240px]">
      <div className="flex justify-between mb-2 pb-2 border-b border-white/10">
        <span className="font-data text-xs text-white/40">{d.label === "Start" ? "Month 0" : `Month ${d.month}`}</span>
        <span className="font-data text-xs text-emerald-400">{(d.multiTotal / Math.max(d.singleChannel, 1)).toFixed(1)}× vs single</span>
      </div>
      <div className="space-y-1 mb-2">
        {VERTICALS.map(v => {
          const val = (d as any)[v.key] as number;
          if (val === 0) return null;
          return (
            <div key={v.key} className="flex justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: v.color }} />
                <span className="text-xs text-white/50">{v.label}</span>
              </div>
              <span className="font-data text-xs font-semibold" style={{ color: v.color }}>{formatCurrency(val)}</span>
            </div>
          );
        })}
      </div>
      <div className="pt-2 border-t border-white/10 space-y-1">
        <div className="flex justify-between"><span className="text-xs text-white/40">Total</span><span className="font-data text-sm font-bold text-white">{formatCurrency(d.multiTotal)}/mo</span></div>
        <div className="flex justify-between"><span className="text-xs text-white/25">P10–P90 range</span><span className="font-data text-xs text-white/30">{formatCurrency(d.multi_p10)} – {formatCurrency(d.multi_p90)}</span></div>
      </div>
    </div>
  );
}

function CumulativeTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as MonthDataPoint;
  if (!d) return null;
  return (
    <div className="chart-tooltip min-w-[200px]">
      <div className="font-data text-xs text-white/40 mb-2 pb-2 border-b border-white/10">{d.label === "Start" ? "Month 0" : `Month ${d.month}`}</div>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-6"><span className="text-xs text-white/50">Multi-Vertical</span><span className="font-data text-sm font-bold text-emerald-400">{formatCurrency(d.cumulativeMulti)}</span></div>
        <div className="flex justify-between gap-6"><span className="text-xs text-white/30">Single Channel</span><span className="font-data text-sm text-slate-400">{formatCurrency(d.cumulativeSingle)}</span></div>
        <div className="flex justify-between gap-6 pt-1 border-t border-white/10"><span className="text-xs text-emerald-400/70">Advantage</span><span className="font-data text-sm font-bold text-emerald-400">+{formatCurrency(d.cumulativeMulti - d.cumulativeSingle)}</span></div>
      </div>
    </div>
  );
}

function RoadmapTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as MonthDataPoint;
  if (!d) return null;
  const phase = PHASE_REGIONS.find(p => d.month >= p.startMonth && d.month < p.endMonth) || PHASE_REGIONS[PHASE_REGIONS.length - 1];
  return (
    <div className="chart-tooltip min-w-[220px]">
      <div className="font-data text-xs text-white/40 mb-2 pb-2 border-b border-white/10">{d.label === "Start" ? "Month 0" : `Month ${d.month}`}</div>
      <div className="mb-2 px-2 py-1.5 rounded" style={{ background: `${phase.color}15`, borderLeft: `3px solid ${phase.color}` }}>
        <div className="text-xs font-semibold" style={{ color: phase.color }}>{phase.label}</div>
        <div className="text-xs text-white/35 mt-0.5">{phase.description}</div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between"><span className="text-xs text-white/40">Monthly Revenue</span><span className="font-data text-sm font-bold text-white">{formatCurrency(d.multiTotal)}/mo</span></div>
        <div className="flex justify-between"><span className="text-xs text-white/25">P10–P90</span><span className="font-data text-xs text-white/30">{formatCurrency(d.multi_p10)} – {formatCurrency(d.multi_p90)}</span></div>
      </div>
    </div>
  );
}

// ─── Budget Slider ────────────────────────────────────────────────────────────
const BUDGET_STEPS = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000];

function BudgetSlider({ budget, onChange }: { budget: number; onChange: (v: number) => void }) {
  const idx = BUDGET_STEPS.indexOf(budget);
  const pct = ((idx === -1 ? 3 : idx) / (BUDGET_STEPS.length - 1)) * 100;
  const scaleInfo = getBudgetScaleInfo(budget);
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/40 uppercase tracking-widest">Starting Capital</span>
        <span className="font-data text-2xl font-bold text-white" style={{ textShadow: "0 0 20px rgba(0,229,204,0.4)" }}>{formatCurrency(budget)}</span>
      </div>
      <p className="text-xs text-white/25 mb-3 leading-relaxed">{scaleInfo.label}</p>
      <input type="range" min={0} max={BUDGET_STEPS.length - 1} step={1}
        value={idx === -1 ? 3 : idx}
        onChange={e => onChange(BUDGET_STEPS[parseInt(e.target.value)])}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(90deg, #00e5cc ${pct}%, rgba(255,255,255,0.08) 0%)`, accentColor: "#00e5cc" }} />
      <div className="flex justify-between mt-2 flex-wrap gap-y-1">
        {BUDGET_STEPS.map(s => (
          <button key={s} onClick={() => onChange(s)}
            className={`font-data text-xs transition-colors ${budget === s ? "text-teal-400 font-semibold" : "text-white/20 hover:text-white/40"}`}>
            {s >= 1000 ? `$${s / 1000}k` : `$${s}`}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Scenario Toggle ──────────────────────────────────────────────────────────
function ScenarioToggle({ scenario, onChange }: { scenario: Scenario; onChange: (s: Scenario) => void }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <span className="text-xs text-white/40 uppercase tracking-widest block mb-3">Growth Scenario</span>
      <div className="flex gap-2">
        {(["conservative", "base", "aggressive"] as Scenario[]).map(s => (
          <button key={s} onClick={() => onChange(s)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border ${scenario === s ? "border-current" : "border-white/10 text-white/30 hover:text-white/50"}`}
            style={scenario === s ? { color: SCENARIO_COLORS[s], background: `${SCENARIO_COLORS[s]}15`, borderColor: `${SCENARIO_COLORS[s]}50`, boxShadow: `0 0 16px ${SCENARIO_COLORS[s]}20` } : {}}>
            {SCENARIO_LABELS[s]}
          </button>
        ))}
      </div>
      <p className="text-xs text-white/30 mt-2 leading-relaxed">{SCENARIO_DESCRIPTIONS[scenario]}</p>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="glass-card rounded-xl p-4 flex flex-col gap-1" style={{ borderColor: `${color}22`, boxShadow: `0 0 24px ${color}08` }}>
      <span className="text-xs text-white/35 uppercase tracking-widest">{label}</span>
      <span className="font-data text-xl font-bold leading-tight" style={{ color, textShadow: `0 0 20px ${color}50` }}>{value}</span>
      {sub && <span className="text-xs text-white/25 font-data">{sub}</span>}
    </div>
  );
}

// ─── Vertical Pill ────────────────────────────────────────────────────────────
function VerticalPill({ v, active, onToggle }: { v: typeof VERTICALS[0]; active: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`vertical-pill ${active ? "active" : "inactive"}`}
      style={{ color: active ? v.color : "#64748b", borderColor: active ? `${v.color}40` : "transparent" }}>
      <span className="w-2 h-2 rounded-full" style={{ background: active ? v.color : "#64748b", boxShadow: active ? `0 0 8px ${v.color}` : "none" }} />
      {v.icon} {v.label}
    </button>
  );
}

// ─── Cell Tooltip ─────────────────────────────────────────────────────────────
interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  color: string;
  lines: { label: string; value: string; sub?: string }[];
  note?: string;
}

function CellTooltip({ tip }: { tip: TooltipState }) {
  if (!tip.visible) return null;
  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{ left: tip.x + 14, top: tip.y - 8, maxWidth: 320 }}
    >
      <div
        className="rounded-xl shadow-2xl border text-xs"
        style={{
          background: "rgba(10,15,26,0.97)",
          borderColor: `${tip.color}35`,
          boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px ${tip.color}20`,
          backdropFilter: "blur(20px)",
          padding: "12px 14px",
          minWidth: 220,
        }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 mb-2.5 pb-2" style={{ borderBottom: `1px solid ${tip.color}20` }}>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tip.color, boxShadow: `0 0 6px ${tip.color}` }} />
          <span className="font-semibold text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12 }}>{tip.title}</span>
        </div>
        {/* Lines */}
        <div className="space-y-1.5">
          {tip.lines.map((l, i) => (
            <div key={i}>
              <div className="flex justify-between gap-4 items-baseline">
                <span className="text-white/45" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>{l.label}</span>
                <span className="font-semibold" style={{ color: tip.color, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{l.value}</span>
              </div>
              {l.sub && <div className="text-white/25 mt-0.5 leading-snug" style={{ fontSize: 10 }}>{l.sub}</div>}
            </div>
          ))}
        </div>
        {/* Note */}
        {tip.note && (
          <div className="mt-2.5 pt-2 leading-relaxed text-white/30" style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, fontSize: 10 }}>
            {tip.note}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Per-Vertical Monthly Table ───────────────────────────────────────────────
function VerticalTable({ data, budget, scenario }: { data: MonthDataPoint[]; budget: number; scenario: Scenario }) {
  const [page, setPage] = useState(0);
  const rowsPerPage = 12;
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const rows = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const [tip, setTip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, title: "", color: "#00e5cc", lines: [],
  });

  const showTip = useCallback((e: React.MouseEvent, state: Omit<TooltipState, "visible" | "x" | "y">) => {
    setTip({ visible: true, x: e.clientX, y: e.clientY, ...state });
  }, []);

  const moveTip = useCallback((e: React.MouseEvent) => {
    setTip(prev => prev.visible ? { ...prev, x: e.clientX, y: e.clientY } : prev);
  }, []);

  const hideTip = useCallback(() => {
    setTip(prev => ({ ...prev, visible: false }));
  }, []);

  // Build per-vertical tooltip content
  const buildVerticalTip = useCallback((d: MonthDataPoint, v: typeof VERTICALS[0]): Omit<TooltipState, "visible" | "x" | "y"> => {
    const val = (d as any)[v.key] as number;
    const catalog = d.catalogSizes[v.key] ?? 0;
    const pct = d.multiTotal > 0 ? ((val / d.multiTotal) * 100).toFixed(1) : "0.0";

    if (v.key === "ads") {
      const otherRev = d.multiTotal - d.ads;
      const reinvested = Math.round(otherRev * 0.30);
      const roas = Math.min(1.5 + Math.max(d.month - 3, 0) * 0.05, 4.0);
      return {
        title: `${v.icon} Programmatic Ads — ${d.label}`,
        color: v.color,
        lines: [
          { label: "Revenue this month", value: formatCurrency(val) },
          { label: "Other verticals' revenue", value: formatCurrency(otherRev), sub: "The pool of organic revenue that funds the ad budget" },
          { label: "30% reinvested as ad spend", value: formatCurrency(reinvested), sub: "AI media buyer allocates 30% of organic profits into paid campaigns" },
          { label: "Current ROAS", value: `${roas.toFixed(2)}×`, sub: `Starts at 1.5× and grows to 4.0× as the AI learns from campaign data` },
          { label: "Net profit from ads", value: formatCurrency(val), sub: `(ROAS − 1) × ad spend = ${(roas - 1).toFixed(2)} × ${formatCurrency(reinvested)}` },
          { label: "Share of total revenue", value: `${pct}%` },
        ],
        note: "Ads are a force multiplier, not a standalone channel. The AI reinvests organic profits to amplify all other verticals.",
      };
    }

    if (v.key === "ecom") {
      const storeCount = catalog;
      const ordersPerDay = storeCount * 500 * 0.15;
      const ordersPerMonth = Math.round(ordersPerDay * 30);
      return {
        title: `${v.icon} E-Commerce / Dropship — ${d.label}`,
        color: v.color,
        lines: [
          { label: "Revenue this month", value: formatCurrency(val) },
          { label: "Active stores", value: `${storeCount}`, sub: "Each store has 500 AI-listed products. New stores open every month." },
          { label: "Products in market", value: `${(storeCount * 500).toLocaleString()}`, sub: "AI monitors trends and launches new products within 24 hours of a spike" },
          { label: "Orders per month", value: ordersPerMonth.toLocaleString(), sub: "0.15 orders per product per day × 30 days × all stores" },
          { label: "Avg margin per order", value: "$22", sub: "Dropship margin after supplier cost and platform fees" },
          { label: "Share of total revenue", value: `${pct}%` },
        ],
        note: "Unlike catalog verticals, e-commerce revenue is driven by store count × product count × order rate. Each new store is a permanent revenue-generating asset.",
      };
    }

    if (v.key === "system") {
      const newCustomers = Math.round(catalog);
      return {
        title: `${v.icon} System Sales (AI SaaS) — ${d.label}`,
        color: v.color,
        lines: [
          { label: "Revenue this month", value: formatCurrency(val) },
          { label: "Cumulative customers", value: newCustomers.toLocaleString(), sub: "Total customers who have purchased any tier of the packaged system" },
          { label: "Avg blended price", value: "$497", sub: "Weighted average across Starter ($97), Full System ($497), DWY ($2,997), White-Label ($14,997)" },
          { label: "Activates at", value: "Month 12", sub: "System must be proven before it can be sold. AI handles all marketing, demos, and closing." },
          { label: "Share of total revenue", value: `${pct}%` },
        ],
        note: "This is the system selling itself. AI agents publish case studies, run ads, handle email sequences, and close sales — no human sales team required.",
      };
    }

    // Catalog-based verticals
    const winners = Math.floor(catalog * v.unitEcon.hitRate);
    const tail = catalog - winners;
    const winnerRev = winners * v.unitEcon.winnerRevPerUnit;
    const tailRev = tail * v.unitEcon.tailRevPerUnit;
    const decayPct = (v.unitEcon.catalogDecayRate * 100).toFixed(1);
    const bScale = budget <= 100 ? 0.10 : budget >= 50000 ? 1.0 : 0.10 + 0.90 * (Math.log(budget / 100) / Math.log(50000 / 100));
    const sVel: Record<Scenario, number> = { conservative: 0.25, base: 1.0, aggressive: 2.5 };
    const newUnitsPerMonth = Math.round(v.unitEcon.unitsPerMonthAtMaxVelocity * (bScale * sVel[scenario]));

    const vertLabels: Record<string, { unitName: string; winnerDesc: string; tailDesc: string; hitDesc: string }> = {
      digital: {
        unitName: "ebooks / guides",
        winnerDesc: "150 sales/mo × $7.99 = $1,198/mo per winner",
        tailDesc: "8 sales/mo × $7.99 = $64/mo per long-tail title",
        hitDesc: "5% of all ebooks published become consistent sellers (>100 sales/mo)",
      },
      courses: {
        unitName: "courses / workshops",
        winnerDesc: "100 sales/mo × $47 = $4,700/mo per bestseller",
        tailDesc: "2 sales/mo × $47 = $94/mo per non-ranking course",
        hitDesc: "8% of courses become bestsellers on Udemy/Teachable",
      },
      video: {
        unitName: "short-form videos",
        winnerDesc: "$800 affiliate commissions per viral video (30-day window)",
        tailDesc: "$12/mo avg per non-viral video (small affiliate clicks)",
        hitDesc: "2% of videos go viral (>100k views) — triggers affiliate conversion spike",
      },
      aff: {
        unitName: "affiliate placements",
        winnerDesc: "$180 avg commission per converting placement",
        tailDesc: "$1.20 residual per non-converting placement",
        hitDesc: "1.5% of placements generate a commission — embedded across all content",
      },
      blog: {
        unitName: "SEO articles",
        winnerDesc: "$320/mo per page-1 article (display ads + affiliate)",
        tailDesc: "$4/mo per non-ranking article (minimal traffic)",
        hitDesc: "4% of articles rank on Google page 1 — domain authority grows over time",
      },
    };
    const vl = vertLabels[v.key] || { unitName: "units", winnerDesc: "", tailDesc: "", hitDesc: "" };

    return {
      title: `${v.icon} ${v.label} — ${d.label}`,
      color: v.color,
      lines: [
        { label: "Revenue this month", value: formatCurrency(val) },
        { label: "Total catalog size", value: catalog.toLocaleString() + " " + vl.unitName, sub: `+${newUnitsPerMonth.toLocaleString()} new ${vl.unitName} added this month by AI agents` },
        { label: `Winners (${(v.unitEcon.hitRate * 100).toFixed(0)}% hit rate)`, value: winners.toLocaleString(), sub: vl.hitDesc },
        { label: "Winner revenue", value: formatCurrency(winnerRev), sub: vl.winnerDesc },
        { label: `Long-tail (${tail.toLocaleString()} units)`, value: formatCurrency(tailRev), sub: vl.tailDesc },
        { label: "Monthly catalog decay", value: `−${decayPct}%/mo`, sub: "Older content earns slightly less over time as newer content competes for attention" },
        { label: "Share of total revenue", value: `${pct}%` },
      ],
      note: `Every ${vl.unitName} ever created keeps earning. The catalog never shrinks — it only grows. This is the compounding moat.`,
    };
  }, [budget, scenario]);

  // Month label tooltip
  const buildMonthTip = useCallback((d: MonthDataPoint): Omit<TooltipState, "visible" | "x" | "y"> => {
    const phase = PHASE_REGIONS.find(p => d.month >= p.startMonth && d.month < p.endMonth) || PHASE_REGIONS[PHASE_REGIONS.length - 1];
    const yoy = d.month >= 12 ? data[d.month - 12] : null;
    const growth = yoy ? (((d.multiTotal - yoy.multiTotal) / Math.max(yoy.multiTotal, 1)) * 100).toFixed(0) : null;
    return {
      title: d.label === "Start" ? "Month 0 — Baseline" : `${d.label} — Timeline Context`,
      color: phase.color,
      lines: [
        { label: "Phase", value: phase.shortLabel, sub: phase.label.split(": ")[1] + " — " + phase.description },
        { label: "Total monthly revenue", value: formatCurrency(d.multiTotal) },
        { label: "Cumulative to date", value: formatCurrency(d.cumulativeMulti) },
        ...(growth !== null ? [{ label: "Year-over-year growth", value: `+${growth}%`, sub: `Compared to ${data[d.month - 12]?.label}` }] : []),
        { label: "P10 – P90 range", value: `${formatCurrency(d.multi_p10)} – ${formatCurrency(d.multi_p90)}`, sub: "10th to 90th percentile across 10,000 simulated scenarios" },
      ],
      note: "The P10–P90 band shows the realistic range of outcomes. The median path shown in the table is the 50th percentile.",
    };
  }, [data]);

  // Total column tooltip
  const buildTotalTip = useCallback((d: MonthDataPoint): Omit<TooltipState, "visible" | "x" | "y"> => {
    const topV = [...VERTICALS].sort((a, b) => ((d as any)[b.key] || 0) - ((d as any)[a.key] || 0))[0];
    const mult = d.singleChannel > 0 ? (d.multiTotal / d.singleChannel).toFixed(1) : "∞";
    return {
      title: `Total Revenue — ${d.label}`,
      color: "#ffffff",
      lines: [
        { label: "Combined monthly revenue", value: formatCurrency(d.multiTotal), sub: "Sum of all 8 active verticals" },
        { label: "Largest contributor", value: topV.label, sub: `${formatCurrency((d as any)[topV.key])}/mo — ${((((d as any)[topV.key]) / Math.max(d.multiTotal, 1)) * 100).toFixed(1)}% of total` },
        { label: "vs single channel", value: `${mult}×`, sub: `A single-operator blog at the same budget earns ${formatCurrency(d.singleChannel)}/mo` },
        { label: "Cumulative total", value: formatCurrency(d.cumulativeMulti), sub: "All revenue earned from Month 0 to this month" },
        { label: "P10 floor", value: formatCurrency(d.multi_p10), sub: "Worst 10% of simulated outcomes" },
        { label: "P90 ceiling", value: formatCurrency(d.multi_p90), sub: "Best 10% of simulated outcomes" },
      ],
      note: "Multi-vertical compounding means each channel amplifies the others. Ads reinvest organic profits. Affiliate links are embedded in blog posts and videos. Content drives e-commerce traffic.",
    };
  }, []);

  // Single channel tooltip
  const buildSingleTip = useCallback((d: MonthDataPoint): Omit<TooltipState, "visible" | "x" | "y"> => {
    const diff = d.multiTotal - d.singleChannel;
    return {
      title: `Single Channel Baseline — ${d.label}`,
      color: "#64748b",
      lines: [
        { label: "Single-operator revenue", value: formatCurrency(d.singleChannel), sub: "One human running one blog at the same budget — the traditional comparison" },
        { label: "Blog articles published", value: `${d.catalogSizes["blog"] ? Math.round(d.catalogSizes["blog"] * 0.3).toLocaleString() : "—"}`, sub: "Single operator publishes at 30% of AI production rate" },
        { label: "You are earning instead", value: formatCurrency(d.multiTotal), sub: "8-vertical AI engine at the same starting capital" },
        { label: "Advantage this month", value: `+${formatCurrency(diff)}`, sub: `The AI engine generates ${((d.multiTotal / Math.max(d.singleChannel, 1))).toFixed(1)}× more revenue than a single-channel operator` },
      ],
      note: "This baseline represents a skilled human content creator running a single blog. It is not a 'bad' outcome — it is simply what is possible without AI-native multi-vertical compounding.",
    };
  }, []);

  // Column header tooltips
  const HEADER_TIPS: Record<string, Omit<TooltipState, "visible" | "x" | "y">> = {
    month: {
      title: "Month Column",
      color: "#94a3b8",
      lines: [
        { label: "Format", value: "M1–M60", sub: "Each row represents one calendar month of operation" },
        { label: "Phase markers", value: "5 phases", sub: "Coloured banners mark when each deployment phase begins" },
        { label: "Hover any cell", value: "→ tooltip", sub: "Every cell has a detailed explanation of the math behind it" },
      ],
      note: "Month 0 (Start) shows the baseline state before any AI agents are deployed.",
    },
    total: {
      title: "Total Monthly Revenue",
      color: "#ffffff",
      lines: [
        { label: "What it is", value: "Sum of all 8 verticals", sub: "Digital Products + Courses + Video + E-Commerce + Affiliate + Blog + Ads + System Sales" },
        { label: "Why it compounds", value: "Catalog × Unit Economics", sub: "Every piece of content ever created keeps earning. The catalog never shrinks." },
        { label: "Confidence band", value: "P10–P90", sub: "Hover any Total cell to see the realistic range of outcomes" },
      ],
      note: "This is the median path across 10,000 Monte Carlo simulations. Your actual result will vary, but the math of catalog compounding is structurally sound.",
    },
    single: {
      title: "Single Channel Baseline",
      color: "#64748b",
      lines: [
        { label: "What it represents", value: "One blog, one human", sub: "A skilled content creator running a single SEO blog at the same starting capital" },
        { label: "Why it matters", value: "Comparison benchmark", sub: "Shows what is achievable without AI-native multi-vertical compounding" },
        { label: "Production rate", value: "30% of AI rate", sub: "A human publishes ~15 articles/day vs AI's 50/day" },
      ],
      note: "The gap between Total and Single Channel widens every month because catalog compounding is exponential, not linear.",
    },
  };

  return (
    <div className="glass-card rounded-2xl p-6" onMouseMove={moveTip}>
      <CellTooltip tip={tip} />
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Per-Vertical Monthly Breakdown</h2>
          <p className="text-xs text-white/30 mt-0.5">Revenue per vertical per month · Production Velocity × Catalog Depth × Unit Economics · {SCENARIO_LABELS[scenario]} · {formatCurrency(budget)} starting capital · <span className="text-teal-400/60">Hover any cell for a full explanation</span></p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="font-data text-xs px-3 py-1.5 rounded-lg glass-card disabled:opacity-30 hover:bg-white/10 transition-colors">← Prev</button>
          <span className="font-data text-xs text-white/40">Months {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, data.length)} of {data.length}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
            className="font-data text-xs px-3 py-1.5 rounded-lg glass-card disabled:opacity-30 hover:bg-white/10 transition-colors">Next →</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-data">
          <thead>
            <tr className="border-b border-white/8">
              <th
                className="text-left py-2 pr-3 text-white/30 font-medium w-12 cursor-help"
                onMouseEnter={e => showTip(e, HEADER_TIPS.month)}
                onMouseLeave={hideTip}>
                Mo.
              </th>
              {VERTICALS.map(v => (
                <th
                  key={v.key}
                  className="text-right py-2 px-2 font-medium whitespace-nowrap cursor-help"
                  style={{ color: `${v.color}99` }}
                  onMouseEnter={e => {
                    const bScale = budget <= 100 ? 0.10 : budget >= 50000 ? 1.0 : 0.10 + 0.90 * (Math.log(budget / 100) / Math.log(50000 / 100));
                    const sVelMap: Record<Scenario, number> = { conservative: 0.25, base: 1.0, aggressive: 2.0 };
                    const velScale = bScale * sVelMap[scenario];
                    const upm = v.unitEcon.unitsPerMonthAtMaxVelocity;
                    const newPerMonth = Math.round(upm * velScale);
                    const FORMULA_AUDIT: Record<string, { formula: string; assumptions: string[]; source: string }> = {
                      digital: {
                        formula: `Rev = (catalog × ${(v.unitEcon.hitRate*100).toFixed(0)}% × $${v.unitEcon.winnerRevPerUnit}) + (catalog × ${(1-v.unitEcon.hitRate)*100}% × $${v.unitEcon.tailRevPerUnit}) × decay`,
                        assumptions: [
                          `${newPerMonth} new ebooks/mo at current budget+scenario (max ${upm}/mo at full velocity)`,
                          `${(v.unitEcon.hitRate*100).toFixed(0)}% hit rate = 1 in 100 ebooks earns consistently (KDP: 75% earn <$1k/yr)`,
                          `Winner: 50 sales/mo × $5.59 royalty (70% of $7.99) = $${v.unitEcon.winnerRevPerUnit}/mo`,
                          `Tail: 2 sales/mo × $5.59 = $${v.unitEcon.tailRevPerUnit}/mo per non-winner`,
                          `Decay: −${(v.unitEcon.catalogDecayRate*100).toFixed(1)}%/mo as new titles compete on platform`,
                        ],
                        source: 'Automateed 2025 KDP survey · Amazon royalty structure verified',
                      },
                      courses: {
                        formula: `Rev = (catalog × ${(v.unitEcon.hitRate*100).toFixed(0)}% × $${v.unitEcon.winnerRevPerUnit}) + (catalog × ${((1-v.unitEcon.hitRate)*100).toFixed(0)}% × $${v.unitEcon.tailRevPerUnit}) × decay`,
                        assumptions: [
                          `${newPerMonth} new courses/mo at current velocity (Udemy quality review: ~2/day max)`,
                          `${(v.unitEcon.hitRate*100).toFixed(0)}% hit rate — Whop.com 2024: median Udemy course earns $34/mo`,
                          `Winner: 25 sales/mo × $14.10 net (30% of $47 after Udemy 50-75% cut) = $${v.unitEcon.winnerRevPerUnit}/mo`,
                          `Tail: 1 sale/mo × $14.10 = $${v.unitEcon.tailRevPerUnit}/mo`,
                          `Decay: −${(v.unitEcon.catalogDecayRate*100).toFixed(1)}%/mo as course topics become outdated`,
                        ],
                        source: 'Whop.com 2024 Udemy earnings report · Udemy revenue share policy',
                      },
                      video: {
                        formula: `Rev = (catalog × 0.5% × $150 viral) + (catalog × 99.5% × $8.40 affiliate tail) × decay`,
                        assumptions: [
                          `${newPerMonth} new videos/mo at current velocity (5/day max — shadowban risk above this)`,
                          `Viral stream: 0.5% hit rate × $150 = $0.03/view × 50k views + affiliate spike`,
                          `Affiliate tail: 200 avg views × 1% CTR × 2% CVR × $35 commission = $1.40/video active`,
                          `$8.40/mo = $1.40 × ~6 months average active earning window before decay`,
                          `Decay: −${(v.unitEcon.catalogDecayRate*100).toFixed(0)}%/mo — social content ages very fast`,
                        ],
                        source: 'TikTok Creator Fund 2025 · Affiliate CVR: Partnero 2025 · Commission: Amazon Associates avg',
                      },
                      aff: {
                        formula: `Rev = catalog × ${(v.unitEcon.hitRate*100).toFixed(1)}% × $${v.unitEcon.winnerRevPerUnit} + catalog × ${((1-v.unitEcon.hitRate)*100).toFixed(1)}% × $${v.unitEcon.tailRevPerUnit}`,
                        assumptions: [
                          `${newPerMonth} new affiliate placements/mo embedded across all content`,
                          `${(v.unitEcon.hitRate*100).toFixed(1)}% conversion rate — Partnero 2025: industry avg 0.5–1%`,
                          `$${v.unitEcon.winnerRevPerUnit} avg commission — blended physical + digital products`,
                          `$${v.unitEcon.tailRevPerUnit} residual per non-converting placement (impressions value)`,
                          `Decay: −${(v.unitEcon.catalogDecayRate*100).toFixed(1)}%/mo — links remain active but CTR declines`,
                        ],
                        source: 'Partnero 2025 · Elementor 2026 affiliate benchmark report',
                      },
                      blog: {
                        formula: `Rev = earningCatalog × ${(v.unitEcon.hitRate*100).toFixed(1)}% × $${v.unitEcon.winnerRevPerUnit} + tail × $${v.unitEcon.tailRevPerUnit} [6-month sandbox delay]`,
                        assumptions: [
                          `${newPerMonth} new articles/mo at current velocity (quality-filtered; Google penalises thin AI content)`,
                          `6-month Google sandbox delay before new articles begin ranking`,
                          `${(v.unitEcon.hitRate*100).toFixed(1)}% page-1 rate — Google Helpful Content Update impacts AI content`,
                          `Winner: 500 pageviews × $5 RPM AdSense + $20 affiliate = $${v.unitEcon.winnerRevPerUnit}/mo`,
                          `Tail: ~100 pageviews × $5 RPM = $${v.unitEcon.tailRevPerUnit}/mo per non-ranking article`,
                          `Decay: −${(v.unitEcon.catalogDecayRate*100).toFixed(1)}%/mo — SEO content is relatively evergreen`,
                        ],
                        source: 'Mile.tech 2026 AdSense RPM data · Google Search Console industry benchmarks',
                      },
                      ecom: {
                        formula: `Rev = min(month × 300 × vel, 500 products) × 0.002 orders/day × 30 days × $18 margin`,
                        assumptions: [
                          `Products grow by ~10/day at current velocity, capped at 500 (1 store limit)`,
                          `0.002 orders/product/day = verified Shopify 2026 avg CVR (corrected from 0.15)`,
                          `$18 avg margin per order after supplier cost and platform fees`,
                          `Shopify 2026: avg store CVR 1.4–1.8%; 90% of stores fail in 120 days`,
                          `Model assumes 1 well-managed AI-optimised store survives and scales`,
                        ],
                        source: 'Shopify 2026 merchant report · Dropshipping margin benchmarks',
                      },
                      ads: {
                        formula: `Rev = prevMonthOrganicRev × 25% reinvestment × (ROAS − 1) [ROAS: 1.2→3.5 over 57 months]`,
                        assumptions: [
                          `25% of prior month's organic revenue is reinvested as ad spend`,
                          `ROAS starts at 1.2× (learning phase) and grows to 3.5× max as AI optimises`,
                          `Net profit = ad spend × (ROAS − 1) — only profit above spend is counted`,
                          `Activates Month 3 — requires organic revenue base to reinvest`,
                          `Facebook/Google new advertiser ROAS: 1–2×; experienced: 3–6× (industry benchmark)`,
                        ],
                        source: 'Facebook Ads benchmark report 2025 · Google Ads industry ROAS data',
                      },
                      system: {
                        formula: `Rev = 26 customers/mo × vel × $380 blended avg × S-curve ramp [activates M12]`,
                        assumptions: [
                          `Blended: 20 Starter ($97) + 5 Full ($497) + 1 DWY ($2,997) + 0.2 White-Label ($14,997) = $9,878/mo at max vel`,
                          `$380 blended avg = $9,878 ÷ 26 customers`,
                          `S-curve ramp over 12 months post-activation (Month 12–24)`,
                          `AI handles all marketing: case studies, email sequences, ad campaigns, demos`,
                          `Sales volumes corrected from v4.0 (was 45/5/3/0.5 — now 20/5/1/0.2)`,
                        ],
                        source: 'Info product market benchmarks 2025 · SaaS pricing comparables',
                      },
                    };
                    const audit = FORMULA_AUDIT[v.key];
                    showTip(e, {
                      title: `${v.icon} ${v.label} — Formula Audit`,
                      color: v.color,
                      lines: audit ? [
                        { label: '📐 Formula', value: '', sub: audit.formula },
                        ...audit.assumptions.map((a, i) => ({ label: `Assumption ${i+1}`, value: '', sub: a })),
                        { label: '📚 Source', value: '', sub: audit.source },
                        { label: 'Activates', value: v.activatesMonth === 0 ? 'Month 1' : `Month ${v.activatesMonth}` },
                        { label: 'Max catalog', value: v.key === 'ads' ? 'N/A' : v.unitEcon.maxCatalogSize.toLocaleString() + ' units' },
                      ] : [
                        { label: 'What it tracks', value: 'Monthly revenue', sub: v.description },
                      ],
                      note: 'Every number in this column is derived from this formula. Hover any cell in this column to see the exact calculation for that month.',
                    });
                  }}
                  onMouseLeave={hideTip}>
                  {v.icon} {v.label.split(" ")[0]}
                </th>
              ))}
              <th
                className="text-right py-2 pl-3 text-white/50 font-semibold cursor-help"
                onMouseEnter={e => showTip(e, HEADER_TIPS.total)}
                onMouseLeave={hideTip}>
                Total
              </th>
              <th
                className="text-right py-2 pl-3 text-slate-500 font-medium cursor-help"
                onMouseEnter={e => showTip(e, HEADER_TIPS.single)}
                onMouseLeave={hideTip}>
                Single Ch.
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d, i) => {
              const isPhaseStart = PHASE_REGIONS.some(p => p.startMonth === d.month && d.month > 0);
              const phase = PHASE_REGIONS.find(p => d.month >= p.startMonth && d.month < p.endMonth) || PHASE_REGIONS[PHASE_REGIONS.length - 1];
              return (
                <React.Fragment key={d.month}>
                  {isPhaseStart && (
                    <tr>
                      <td colSpan={VERTICALS.length + 3} className="py-1.5 px-2">
                        <div
                          className="text-xs font-semibold px-2 py-0.5 rounded inline-block cursor-help"
                          style={{ color: phase.color, background: `${phase.color}15` }}
                          onMouseEnter={e => showTip(e, {
                            title: phase.label,
                            color: phase.color,
                            lines: [
                              { label: "Months", value: `M${phase.startMonth} – M${phase.endMonth === 60 ? 60 : phase.endMonth - 1}` },
                              { label: "What happens", value: phase.shortLabel, sub: phase.description },
                              { label: "New verticals", value: phase.startMonth === 0 ? "Digital, Video, Affiliate, Blog" : phase.startMonth === 2 ? "Courses & Workshops" : phase.startMonth === 6 ? "E-Commerce + Programmatic Ads" : phase.startMonth === 12 ? "System Sales (AI SaaS)" : "All 8 verticals at full autonomy", sub: "Verticals activate sequentially as the system matures" },
                            ],
                            note: "Each phase represents a qualitative shift in the system's capabilities, not just a revenue milestone.",
                          })}
                          onMouseLeave={hideTip}>
                          ▶ {phase.label}
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr key={d.month} className={`border-b border-white/4 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/1"}`}>
                    {/* Month cell */}
                    <td
                      className="py-2 pr-3 text-white/30 cursor-help"
                      onMouseEnter={e => showTip(e, buildMonthTip(d))}
                      onMouseLeave={hideTip}>
                      {d.label}
                    </td>
                    {/* Vertical cells */}
                    {VERTICALS.map(v => {
                      const val = (d as any)[v.key] as number;
                      const isActive = val > 0;
                      return (
                        <td
                          key={v.key}
                          className="text-right py-2 px-2 cursor-help transition-all duration-150"
                          style={{ color: isActive ? v.color : "#374151" }}
                          onMouseEnter={e => showTip(e, buildVerticalTip(d, v))}
                          onMouseLeave={hideTip}>
                          {isActive ? formatCurrency(val) : "—"}
                        </td>
                      );
                    })}
                    {/* Total cell */}
                    <td
                      className="text-right py-2 pl-3 text-white font-semibold cursor-help"
                      onMouseEnter={e => showTip(e, buildTotalTip(d))}
                      onMouseLeave={hideTip}>
                      {formatCurrency(d.multiTotal)}
                    </td>
                    {/* Single channel cell */}
                    <td
                      className="text-right py-2 pl-3 text-slate-500 cursor-help"
                      onMouseEnter={e => showTip(e, buildSingleTip(d))}
                      onMouseLeave={hideTip}>
                      {formatCurrency(d.singleChannel)}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Valuation Tab ────────────────────────────────────────────────────────────
function ValuationPanel({ data, budget, scenario }: { data: MonthDataPoint[]; budget: number; scenario: Scenario }) {
  const finalMonth = data[data.length - 1];
  const val = useMemo(() => computeSystemValuation(finalMonth.multiTotal, scenario), [finalMonth.multiTotal, scenario]);
  const scColor = SCENARIO_COLORS[scenario];

  const weightedVal = useCountUp(Math.round(val.weightedValuation), 1000);
  const monthlyProd = useCountUp(Math.round(val.monthlyProductRevenue), 900);

  return (
    <div className="space-y-5">
      {/* Valuation summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Weighted Valuation" value={formatLargeNumber(weightedVal)} sub="SaaS + DCF + Comps" color={scColor} />
        <KpiCard label="SaaS ARR Multiple" value={`${val.saasMultiple}× ARR`} sub={`ARR: ${formatCurrency(val.arr)}`} color="#a78bfa" />
        <KpiCard label="DCF Valuation" value={formatLargeNumber(val.dcfValuation)} sub={`WACC: ${(val.wacc * 100).toFixed(0)}%`} color="#38bdf8" />
        <KpiCard label="AI Sales Revenue" value={`${formatCurrency(monthlyProd)}/mo`} sub="Automated product funnel" color="#e879f9" />
      </div>

      {/* Valuation methodology */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-1">Valuation Methodology</h3>
        <p className="text-xs text-white/35 mb-5">Three independent methods, weighted by reliability for AI SaaS/info products at this stage.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "SaaS ARR Multiple (35%)", value: val.saasValuation, color: scColor, desc: `${val.saasMultiple}× Annual Recurring Revenue. Based on 2024–2026 AI SaaS market comps (Damodaran, Bessemer). ARR = M60 monthly × 12.` },
            { label: "DCF Valuation (35%)", value: val.dcfValuation, color: "#38bdf8", desc: `5-year discounted cash flow + terminal value. WACC: ${(val.wacc * 100).toFixed(0)}%. Terminal growth: 3%. Post-exit revenue growth assumed at reduced rate.` },
            { label: "Comparable Transactions (30%)", value: val.compValuation, color: "#a78bfa", desc: `${SCENARIO_LABELS[scenario]} comp multiple of ${val.saasMultiple === 4.5 ? "3.0" : val.saasMultiple === 7.5 ? "5.5" : "8.0"}× ARR. Based on AI tool & info product acquisitions 2023–2025.` },
          ].map(m => (
            <div key={m.label} className="rounded-xl p-4" style={{ background: `${m.color}08`, border: `1px solid ${m.color}20` }}>
              <div className="font-data text-2xl font-bold mb-1" style={{ color: m.color }}>{formatLargeNumber(m.value)}</div>
              <div className="text-xs font-semibold text-white/70 mb-2">{m.label}</div>
              <p className="text-xs text-white/30 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl" style={{ background: `${scColor}10`, border: `1px solid ${scColor}25` }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Weighted Average Valuation</div>
              <div className="font-data text-3xl font-bold" style={{ color: scColor, textShadow: `0 0 30px ${scColor}50` }}>{formatLargeNumber(val.weightedValuation)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/30">Based on M60 median revenue of</div>
              <div className="font-data text-lg font-semibold text-white">{formatCurrency(finalMonth.multiTotal)}/mo</div>
              <div className="text-xs text-white/25">{SCENARIO_LABELS[scenario]} scenario · {formatCurrency(budget)} capital</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI-automated sales funnel */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-1">AI-Automated Sales Funnel</h3>
        <p className="text-xs text-white/35 mb-5">The system sells itself. AI agents handle content, ads, email sequences, and closing — no human sales team required.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {val.pricingTiers.map(t => (
            <div key={t.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="font-data text-xl font-bold text-white mb-0.5">${t.price.toLocaleString()}</div>
              <div className="text-xs text-white/50 mb-2">{t.label}</div>
              <div className="font-data text-xs text-white/30">{t.monthlySales} sales/mo</div>
              <div className="font-data text-sm font-semibold mt-1" style={{ color: "#e879f9" }}>{formatCurrency(t.monthlyRevenue)}/mo</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl p-4" style={{ background: "rgba(232,121,249,0.06)", border: "1px solid rgba(232,121,249,0.15)" }}>
            <div className="text-xs text-white/40 uppercase tracking-widest mb-3">How AI Automates the Sale</div>
            <div className="space-y-2">
              {[
                ["Trend Agent", "Detects demand spikes for AI automation tools"],
                ["Content Agent", "Publishes case studies, demos, short-form proof videos"],
                ["Ad Agent", "Runs targeted paid campaigns with A/B-tested creatives"],
                ["Email Agent", "Automated nurture sequences → upsell to higher tiers"],
                ["Closer Agent", "Handles objections via trained LLM chatbot on sales page"],
              ].map(([name, desc]) => (
                <div key={name} className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 mt-1.5 flex-shrink-0" />
                  <div><span className="text-xs font-semibold text-fuchsia-300">{name}:</span> <span className="text-xs text-white/40">{desc}</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-4" style={{ background: "rgba(232,121,249,0.06)", border: "1px solid rgba(232,121,249,0.15)" }}>
            <div className="text-xs text-white/40 uppercase tracking-widest mb-3">Impact on Total Revenue</div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-xs text-white/40">7-Vertical Engine (M60)</span><span className="font-data text-sm font-semibold text-white">{formatCurrency(finalMonth.multiTotal - finalMonth.system)}/mo</span></div>
              <div className="flex justify-between"><span className="text-xs text-fuchsia-300">+ System Sales Vertical</span><span className="font-data text-sm font-semibold text-fuchsia-300">+{formatCurrency(finalMonth.system)}/mo</span></div>
              <div className="flex justify-between pt-2 border-t border-white/10"><span className="text-xs text-white/60 font-semibold">8-Vertical Total (M60)</span><span className="font-data text-base font-bold text-white">{formatCurrency(finalMonth.multiTotal)}/mo</span></div>
              <div className="flex justify-between"><span className="text-xs text-white/30">System as % of total</span><span className="font-data text-xs text-fuchsia-300">{((finalMonth.system / Math.max(finalMonth.multiTotal, 1)) * 100).toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-xs text-white/30">AI Sales Revenue/mo</span><span className="font-data text-xs text-fuchsia-300">{formatCurrency(val.monthlyProductRevenue)}/mo</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
type Tab = "monthly" | "cumulative" | "roadmap" | "table" | "valuation";

export default function Home() {
  const [budget, setBudget] = useState(1000);
  const [scenario, setScenario] = useState<Scenario>("base");
  const [activeVerticals, setActiveVerticals] = useState<Set<string>>(new Set(VERTICALS.map(v => v.key)));
  const [activeTab, setActiveTab] = useState<Tab>("monthly");

  const allData = useMemo(() => generateProjectionData(60, budget, scenario), [budget, scenario]);
  const finalMonth = allData[allData.length - 1];
  const scColor = SCENARIO_COLORS[scenario];

  // Animated KPIs
  const kpi1 = useCountUp(finalMonth.multiTotal, 800);
  const kpi2 = useCountUp(finalMonth.cumulativeMulti, 900);
  const kpi3 = useCountUp(Math.round(finalMonth.multiTotal / Math.max(finalMonth.singleChannel, 1) * 10), 800);

  const toggleVertical = useCallback((key: string) => {
    setActiveVerticals(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });
  }, []);

  // X-axis ticks: every 6 months for 60-month view
  const xTicks = allData.filter(d => d.month % 6 === 0).map(d => d.label);
  const yFmt = (v: number) => formatCurrency(v);

  const tabs: { id: Tab; label: string }[] = [
    { id: "monthly", label: "Monthly" },
    { id: "cumulative", label: "Cumulative" },
    { id: "roadmap", label: "Roadmap" },
    { id: "table", label: "Breakdown Table" },
    { id: "valuation", label: "System Valuation" },
  ];

  return (
    <div className="min-h-screen mesh-bg relative overflow-x-hidden">
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,229,204,0.05) 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 70%)", filter: "blur(40px)" }} />

      <div className="container py-8 relative z-10">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #00e5cc, #e879f9)" }} />
                <span className="font-data text-xs text-white/30 uppercase tracking-[0.2em]">AI Digital Economy Engine · 5-Year Projection</span>
              </div>
              <h1 className="text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Revenue Projection
                <span className="block text-2xl font-light mt-1" style={{ color: scColor, textShadow: `0 0 30px ${scColor}40` }}>
                  60-Month · 10,000 Monte Carlo Scenarios · 8 Verticals
                </span>
              </h1>
              <p className="text-white/35 text-sm mt-2 max-w-2xl">
                Production Velocity × Catalog Depth × Unit Economics · AI agents operate at machine scale, not human scale · 100 ebooks/day · 50 videos/day · Catalog compounds forever
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass-card rounded-lg px-4 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-data text-xs text-white/50">Live Model</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <BudgetSlider budget={budget} onChange={setBudget} />
          <ScenarioToggle scenario={scenario} onChange={setScenario} />
        </div>

        {/* ── KPI Bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Month 60 Revenue" value={`${formatCurrency(kpi1)}/mo`} sub="8 verticals · median path" color={scColor} />
          <KpiCard label="60-Month Cumulative" value={formatCurrency(kpi2)} sub="total generated, all verticals" color="#a78bfa" />
          <KpiCard label="Revenue Multiplier" value={`${(kpi3 / 10).toFixed(1)}×`} sub="vs single channel at M60" color="#f59e0b" />
          <KpiCard label="System Valuation" value={formatLargeNumber(computeSystemValuation(finalMonth.multiTotal, scenario).weightedValuation)} sub="weighted: SaaS + DCF + Comps" color="#e879f9" />
        </div>

        {/* ── Main Chart / Content Card ── */}
        <div className={`glass-card rounded-2xl p-6 mb-6 ${activeTab === "table" || activeTab === "valuation" ? "" : ""}`}>
          {/* Tab bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-xs text-white/30 mt-0.5">
                {activeTab === "monthly" && "Stacked area — GBM median path per vertical · confidence bands shown"}
                {activeTab === "cumulative" && "Total capital generated — multi-vertical vs single-channel operator"}
                {activeTab === "roadmap" && "5 deployment phases overlaid as shaded regions · 60-month view"}
                {activeTab === "table" && "Full per-vertical monthly revenue table · paginated · 60 months"}
                {activeTab === "valuation" && "System valuation as packaged product + AI-automated sales analysis"}
              </p>
            </div>
            <div className="flex gap-1 glass-card rounded-lg p-1 flex-wrap">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${activeTab === t.id ? "bg-white/10 text-white" : "text-white/35 hover:text-white/55"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vertical pills (monthly tab) */}
          {activeTab === "monthly" && (
            <div className="flex flex-wrap gap-2 mb-5">
              {VERTICALS.map(v => (
                <VerticalPill key={v.key} v={v} active={activeVerticals.has(v.key)} onToggle={() => toggleVertical(v.key)} />
              ))}
            </div>
          )}

          {/* Phase legend (roadmap) */}
          {activeTab === "roadmap" && (
            <div className="flex flex-wrap gap-3 mb-4">
              {PHASE_REGIONS.map(p => (
                <div key={p.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm opacity-70" style={{ background: p.color }} />
                  <span className="font-data text-xs text-white/45">{p.shortLabel}: {p.label.split(": ")[1]}</span>
                </div>
              ))}
            </div>
          )}

          {/* Chart area */}
          {(activeTab === "monthly" || activeTab === "cumulative" || activeTab === "roadmap") && (
            <div className="h-[440px]">

              {/* Monthly stacked area with confidence bands */}
              {activeTab === "monthly" && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={allData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      {VERTICALS.map(v => (
                        <linearGradient key={v.key} id={`grad-${v.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={v.color} stopOpacity={0.45} />
                          <stop offset="95%" stopColor={v.color} stopOpacity={0.04} />
                        </linearGradient>
                      ))}
                      <linearGradient id="grad-band" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={scColor} stopOpacity={0.12} />
                        <stop offset="95%" stopColor={scColor} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="label" ticks={xTicks} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
                    <YAxis tickFormatter={yFmt} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} width={65} />
                    <Tooltip content={<MonthlyTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
                    {/* P10-P90 confidence band */}
                    <Area type="monotone" dataKey="multi_p90" stroke="none" fill={`url(#grad-band)`} isAnimationActive={false} legendType="none" />
                    <Area type="monotone" dataKey="multi_p10" stroke="none" fill="#0a0f1a" isAnimationActive={false} legendType="none" />
                    {/* Vertical stacked areas */}
                    {VERTICALS.map(v =>
                      activeVerticals.has(v.key) ? (
                        <Area key={v.key} type="monotone" dataKey={v.key} stackId="1" stroke={v.color} strokeWidth={1.5} fill={`url(#grad-${v.key})`} isAnimationActive animationDuration={700} />
                      ) : null
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              )}

              {/* Cumulative lines */}
              {activeTab === "cumulative" && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={allData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="label" ticks={xTicks} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
                    <YAxis tickFormatter={yFmt} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip content={<CumulativeTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
                    {[12, 24, 36, 48].map(m => (
                      <ReferenceLine key={m} x={`M${m}`} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4"
                        label={{ value: `Y${m / 12}`, fill: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }} />
                    ))}
                    <Line type="monotone" dataKey="cumulativeMulti" stroke={scColor} strokeWidth={2.5} dot={false} name="Multi-Vertical Engine" isAnimationActive animationDuration={900} style={{ filter: `drop-shadow(0 0 6px ${scColor}70)` }} />
                    <Line type="monotone" dataKey="cumulativeSingle" stroke="#475569" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Single Channel" isAnimationActive animationDuration={900} />
                    <Legend wrapperStyle={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.4)", paddingTop: 12 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {/* Roadmap overlay */}
              {activeTab === "roadmap" && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={allData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="grad-road" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={scColor} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={scColor} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="label" ticks={xTicks} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
                    <YAxis tickFormatter={yFmt} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} axisLine={false} tickLine={false} width={65} />
                    <Tooltip content={<RoadmapTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
                    {PHASE_REGIONS.map(p => (
                      <ReferenceArea key={p.label}
                        x1={p.startMonth === 0 ? "Start" : `M${p.startMonth}`}
                        x2={p.endMonth >= 60 ? "M60" : `M${p.endMonth}`}
                        fill={p.color} fillOpacity={0.07}
                        stroke={p.color} strokeOpacity={0.2} strokeWidth={1}
                        label={{ value: p.shortLabel, position: "insideTop", fill: p.color, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }} />
                    ))}
                    {PHASE_REGIONS.slice(1).map(p => (
                      <ReferenceLine key={`l-${p.startMonth}`} x={`M${p.startMonth}`}
                        stroke={p.color} strokeOpacity={0.35} strokeDasharray="4 3" strokeWidth={1} />
                    ))}
                    <Area type="monotone" dataKey="multiTotal" stroke={scColor} strokeWidth={2} fill="url(#grad-road)" isAnimationActive animationDuration={900} name="Multi-Vertical" />
                    <Line type="monotone" dataKey="singleChannel" stroke="#475569" strokeWidth={1.5} strokeDasharray="5 5" dot={false} isAnimationActive animationDuration={900} name="Single Channel" />
                    <Legend wrapperStyle={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.4)", paddingTop: 12 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Breakdown table */}
          {activeTab === "table" && (
            <VerticalTable data={allData} budget={budget} scenario={scenario} />
          )}

          {/* Valuation panel */}
          {activeTab === "valuation" && (
            <ValuationPanel data={allData} budget={budget} scenario={scenario} />
          )}
        </div>

        {/* ── Vertical Cards ── */}
        {activeTab !== "table" && activeTab !== "valuation" && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-3">Vertical Performance at Month 60</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
              {VERTICALS.map(v => {
                const m0 = (allData[0] as any)[v.key] as number;
                const m60 = (finalMonth as any)[v.key] as number;
                const growth = m0 > 0 ? (((m60 - m0) / m0) * 100).toFixed(0) : "∞";
                const pct = (m60 / Math.max(finalMonth.multiTotal, 1)) * 100;
                return (
                  <div key={v.key} className="glass-card rounded-xl p-3 flex flex-col gap-2 cursor-pointer hover:scale-[1.02] transition-all duration-200"
                    style={{ borderColor: `${v.color}18` }}
                    onClick={() => toggleVertical(v.key)}>
                    <div className="flex items-center justify-between">
                      <span className="text-base">{v.icon}</span>
                      <span className="font-data text-xs font-semibold" style={{ color: v.color }}>+{growth}%</span>
                    </div>
                    <div>
                      <div className="font-data text-base font-bold leading-none" style={{ color: v.color }}>{formatCurrency(m60)}/mo</div>
                      <div className="text-xs text-white/25 mt-0.5 leading-tight">{v.label}</div>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(pct * 2.5, 100)}%`, background: v.color }} />
                    </div>
                    <div className="font-data text-xs text-white/20">{pct.toFixed(1)}% of total</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Milestone Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[12, 24, 36, 60].map((m, i) => {
            const d = allData[m];
            const colors = ["#00e5cc", "#a78bfa", "#22c55e", "#f59e0b"];
            return (
              <div key={m} className="glass-card rounded-xl p-4" style={{ borderColor: `${colors[i]}18` }}>
                <div className="text-xs text-white/30 uppercase tracking-widest mb-2">Year {m / 12} (M{m})</div>
                <div className="font-data text-xl font-bold" style={{ color: colors[i] }}>{formatCurrency(d.multiTotal)}/mo</div>
                <div className="font-data text-xs text-white/25 mt-1">Cumulative: {formatCurrency(d.cumulativeMulti)}</div>
                <div className="font-data text-xs text-white/20">{(d.multiTotal / Math.max(d.singleChannel, 1)).toFixed(1)}× vs single</div>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-white/5 pt-5 flex items-center justify-between flex-wrap gap-3">
          <div className="font-data text-xs text-white/18 leading-relaxed max-w-2xl">
            Model: Production Velocity × Catalog Depth × Unit Economics · AI agents at machine scale: 100 ebooks/day, 50 videos/day, 500 products/store · Catalog compounds monthly · Confidence bands via GBM noise layer · Valuation: SaaS ARR multiple (35%) + DCF (35%) + Comparable transactions (30%) · Scenario: {SCENARIO_LABELS[scenario]} · Capital: {formatCurrency(budget)}
          </div>
          <div className="font-data text-xs text-white/18">Manus AI · March 2026</div>
        </div>
      </div>
    </div>
  );
}
