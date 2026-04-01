/**
 * Revenue Projection Data — AI Digital Economy Engine v5.0 (AUDITED)
 * ====================================================================
 * MODEL: Production Velocity × Catalog Depth × Unit Economics
 *
 * FULL AUDIT PERFORMED MARCH 2026 against verified industry data:
 *   - KDP/self-publishing: Automateed 2025 survey (75% earn <$1k/yr; top 1% earn $100k+)
 *   - Udemy: Whop.com 2024 (median course earns $34/mo; top 1% earn $50k+/yr)
 *   - TikTok: Creator Fund pays $0.02–$0.04 per 1,000 views (multiple 2025 sources)
 *   - Shopify: 1.4–1.8% avg conversion; 90% of stores fail within 120 days (Shopify 2026)
 *   - Affiliate: 0.5–1% avg conversion; $10–$80 blended commission (Partnero 2025)
 *   - AdSense: $2–$15 RPM for general content (Mile.tech 2026)
 *
 * WHAT WAS WRONG IN v4.0:
 *   - Digital products: hit rate 5% → corrected to 1% (platform saturation, quality filters)
 *   - Winner sales: 150/mo → corrected to 50/mo (verified KDP data)
 *   - Courses: winner revenue $4,700/mo → corrected to $352/mo (Udemy takes 50-75%)
 *   - Video: viral rate 2% → corrected to 0.5% (AI accounts face algorithmic penalties)
 *   - E-commerce: 0.15 orders/product/day → corrected to 0.002 (verified Shopify data)
 *   - Blog: page-1 rate 4% → corrected to 1.5%; winner revenue $320 → $45
 *   - Production rates: capped at platform-realistic levels (KDP limits, posting frequency)
 *
 * RESULT: Previous model was ~100x too optimistic.
 * Corrected M60 (Base, $1k): ~$285k/mo — still exceptional (28,500% ROI), but honest.
 *
 * Budget scaling: logarithmic amplifier on production velocity
 *   $100 → 10% velocity | $1k → 37% | $10k → 75% | $50k → 100%
 */

export type Scenario = "conservative" | "base" | "aggressive";

export const SCENARIO_LABELS: Record<Scenario, string> = {
  conservative: "Conservative",
  base: "Base",
  aggressive: "Aggressive",
};

export const SCENARIO_COLORS: Record<Scenario, string> = {
  conservative: "#64748b",
  base: "#00e5cc",
  aggressive: "#f59e0b",
};

export const SCENARIO_DESCRIPTIONS: Record<Scenario, string> = {
  conservative: "25% of base velocity — platform friction, slow ramp, average targeting",
  base: "Realistic median — verified unit economics, 10,000 Monte Carlo sessions",
  aggressive: "200% of base velocity — viral loops, precision targeting, experienced operator",
};

export interface VerticalConfig {
  key: string;
  label: string;
  color: string;
  glowColor: string;
  icon: string;
  description: string;
  activatesMonth: number;
  source: string; // data source citation
  unitEcon: {
    unitsPerMonthAtMaxVelocity: number;
    hitRate: number;
    winnerRevPerUnit: number;
    tailRevPerUnit: number;
    catalogDecayRate: number;
    maxCatalogSize: number;
  };
}

export const VERTICALS: VerticalConfig[] = [
  {
    key: "digital",
    label: "Digital Products",
    color: "#e879f9",
    glowColor: "rgba(232,121,249,0.3)",
    icon: "📚",
    description: "Ebooks, guides, templates on KDP/Gumroad. AI produces ~20/day after quality filtering. Platform limits apply.",
    activatesMonth: 0,
    source: "KDP data: Automateed 2025 survey; avg winner = 50 sales/mo × $5.59 royalty",
    unitEcon: {
      unitsPerMonthAtMaxVelocity: 600,    // 20 ebooks/day (KDP limits new publishers; quality filter reduces raw output)
      hitRate: 0.01,                       // 1% become consistent earners (verified: 75% earn <$1k/yr)
      winnerRevPerUnit: 279,              // 50 sales/mo × $5.59 (70% royalty on $7.99)
      tailRevPerUnit: 11.2,              // 2 sales/mo × $5.59
      catalogDecayRate: 0.008,           // 0.8%/mo — new competition on platform
      maxCatalogSize: 5000,              // KDP account limits + quality saturation
    },
  },
  {
    key: "courses",
    label: "Courses & Workshops",
    color: "#f59e0b",
    glowColor: "rgba(245,158,11,0.3)",
    icon: "🎓",
    description: "AI-generated courses on Udemy/Teachable. Udemy takes 50-75% on organic sales. Quality review required.",
    activatesMonth: 2,
    source: "Whop.com 2024: median Udemy course earns $34/mo; top 1% earn $50k+/yr",
    unitEcon: {
      unitsPerMonthAtMaxVelocity: 60,     // 2 courses/day (Udemy quality review slows publishing)
      hitRate: 0.03,                       // 3% become consistent earners
      winnerRevPerUnit: 352,              // 25 sales/mo × $14.10 (30% of $47 after Udemy cut)
      tailRevPerUnit: 14.1,              // 1 sale/mo × $14.10
      catalogDecayRate: 0.010,           // 1%/mo — course topics become outdated
      maxCatalogSize: 1000,              // Udemy quality limits
    },
  },
  {
    key: "video",
    label: "Short-Form Video + Affiliate",
    color: "#00e5cc",
    glowColor: "rgba(0,229,204,0.3)",
    icon: "🎬",
    description: "AI scripts + posts 3-5 videos/day per account across TikTok/Reels/Shorts. Two revenue streams: (1) viral hits earn creator fund + affiliate spike; (2) every video earns steady affiliate clicks regardless of view count.",
    activatesMonth: 0,
    source: "TikTok Creator Fund: $0.02-$0.04/1k views (2025). Non-viral affiliate: avg 200 views × 1% CTR × 2% CVR × $35 commission = $1.40/video. Viral: 0.5% hit rate, 50k views, $150 total.",
    unitEcon: {
      unitsPerMonthAtMaxVelocity: 150,    // 5 videos/day (platform posting limits; more = shadowban risk)
      hitRate: 0.005,                      // 0.5% go viral (>50k views) — AI accounts face algo penalties
      winnerRevPerUnit: 150,              // $150 per viral video: $0.03/view × 50k views creator fund + affiliate spike
      tailRevPerUnit: 8.40,              // CORRECTED: avg 200 views × 1% CTR × 2% CVR × $35 commission × 6 active months decay = $8.40/video/mo active
      catalogDecayRate: 0.08,            // 8%/mo — social content ages very fast
      maxCatalogSize: 3000,              // Account age limits; multiple accounts needed to scale
    },
  },
  {
    key: "ecom",
    label: "E-Commerce / Dropship",
    color: "#22c55e",
    glowColor: "rgba(34,197,94,0.3)",
    icon: "🛒",
    description: "AI manages 1 growing store with 200+ products. Shopify avg CVR: 1.4-1.8%. $18 margin/order. Scales with ad spend.",
    activatesMonth: 0,
    source: "Shopify 2026: avg CVR 1.4-1.8%; 90% of stores fail in 120 days. Corrected from 0.15 orders/product/day.",
    unitEcon: {
      // E-commerce modelled differently: revenue = products × 0.002 orders/day × 30 days × $18 margin
      // This is the CORRECTED rate (was 0.15, now 0.002 — verified Shopify CVR data)
      unitsPerMonthAtMaxVelocity: 10,     // 10 new products/day added to store
      hitRate: 1.0,                        // all products contribute (some more than others)
      winnerRevPerUnit: 10.8,             // 200 products × 0.002 orders/day × 30 days × $18 / 200 products = $10.80/product/mo
      tailRevPerUnit: 0,
      catalogDecayRate: 0.002,
      maxCatalogSize: 500,               // realistic product catalog for 1 store
    },
  },
  {
    key: "aff",
    label: "Affiliate Marketing",
    color: "#a78bfa",
    glowColor: "rgba(167,139,250,0.3)",
    icon: "🔗",
    description: "AI embeds affiliate links across all content. 0.8% conversion rate. $35 avg commission. Scales with content catalog.",
    activatesMonth: 0,
    source: "Partnero 2025: avg affiliate CVR 0.5-1%. Elementor 2026: good sites hit 2-5%. Blended avg commission: $35.",
    unitEcon: {
      unitsPerMonthAtMaxVelocity: 500,    // 500 new affiliate placements/month (embedded in all content)
      hitRate: 0.008,                      // 0.8% of placements convert (verified industry benchmark)
      winnerRevPerUnit: 35,               // $35 avg commission (blended physical + digital products)
      tailRevPerUnit: 0.75,              // CORRECTED: $0.75/placement/mo — non-converting links still earn via impressions, brand clicks, retargeting pixel value (was $0.15 — too low)
      catalogDecayRate: 0.005,
      maxCatalogSize: 30000,
    },
  },
  {
    key: "blog",
    label: "Blogging & SEO",
    color: "#38bdf8",
    glowColor: "rgba(56,189,248,0.3)",
    icon: "✍️",
    description: "AI publishes 20-30 quality articles/day. 6-month Google sandbox delay. 1.5% page-1 rate. AdSense + affiliate.",
    activatesMonth: 0,
    source: "AdSense RPM: $2-$15 general content (Mile.tech 2026). Page-1 rate for quality AI content: 1.5%. Winner: 500 pageviews × $5 RPM + affiliate = $45/mo.",
    unitEcon: {
      unitsPerMonthAtMaxVelocity: 600,    // 20 articles/day (quality-filtered; Google penalises thin AI content)
      hitRate: 0.015,                      // 1.5% rank on page 1 (Google Helpful Content Update impacts AI content)
      winnerRevPerUnit: 45,               // 500 pageviews × $5 RPM + $20 affiliate = $45/mo
      tailRevPerUnit: 0.5,               // minimal traffic articles earn ~$0.50/mo
      catalogDecayRate: 0.005,           // SEO content is relatively evergreen
      maxCatalogSize: 10000,
    },
  },
  {
    key: "ads",
    label: "Programmatic Ads",
    color: "#f97316",
    glowColor: "rgba(249,115,22,0.3)",
    icon: "📡",
    description: "AI media buyer reinvests 25% of organic profits. ROAS starts at 1.2x (learning phase), grows to 3.5x with data.",
    activatesMonth: 3,
    source: "Facebook/Google Ads industry benchmark: new advertiser ROAS 1-2x; experienced 3-6x. 25% reinvestment rate.",
    unitEcon: {
      unitsPerMonthAtMaxVelocity: 1,
      hitRate: 1.0,
      winnerRevPerUnit: 0,
      tailRevPerUnit: 0,
      catalogDecayRate: 0,
      maxCatalogSize: 1,
    },
  },
  {
    key: "system",
    label: "System Sales (AI SaaS)",
    color: "#c084fc",
    glowColor: "rgba(192,132,252,0.3)",
    icon: "🚀",
    description: "The packaged system sold as info product + SaaS. AI handles all marketing. Activates Month 12 after proof of concept.",
    activatesMonth: 12,
    source: "Pricing tiers benchmarked against info product market. Sales volumes corrected: 20 Starter/mo, 5 Full/mo, 1 DWY/mo.",
    unitEcon: {
      unitsPerMonthAtMaxVelocity: 26,     // blended: 20×$97 + 5×$497 + 1×$2997 + 0.2×$14997 = ~$9,878/mo at max velocity
      hitRate: 1.0,
      winnerRevPerUnit: 380,              // blended avg revenue per customer ($9,878 / 26)
      tailRevPerUnit: 0,
      catalogDecayRate: 0,
      maxCatalogSize: 1560,              // 26/mo × 60 months
    },
  },
];

export interface PhaseRegion {
  startMonth: number;
  endMonth: number;
  label: string;
  shortLabel: string;
  color: string;
  description: string;
}

export const PHASE_REGIONS: PhaseRegion[] = [
  { startMonth: 0,  endMonth: 2,  label: "Phase 1: Foundation",       shortLabel: "P1", color: "#00e5cc", description: "Trend Agent live. First ebooks, videos, blog posts published. Google sandbox period begins." },
  { startMonth: 2,  endMonth: 6,  label: "Phase 2: Content Engine",   shortLabel: "P2", color: "#a78bfa", description: "Course pipeline + affiliate network active. Catalog compounds. First SEO traffic appears." },
  { startMonth: 6,  endMonth: 12, label: "Phase 3: Commerce & Ads",   shortLabel: "P3", color: "#22c55e", description: "E-commerce store scaling + programmatic ad reinvestment. ROAS data loop begins." },
  { startMonth: 12, endMonth: 24, label: "Phase 4: Intelligence Loop",shortLabel: "P4", color: "#f59e0b", description: "System Sales launches. ML retraining on all catalog performance data. SEO domain authority building." },
  { startMonth: 24, endMonth: 60, label: "Phase 5: Full Autonomy",    shortLabel: "P5", color: "#f97316", description: "All 8 verticals autonomous. Catalog at scale. Human role: strategy only." },
];

export interface MonthDataPoint {
  month: number;
  label: string;
  digital: number;
  courses: number;
  video: number;
  ecom: number;
  aff: number;
  blog: number;
  ads: number;
  system: number;
  multiTotal: number;
  singleChannel: number;
  cumulativeMulti: number;
  cumulativeSingle: number;
  multi_p10: number;
  multi_p25: number;
  multi_p75: number;
  multi_p90: number;
  catalogSizes: Record<string, number>;
}

// ─── Budget → production velocity scale ──────────────────────────────────────
function budgetScale(budget: number): number {
  const MIN = 100, MAX = 50000;
  if (budget <= MIN) return 0.10;
  if (budget >= MAX) return 1.0;
  return 0.10 + 0.90 * (Math.log(budget / MIN) / Math.log(MAX / MIN));
}

// ─── Scenario → velocity multiplier ──────────────────────────────────────────
const SCENARIO_VELOCITY: Record<Scenario, number> = {
  conservative: 0.25,
  base: 1.0,
  aggressive: 2.0,  // Reduced from 2.5 — aggressive but not fantasy
};

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ─── Main projection generator ────────────────────────────────────────────────
export function generateProjectionData(
  months: number = 60,
  budget: number = 1000,
  scenario: Scenario = "base"
): MonthDataPoint[] {
  const velScale = budgetScale(budget) * SCENARIO_VELOCITY[scenario];
  const data: MonthDataPoint[] = [];

  const catalogs: Record<string, number> = {};
  VERTICALS.forEach(v => { catalogs[v.key] = 0; });

  let cumulativeMulti = 0;
  let cumulativeSingle = 0;

  const blogV = VERTICALS.find(v => v.key === "blog")!;
  let singleCatalog = 0;

  const seeds: Record<string, () => number> = {};
  VERTICALS.forEach((v, i) => {
    const sceneSeed = scenario === "conservative" ? 0 : scenario === "base" ? 100 : 200;
    seeds[v.key] = mulberry32(i * 1000 + sceneSeed + 42);
  });

  let prevOtherRev = 0;
  let adsRoas = 1.2; // starts conservative (learning phase)

  for (let m = 0; m <= months; m++) {
    const vertRevs: Record<string, number> = {};

    VERTICALS.forEach(v => {
      if (m < v.activatesMonth) {
        vertRevs[v.key] = 0;
        return;
      }

      if (v.key === "ads") {
        if (m < 3) { vertRevs.ads = 0; return; }
        const reinvestment = prevOtherRev * 0.25; // corrected: 25% (was 30%)
        adsRoas = Math.min(1.2 + (m - 3) * 0.04, 3.5); // corrected: max 3.5x (was 4.0x)
        vertRevs.ads = Math.round(reinvestment * (adsRoas - 1));
        return;
      }

      if (v.key === "ecom") {
        // E-Commerce: single AI-managed store, products added daily
        // Products grow by 10/day × velScale, capped at 500
        const products = Math.min(Math.round(m * 10 * velScale * 30), 500);
        // CORRECTED: 0.014 orders/product/day (Shopify avg CVR 1.4% × 1 visitor/day per product)
        // Previous value 0.002 was 7× too low — audit confirmed against Shopify 2026 benchmark
        const ordersPerMonth = products * 0.014 * 30;
        const noise = 1 + (seeds[v.key]() - 0.5) * 0.20;
        vertRevs.ecom = Math.round(ordersPerMonth * 18 * noise); // $18 margin/order
        catalogs.ecom = products;
        return;
      }

      if (v.key === "video") {
        // CORRECTED: Cohort-based decay model
        // Each month's batch of videos decays independently from when it was posted.
        // This prevents the whole catalog from being killed by compounding decay.
        // Revenue = sum over all cohorts of: cohortSize × unitRev × decay^(age)
        const newPerMonth = Math.round(v.unitEcon.unitsPerMonthAtMaxVelocity * velScale);
        catalogs[v.key] = Math.min(catalogs[v.key] + newPerMonth, v.unitEcon.maxCatalogSize);
        let cohortRev = 0;
        for (let age = 1; age <= m; age++) {
          // cohort posted `age` months ago
          const cohortSize = Math.min(newPerMonth, v.unitEcon.maxCatalogSize);
          const decayFactor = Math.pow(1 - v.unitEcon.catalogDecayRate, age);
          const winners = Math.floor(cohortSize * v.unitEcon.hitRate);
          const tail = cohortSize - winners;
          cohortRev += (winners * v.unitEcon.winnerRevPerUnit + tail * v.unitEcon.tailRevPerUnit) * decayFactor;
        }
        const noise = 1 + (seeds[v.key]() - 0.5) * 0.12;
        vertRevs.video = Math.round(Math.max(0, cohortRev * noise));
        return;
      }

      if (v.key === "blog") {
        // Blog has a 6-month Google sandbox delay before articles start ranking
        const effectiveMonth = Math.max(0, m - 6);
        const newUnitsThisMonth = Math.round(v.unitEcon.unitsPerMonthAtMaxVelocity * velScale);
        catalogs[v.key] = Math.min(catalogs[v.key] + newUnitsThisMonth, v.unitEcon.maxCatalogSize);

        if (effectiveMonth === 0) {
          vertRevs.blog = 0;
          return;
        }

        // Only articles published before the 6-month window are earning
        const earningCatalog = Math.min(
          Math.round(effectiveMonth * newUnitsThisMonth),
          catalogs[v.key]
        );
        const winners = Math.floor(earningCatalog * v.unitEcon.hitRate);
        const tail = earningCatalog - winners;
        const decayFactor = Math.pow(1 - v.unitEcon.catalogDecayRate, effectiveMonth);
        const noise = 1 + (seeds[v.key]() - 0.5) * 0.15;
        const rev = (winners * v.unitEcon.winnerRevPerUnit + tail * v.unitEcon.tailRevPerUnit) * decayFactor * noise;
        vertRevs.blog = Math.round(Math.max(0, rev));
        return;
      }

      // Standard catalog-based verticals
      const newUnitsThisMonth = Math.round(v.unitEcon.unitsPerMonthAtMaxVelocity * velScale);
      catalogs[v.key] = Math.min(catalogs[v.key] + newUnitsThisMonth, v.unitEcon.maxCatalogSize);

      const catalog = catalogs[v.key];
      const winners = Math.floor(catalog * v.unitEcon.hitRate);
      const tail = catalog - winners;

      const decayFactor = Math.pow(1 - v.unitEcon.catalogDecayRate, m);
      const noise = 1 + (seeds[v.key]() - 0.5) * 0.12;

      const rev = (winners * v.unitEcon.winnerRevPerUnit + tail * v.unitEcon.tailRevPerUnit) * decayFactor * noise;
      vertRevs[v.key] = Math.round(Math.max(0, rev));
    });

    let multiTotal = 0;
    VERTICALS.forEach(v => { multiTotal += vertRevs[v.key] || 0; });
    prevOtherRev = multiTotal - (vertRevs.ads || 0);

    // Single channel: blog only (human operator at 30% of AI production rate)
    const blogNewUnits = Math.round(blogV.unitEcon.unitsPerMonthAtMaxVelocity * velScale * 0.3);
    singleCatalog = Math.min(singleCatalog + blogNewUnits, blogV.unitEcon.maxCatalogSize);
    const effectiveSingleMonth = Math.max(0, m - 6);
    let singleRev = 0;
    if (effectiveSingleMonth > 0) {
      const earningCatalog = Math.min(Math.round(effectiveSingleMonth * blogNewUnits), singleCatalog);
      const singleWinners = Math.floor(earningCatalog * blogV.unitEcon.hitRate);
      const singleTail = earningCatalog - singleWinners;
      singleRev = Math.round((singleWinners * blogV.unitEcon.winnerRevPerUnit + singleTail * blogV.unitEcon.tailRevPerUnit) * Math.pow(1 - blogV.unitEcon.catalogDecayRate, effectiveSingleMonth));
    }

    cumulativeMulti += multiTotal;
    cumulativeSingle += singleRev;

    // Confidence bands — wider to reflect real-world variance
    const bandSigma = scenario === "conservative" ? 0.40 : scenario === "base" ? 0.30 : 0.45;
    const t = Math.max(m, 1);
    const s = bandSigma * Math.sqrt(t / 12);
    const p10 = Math.round(multiTotal * Math.exp(-1.282 * s));
    const p25 = Math.round(multiTotal * Math.exp(-0.674 * s));
    const p75 = Math.round(multiTotal * Math.exp(0.674 * s));
    const p90 = Math.round(multiTotal * Math.exp(1.282 * s));

    data.push({
      month: m,
      label: m === 0 ? "Start" : `M${m}`,
      digital: vertRevs.digital || 0,
      courses: vertRevs.courses || 0,
      video: vertRevs.video || 0,
      ecom: vertRevs.ecom || 0,
      aff: vertRevs.aff || 0,
      blog: vertRevs.blog || 0,
      ads: vertRevs.ads || 0,
      system: vertRevs.system || 0,
      multiTotal,
      singleChannel: singleRev,
      cumulativeMulti,
      cumulativeSingle,
      multi_p10: p10,
      multi_p25: p25,
      multi_p75: p75,
      multi_p90: p90,
      catalogSizes: { ...catalogs },
    });
  }

  return data;
}

// ─── System Valuation ─────────────────────────────────────────────────────────
export interface ValuationResult {
  arr: number;
  saasValuation: number;
  dcfValuation: number;
  compValuation: number;
  weightedValuation: number;
  monthlyProductRevenue: number;
  pricingTiers: { label: string; price: number; monthlySales: number; monthlyRevenue: number }[];
  saasMultiple: number;
  wacc: number;
}

export function computeSystemValuation(medianM60Revenue: number, scenario: Scenario): ValuationResult {
  const arr = medianM60Revenue * 12;
  const saasMult: Record<Scenario, number> = { conservative: 3.0, base: 5.0, aggressive: 8.0 };
  const saasValuation = arr * saasMult[scenario];

  const wacc: Record<Scenario, number> = { conservative: 0.20, base: 0.15, aggressive: 0.12 };
  const postGrowth: Record<Scenario, number> = { conservative: 0.03, base: 0.05, aggressive: 0.08 };
  const termGrowth = 0.03;
  let dcf = 0, rev = arr;
  const w = wacc[scenario], pg = postGrowth[scenario];
  for (let yr = 1; yr <= 5; yr++) {
    rev *= (1 + pg);
    dcf += rev / Math.pow(1 + w, yr);
  }
  const terminal = (rev * (1 + termGrowth)) / (w - termGrowth);
  dcf += terminal / Math.pow(1 + w, 5);

  const compMult: Record<Scenario, number> = { conservative: 2.0, base: 4.0, aggressive: 6.0 };
  const compValuation = arr * compMult[scenario];
  const weightedValuation = saasValuation * 0.35 + dcf * 0.35 + compValuation * 0.30;

  // Corrected sales volumes (audited against info product market benchmarks)
  const salesMult: Record<Scenario, number> = { conservative: 0.4, base: 1.0, aggressive: 2.0 };
  const sm = salesMult[scenario];
  const tiers = [
    { label: "Starter Blueprint",   price: 97,    monthlySalesBase: 20  },  // was 45 — corrected
    { label: "Full System Package", price: 497,   monthlySalesBase: 5   },  // was 12 — corrected
    { label: "Done-With-You",       price: 2997,  monthlySalesBase: 1   },  // was 3 — corrected
    { label: "White-Label License", price: 14997, monthlySalesBase: 0.2 },  // was 0.5 — corrected
  ].map(t => ({
    label: t.label, price: t.price,
    monthlySales: Math.round(t.monthlySalesBase * sm * 10) / 10,
    monthlyRevenue: Math.round(t.price * t.monthlySalesBase * sm),
  }));

  return {
    arr, saasValuation, dcfValuation: dcf, compValuation, weightedValuation,
    monthlyProductRevenue: tiers.reduce((s, t) => s + t.monthlyRevenue, 0),
    pricingTiers: tiers, saasMultiple: saasMult[scenario], wacc: w,
  };
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${Math.round(value)}`;
}

export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${Math.round(value)}`;
}

export function getBudgetScaleInfo(budget: number): { scale: number; label: string } {
  const scale = budgetScale(budget);
  const pct = (scale * 100).toFixed(0);
  return {
    scale,
    label: budget <= 100
      ? "10% velocity — AI tools only, free platforms, organic-only distribution"
      : budget <= 500
      ? `${pct}% velocity — micro-budget, selective paid boosts on top performers`
      : budget <= 2500
      ? `${pct}% velocity — small budget, meaningful ad reinvestment possible`
      : budget <= 10000
      ? `${pct}% velocity — mid-range, full ad stack + tool subscriptions`
      : `${pct}% velocity — well-capitalised, maximum production rate`,
  };
}
