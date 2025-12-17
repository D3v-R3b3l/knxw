
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import LegendPill from "@/components/documentation/LegendPill";
import { BookOpen, Search } from "lucide-react";

const priorityLegend = [
  { label: "low", className: "bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30", tooltip: "Low operational urgency. Monitor and schedule when convenient." },
  { label: "medium", className: "bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30", tooltip: "Moderate urgency. Address in regular prioritization cycles." },
  { label: "high", className: "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30", tooltip: "High urgency. Action recommended soon to capture value or reduce risk." },
  { label: "critical", className: "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30", tooltip: "Critical. Immediate attention required to prevent loss, churn, or failures." },
];

const insightTypeLegend = [
  { label: "behavioral_pattern", className: "bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30", tooltip: "Stable tendencies inferred from repeated actions (what a user tends to do)." },
  { label: "emotional_trigger", className: "bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30", tooltip: "Stimuli or events likely to shift a user’s emotional state in the moment." },
  { label: "motivation_shift", className: "bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30", tooltip: "Detected change in underlying drivers (e.g., autonomy → mastery)." },
  { label: "engagement_optimization", className: "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30", tooltip: "Tactics predicted to increase engagement or reduce friction right now." },
  { label: "risk_assessment", className: "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30", tooltip: "Predicted churn, drop-off, or issue risk that needs mitigation." },
];

const eventTypeLegend = [
  { label: "click", className: "bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30", tooltip: "A click/tap interaction; indicates intent and focus on an element." },
  { label: "page_view", className: "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30", tooltip: "A new page or screen was viewed; foundation of journey analytics." },
  { label: "scroll", className: "bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30", tooltip: "Depth and pacing of reading/scan behavior; signal of interest." },
  { label: "form_submit", className: "bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30", tooltip: "A form completion; key conversion action and friction signal." },
  { label: "form_focus", className: "bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30", tooltip: "A form field was focused; reveals hesitation and micro-friction." },
  { label: "hover", className: "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30", tooltip: "Cursor dwell without click; indicates curiosity or uncertainty." },
  { label: "exit_intent", className: "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30", tooltip: "Behavior suggesting likely exit (e.g., rapid cursor to close/tab)." },
  { label: "time_on_page", className: "bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30", tooltip: "Aggregate dwell time; coarse proxy for attention/engagement." },
];

// Tag explanations for all tag pills across glossary terms
const tagExplanations = {
  psychographic: "Attributes describing motivations, personality, and cognitive styles beyond demographics/behavior.",
  motivation: "A core driver for action (e.g., mastery, autonomy). Helps tailor messaging and UX.",
  segmentation: "Grouping users by shared attributes to target experiences and analysis.",
  state: "Momentary condition (e.g., mood, energy) that can change rapidly.",
  temporal: "Time-related dynamics (recency/decay) that affect model weighting and relevance.",
  inference: "AI-derived conclusion from observed behavior; carries a confidence score.",
  profile: "A structured representation of a user’s attributes and tendencies.",
  trait: "Relatively stable characteristic (e.g., conscientiousness).",
  thinking: "How a user prefers to process information (analytical, intuitive, etc.).",
  tolerance: "Comfort with uncertainty and variability (risk capacity/preference).",
  variance: "Observed variability; used to gauge stability vs. volatility in behavior.",
  insight: "A meaningful pattern or conclusion that suggests an action.",
  ai: "Generated or assisted by machine learning or LLMs with explainability metadata.",
  event: "Atomic interaction captured by the SDK (clicks, views, etc.).",
  telemetry: "Streamed measurement data used for analysis and monitoring.",
  activation: "Driving users to meaningful actions (onboarding, adoption, conversion).",
  personalization: "Tailoring content/UX to the individual for relevance and effectiveness.",
  explainability: "Clarity on how/why an AI conclusion was reached; supports trust/compliance.",
  score: "A normalized metric (0–1 or %) indicating strength/confidence/priority.",
  data: "Structured information records used by the platform.",
  entity: "A domain object in the data model (e.g., UserPsychographicProfile).",
  categorization: "Labeling items to enable organization and retrieval.",
  filtering: "Narrowing results by attributes to focus analysis."
};

const motivations = [
  "achievement","autonomy","mastery","purpose","connection","security","recognition","creativity",
  "curiosity","power","flexibility","innovation","status","belonging","meaning","control",
  "growth","competence","relatedness"
];

function buildTerms() {
  const terms = [];

  motivations.forEach((m) => {
    terms.push({
      term: m,
      category: "Motivation",
      definition: `A core driver influencing user choices and engagement. "${m}" reflects a user's tendency toward ${
        {
          achievement: "reaching goals and measurable progress",
          autonomy: "independence and control over decisions",
          mastery: "getting better at tasks and skills",
          purpose: "meaningful impact aligned to values",
          connection: "social belonging and relationships",
          security: "safety, predictability, and risk reduction",
          recognition: "acknowledgment, status, and praise",
          creativity: "novel expression and experimentation",
          curiosity: "exploration and learning new things",
          power: "influence and ability to shape outcomes",
          flexibility: "adaptability and options",
          innovation: "new solutions and early adoption",
          status: "standing, prestige, rank",
          belonging: "community and inclusion",
          meaning: "significance and alignment to values",
          control: "agency and predictable outcomes",
          growth: "progress, learning, expansion",
          competence: "capability and efficacy",
          relatedness: "connection to people and context",
        }[m] || "a specific, recognizable behavioral tendency"
      }.`,
      tags: ["psychographic", "motivation", "segmentation"]
    });
  });

  [
    ["positive","General positive affect and satisfaction"],
    ["neutral","Low arousal, steady state; neither positive nor negative"],
    ["negative","Frustration or dissatisfaction"],
    ["excited","Elevated arousal and interest"],
    ["anxious","Tension, uncertainty, risk sensitivity"],
    ["confident","High certainty and self-efficacy"],
    ["uncertain","Ambiguity and need for clarity"],
  ].forEach(([term, def]) => {
    terms.push({ term, category: "Emotion", definition: def, tags: ["state","temporal","inference"] });
  });

  [
    ["openness","Receptivity to new experiences, variety, and novelty"],
    ["conscientiousness","Orderliness, diligence, and reliability"],
    ["extraversion","Sociability, expressiveness, and approach motivation"],
    ["agreeableness","Cooperativeness, trust, and empathy"],
    ["neuroticism","Sensitivity to stressors and negative affect"],
  ].forEach(([term, def]) => {
    terms.push({ term, category: "Personality Trait (OCEAN)", definition: def, tags: ["profile","trait"] });
  });

  [
    ["analytical","Sequential reasoning, structured exploration"],
    ["intuitive","Pattern-seeking, non-linear jumps"],
    ["systematic","Process-driven, consistent workflows"],
    ["creative","Divergent thinking, experimentation"],
  ].forEach(([term, def]) => {
    terms.push({ term, category: "Cognitive Style", definition: def, tags: ["profile","thinking"] });
  });

  [
    ["conservative","Prefers safety, predictability, lower risk"],
    ["moderate","Balances risk and reward pragmatically"],
    ["aggressive","Seeks high reward despite risk"],
  ].forEach(([term, def]) => {
    terms.push({ term, category: "Risk Profile", definition: def, tags: ["tolerance","variance"] });
  });

  [
    ["behavioral_pattern","Detected pattern in user behavior suggesting stable tendencies"],
    ["emotional_trigger","Events or stimuli likely to shift emotional state"],
    ["motivation_shift","Change in primary underlying drivers (motivation stack)"],
    ["engagement_optimization","Tactics predicted to increase engagement"],
    ["risk_assessment","Potential churn/issue risk requiring mitigation"],
  ].forEach(([term, def]) => {
    terms.push({ term, category: "Insight Type", definition: def, tags: ["insight","ai"] });
  });

  [
    ["page_view","A page or screen view recorded by the SDK"],
    ["click","A click or tap interaction on an element"],
    ["scroll","Scroll activity over time"],
    ["form_submit","A form was submitted"],
    ["form_focus","A form field was focused"],
    ["hover","Hover activity indicating interest"],
    ["exit_intent","Cursor pattern indicating likely exit"],
    ["time_on_page","Aggregate dwell time for a page/screen"],
  ].forEach(([term, def]) => {
    terms.push({ term, category: "Event Type", definition: def, tags: ["event","telemetry"] });
  });

  [
    ["Engagement Rule","If-this-then-that logic combining psychographic and behavioral conditions to trigger experiences."],
    ["Engagement Template","Reusable content and UI for a check-in, tooltip, modal, notification, or redirect."],
    ["Engagement Delivery","A recorded instance of a template delivered to a user, with context and response."],
    ["Check-in","Conversational micro-survey or nudge tailored by profile and recent behavior."],
  ].forEach(([term, def]) => {
    terms.push({ term, category: "Engagement", definition: def, tags: ["activation","personalization"] });
  });

  [
    ["confidence_score","A 0–1 value representing AI certainty for an insight or inference."],
    ["priority","Operational urgency of an insight or engagement: low, medium, high, critical."],
    ["temporal_decay","Recent signals are weighted more heavily than older ones to reflect recency relevance."],
    ["motivation_stack","Ordered list of dominant motivations inferred for a user."],
    ["profile_reasoning","Explainable AI notes for why the system inferred specific psychographic attributes."],
    ["insight_reasoning","Explainable AI notes for how an insight was generated and supported."],
  ].forEach(([term, def]) => {
    terms.push({ term, category: "Modeling & Scoring", definition: def, tags: ["explainability","score"] });
  });

  [
    ["UserPsychographicProfile","Aggregated psychographic representation (traits, emotions, motivations, patterns)."],
    ["CapturedEvent","Atomic telemetry from the SDK capturing user interactions and context."],
    ["PsychographicInsight","AI-generated analysis and recommendations tied to a user."],
    ["ClientApp","Your application and API key configuration for event capture and analysis."],
  ].forEach(([term, def]) => {
    terms.push({ term, category: "Data Entity", definition: def, tags: ["data","entity"] });
  });

  [
    ["tags","Lightweight labels used for grouping, filtering, or annotating records. In knXw, tags help categorize insights, events, or engagements for faster retrieval and analysis."],
  ].forEach(([term, def]) => {
    terms.push({ term, category: "Tagging", definition: def, tags: ["categorization","filtering"] });
  });

  return terms;
}

export default function Glossary() {
  const [query, setQuery] = useState("");
  const terms = useMemo(buildTerms, []);
  const categories = useMemo(() => {
    const s = new Set(terms.map(t => t.category));
    return Array.from(s).sort();
  }, [terms]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter(t =>
      t.term.toLowerCase().includes(q) ||
      t.definition.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  }, [terms, query]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(t => {
      if (!g[t.category]) g[t.category] = [];
      g[t.category].push(t);
    });
    return g;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
              <BookOpen className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Glossary & Key Legend
            </h1>
          </div>
          <p className="text-[#a3a3a3] text-lg">
            Definitions for psychographic profiling, tagging, insights, and events used across the platform.
          </p>
        </div>

        <div className="mb-8 relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
          <Input
            placeholder="Search terms, categories, or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-[#111111] border-[#262626] text-white placeholder-[#a3a3a3]"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white">Priority Legend</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex flex-wrap gap-2">
                {priorityLegend.map((p) => (
                  <LegendPill key={p.label} label={p.label} className={p.className} tooltip={p.tooltip} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white">Insight Types</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex flex-wrap gap-2">
                {insightTypeLegend.map((p) => (
                  <LegendPill key={p.label} label={p.label.replace(/_/g,' ')} className={p.className} tooltip={p.tooltip} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white">Event Types</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex flex-wrap gap-2">
                {eventTypeLegend.map((p) => (
                  <LegendPill key={p.label} label={p.label.replace(/_/g,' ')} className={p.className} tooltip={p.tooltip} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {Object.keys(grouped).sort().map((cat) => (
            <Card key={cat} className="bg-[#111111] border-[#262626]">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{cat}</CardTitle>
                  <Badge className="bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30">
                    {(grouped[cat] || []).length} terms
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="grid md:grid-cols-2 gap-4">
                  {(grouped[cat] || []).map((t) => (
                    <div key={`${cat}-${t.term}`} className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-white capitalize">{t.term.replace(/_/g,' ')}</h4>
                        {t.tags && t.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {t.tags.map((tag) => (
                              <LegendPill
                                key={tag}
                                label={tag}
                                className="bg-[#0ea5e9]/20 text-[#0ea5e9] border-[#0ea5e9]/30 capitalize"
                                tooltip={tagExplanations[tag] || "A helpful label used for grouping and filtering in knXw."}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[#a3a3a3] leading-relaxed">{t.definition}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
