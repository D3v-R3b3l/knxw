
import React, { useEffect, useMemo, useRef, useState } from "react";
import { agentSDK } from "@/agents";
import { User } from '@/api/entities'; // New import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Merged lucide-react imports:
import { 
  Bot, Shield, Activity, PlayCircle, Send, Sparkles, Square, AlertCircle, FlaskConical, LifeBuoy, Rocket, Globe2, Trash2,
  MessageSquare, Plus, Zap, Play, Clock, CheckCircle, AlertTriangle, Brain, Users, TrendingUp, FileText, Target 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import MessageBubble from "@/components/agents/MessageBubble";
import { SubscriptionGate } from '@/components/billing/SubscriptionGate'; // New import

// Suggested commands per agent
const AGENTS = [
  {
    name: "growth_orchestrator",
    title: "Growth Orchestrator",
    description: "Turns insights into targeted rules, templates, and actions.",
    icon: PlayCircle,
    suggested: [
      "Find a high-intent, low-conversion segment from the last 7 days and propose 2 experiments.",
      "Create an in-product check-in for anxious users on the pricing page.",
      "Draft a re-engagement email for conservative users who abandoned carts in the last 24h.",
      "Generate 3 A/B copy variations for onboarding tooltip targeting intuitive users.",
      "Recommend the best engagement rule to lift activation this week."]
  },
  {
    name: "data_guardian",
    title: "Data Guardian",
    description: "Monitors data quality and profile freshness.",
    icon: Activity,
    suggested: [
      "List events with missing user_id in the last 24 hours and summarize sources.",
      "Find profiles not analyzed in 7 days and queue re-analysis.",
      "Detect schema drift in event_payload fields over 14 days.",
      "Daily data quality summary with top issues and impact.",
      "Flag inconsistent session_id formats and propose fixes."]
  },
  {
    name: "compliance_officer",
    title: "Compliance Officer",
    description: "Automates privacy exports/deletions and audit logging.",
    icon: Shield,
    suggested: [
      "Export data for user_id=demo_user_123 and provide a download link.",
      "Stage deletion for subject email jane.doe@example.com.",
      "List all pending data requests and their blockers.",
      "Generate an audit log summary for the past week.",
      "Verify if any active deletion requests conflict with billing retention."]
  },
  {
    name: "self_optimizing_engagement_architect",
    title: "Self-Optimizing Engagement Architect",
    description: "Continuously adapts psychographic targeting strategies based on real-time performance data.",
    icon: Bot,
    suggested: [
      "Analyze the last 100 engagement deliveries and identify which psychographic triggers perform best for checkout conversions.",
      "Find underperforming engagement rules and suggest optimizations based on user response patterns.",
      "Create new engagement templates targeting high-neuroticism users with reassuring messaging.",
      "Identify engagement fatigue patterns and recommend frequency adjustments for different segments.",
      "Generate A/B test recommendations for CTA messaging based on cognitive style preferences."]
  },
  {
    name: "psycho_forensic_debugger", 
    title: "Psycho-Forensic Debugger",
    description: "Identifies user friction through deep psychological journey reconstruction.",
    icon: AlertCircle,
    suggested: [
      "Analyze the last 50 users who abandoned checkout and identify psychological friction points.",
      "Find users with rapid exit_intent patterns and diagnose the underlying emotional triggers.",
      "Reconstruct the journey of users showing repeated form_focus without form_submit events.",
      "Identify cognitive overload patterns in analytical users during onboarding flows.",
      "Create friction prevention rules for users showing decision fatigue signals."]
  },
  {
    name: "dynamic_compliance_ethical_guardian",
    title: "Dynamic Compliance & Ethical AI Guardian", 
    description: "Proactively monitors ethical AI usage and manages dynamic consent.",
    icon: Shield,
    suggested: [
      "Scan all active engagement rules for potential dark patterns targeting vulnerable psychographic segments.",
      "Review recent engagement deliveries for ethical concerns and flag any high-risk patterns.",
      "Analyze consent coverage gaps and recommend dynamic consent prompts for new data uses.",
      "Generate weekly ethical AI compliance report with risk assessment scores.",
      "Audit recent psychographic profiling decisions for bias or discriminatory patterns."]
  },
  {
    name: "personalized_content_generation",
    title: "Personalized Content Generation",
    description: "Auto-generates psychographically tuned copy for your segments.",
    icon: Sparkles,
    suggested: [
      "Generate 3 push notification variants for 'Anxious Achievers' about a limited-time feature.",
      "Write an in-app modal for 'Intuitive Innovators' announcing a new beta with early access.",
      "Draft subject lines for a reactivation email targeting 'Conservative' users."
    ]
  },
  {
    name: "ab_test_optimization",
    title: "A/B Test Optimization",
    description: "Designs psychographic A/B tests, monitors results, iterates winners.",
    icon: FlaskConical,
    suggested: [
      "Design an A/B test contrasting reassurance vs. urgency for anxious vs. confident users.",
      "Analyze current onboarding tooltip variants and recommend a winner with rationale.",
      "Propose next-step variants for a pricing CTA based on last 14 days of deliveries."
    ]
  },
  {
    name: "churn_prediction_prevention",
    title: "Churn Prediction & Prevention",
    description: "Flags pre-churn signals and triggers targeted save actions.",
    icon: LifeBuoy,
    suggested: [
      "Find users with declining confidence and propose a re-engagement sequence.",
      "Create a rule to intervene when session frequency drops for achievers.",
      "Draft a check-in template for anxious users who stalled on setup."
    ]
  },
  {
    name: "feature_adoption",
    title: "Product Feature Adoption",
    description: "Explains low adoption and injects just-in-time nudges.",
    icon: Rocket,
    suggested: [
      "Why is Feature X underused by analytical users? Propose in-product hints.",
      "Create a modal template to guide creatives to try Feature Y with examples.",
      "Suggest three lightweight nudges to boost adoption of the dashboard filters."
    ]
  },
  {
    name: "market_trend_analysis",
    title: "Market Trend Analysis",
    description: "Maps external psychographic trends to your segments.",
    icon: Globe2,
    suggested: [
      "What external messaging trends resonate with risk-averse segments this quarter?",
      "Summarize competitor moves relevant to our 'Intuitive Innovators' audience.",
      "Find three emerging micro-segments we should test campaigns for."
    ]
  },
  {
    name: "captured_events_cleaner",
    title: "Captured Events Cleaner",
    description: "Safely purges CapturedEvent records in bulk with confirmation and audit logs.",
    icon: Trash2,
    suggested: [
      "Delete ALL events (I confirm)",
      "Delete events older than 7 days",
      "Delete events for user_id prefix demo_",
      "Delete events with event_type = page_view",
      "Delete events where url contains /pricing"
    ]
  }
];


export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const subRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const { toast } = useToast();

  const [isStopped, setIsStopped] = useState(false); // NEW: track if user stopped streaming

  // NEW: State for access control
  const [roleChecked, setRoleChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // NEW: useEffect for fetching user role and checking access
  useEffect(() => {
    (async () => {
      try {
        const me = await User.me();
        setIsAdmin(me?.role === 'admin'); // Assuming 'admin' role grants access to this feature
      } catch (e) {
        setIsAdmin(false); // Default to no access if user fetch fails
        console.error('Failed to fetch user role:', e);
      } finally {
        setRoleChecked(true); // Mark role as checked whether successful or not
      }
    })();
  }, []); // Run once on component mount

  // Helper to unsubscribe safely
  const unsubscribe = () => {
    if (subRef.current) {
      try { subRef.current(); } catch (e) {
        console.error("Error unsubscribing:", e);
      }
      subRef.current = null;
    }
  };

  const startConversation = async (agentName, contextNote) => {
    try {
      unsubscribe();
      const convo = await agentSDK.createConversation({
        agent_name: agentName,
        metadata: {
          name: `${agentName} conversation`,
          description: contextNote || ""
        }
      });
      setConversation(convo);
      setMessages(convo?.messages || []);
      subRef.current = agentSDK.subscribeToConversation(convo.id, (data) => {
        setMessages(data.messages || []);
      });
      setIsStopped(false); // reset stopped state on new convo
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Couldn’t start conversation",
        description: typeof e?.message === "string" ? e.message : "Please try again in a moment."
      });
    }
  };

  // Centralized error handling for send flow
  const handleAgentError = async (error, originalText) => {
    const msg = String(error?.message || "");
    const details = String(error?.response?.data?.error || "");
    const combined = (msg + " " + details).toLowerCase();

    // 1) Agent max-turns reached -> auto-rotate to a fresh conversation and retry once
    if (combined.includes("maximum number of turns") || combined.includes("max turns")) {
      try {
        // Start continuation conversation
        unsubscribe();
        const fresh = await agentSDK.createConversation({
          agent_name: selectedAgent.name,
          metadata: {
            name: `${selectedAgent.name} conversation (cont.)`,
            description: `${selectedAgent.title} — continuation after reaching max turns`
          }
        });
        setConversation(fresh);
        setMessages(fresh?.messages || []);
        subRef.current = agentSDK.subscribeToConversation(fresh.id, (data) => {
          setMessages(data.messages || []);
        });

        // Retry sending the original user message
        await agentSDK.addMessage(fresh, { role: "user", content: originalText });

        toast({
          title: "New thread created",
          description: "Previous chat reached its limit. Continued in a fresh conversation."
        });
        return;
      } catch (retryErr) {
        toast({
          variant: "destructive",
          title: "Couldn’t continue conversation",
          description: typeof retryErr?.message === "string" ? retryErr.message : "Please try again."
        });
        return;
      }
    }

    // 2) Generic 400 Bad Request handling
    if (error?.response?.status === 400) {
      toast({
        variant: "destructive",
        title: "Request not accepted",
        description: "The agent could not process this request. Try rephrasing or simplifying your ask."
      });
      return;
    }

    // 3) Fallback
    toast({
      variant: "destructive",
      title: "Agent error",
      description: typeof error?.message === "string" ? error.message : "Something went wrong. Please try again."
      });
  };

  const sendMessage = async () => {
    const text = prompt.trim();
    if (!text || !conversation || loading) return;

    // If user previously hit Stop, re-subscribe to the same conversation before sending
    if (isStopped && !subRef.current && conversation?.id) {
      subRef.current = agentSDK.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages || []);
      });
      setIsStopped(false); // Reset stopped state after re-subscribing
    }

    setLoading(true);
    setPrompt("");

    // optimistic add
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      await agentSDK.addMessage(conversation, { role: "user", content: text });
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
    } catch (e) {
      // remove the optimistic message if needed? We’ll keep it for continuity.
      await handleAgentError(e, text);
    } finally {
      setLoading(false);
    }
  };

  const stopGeneration = () => {
    // Soft cancel: stop streaming updates and mark as stopped
    unsubscribe();
    setIsStopped(true);
    toast({
      title: "Stopped",
      description: "Agent output stopped. You can continue by sending a new message."
    });
  };

  // Rename: useSuggestion -> handleSuggestion (not a hook)
  const handleSuggestion = async (agent, text) => {
    // Switch agent if needed, then prefill prompt and focus input
    if (selectedAgent.name !== agent.name) {
      setSelectedAgent(agent);
      await startConversation(agent.name, agent.description);
    }
    setPrompt(text);
    setTimeout(() => {
      inputRef.current?.focus();
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 10);
  };

  useEffect(() => {
    // Only start conversation if role check passed and user is admin
    if (roleChecked && isAdmin) {
      startConversation(selectedAgent.name, selectedAgent.description);
    }
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleChecked, isAdmin]); // Depend on roleChecked and isAdmin to trigger initial conversation

  const AgentIcon = useMemo(() => selectedAgent.icon || Bot, [selectedAgent]);

  // NEW: Conditional rendering for access control
  if (!roleChecked) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-[#262626] border-t-[#fbbf24] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <SubscriptionGate 
        requiredPlan="pro" 
        feature="AI Agents & Automation"
        customMessage="AI Agents and advanced automation capabilities require the Pro plan or higher."
      >
        <div /> {/* This div acts as a placeholder for the gated content. */}
      </SubscriptionGate>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
            <Bot className="w-6 h-6 text-[#0a0a0a]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Agents</h1>
        </div>

        {/* Agent Cards - simplified, aligned content and CTA; no suggestions here */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-6">
          {AGENTS.map((a) => {
            const Icon = a.icon || Bot;
            const active = a.name === selectedAgent.name;
            return (
              <Card
                key={a.name}
                className={`group relative overflow-hidden bg-[#111111] border ${
                  active ? "border-[#00d4ff]" : "border-[#262626]"} hover:border-[#00d4ff]/50 transition-all duration-200 flex flex-col h-full`
                }>

                {/* Power glow accent */}
                <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#00d4ff] opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" />
                <CardHeader className="p-5">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Icon className="w-5 h-5 text-[#00d4ff]" />
                    {a.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 flex flex-col gap-4 flex-1">
                  <p className="text-sm text-[#a3a3a3]">{a.description}</p>
                  <div className="mt-auto pt-2">
                    <Button
                      onClick={() => {
                        setSelectedAgent(a);
                        startConversation(a.name, a.description);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }}
                      className="bg-[#00d4ff] text-[#0a0a0a] hover:bg-[#0ea5e9] w-full">

                      Use Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>);

          })}
        </div>

        {/* Conversation with Suggestions inside the chat pane */}
        <Card className="bg-[#111111] border border-[#262626] mb-24 md:mb-8">
          <CardHeader className="p-5">
            <CardTitle className="w-full flex items-center justify-center gap-2 text-white text-center">
              <AgentIcon className="w-5 h-5 text-[#00d4ff]" />
              <span className="truncate">{selectedAgent.title}</span>
            </CardTitle>

            {/* REPLACED: Mobile agent selector as full-width tabs (always visible) */}
            <div className="md:hidden mt-3">
              <div className="grid grid-cols-3 gap-2">
                {AGENTS.map((a) => {
                  const active = a.name === selectedAgent.name;
                  return (
                    <button
                      key={a.name}
                      onClick={async () => {
                        if (selectedAgent.name !== a.name) {
                          setSelectedAgent(a);
                          await startConversation(a.name, a.description);
                          setTimeout(() => inputRef.current?.focus(), 50);
                        }
                      }}
                      title={a.title}
                      className={[
                        "w-full text-[11px] leading-tight px-2 py-2 rounded-t-md transition-colors",
                        "text-center truncate",
                        active
                          ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/50 shadow-[0_0_0_1px_rgba(0,212,255,0.25)_inset,0_0_24px_rgba(0,212,255,0.15)]"
                          : "bg-[#0f0f0f] text-[#e5e5e5]/80 border border-[#262626] hover:border-[#00d4ff]/30 hover:text-[#e5e5e5]"
                      ].join(" ")}
                    >
                      {a.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Flexible chat container to avoid mobile overflow and keep composer visible */}
            <div className="flex flex-col h-[70vh] md:h-[62vh]">
              {/* Suggestions bar inside chat */}
              {Array.isArray(selectedAgent.suggested) && selectedAgent.suggested.length > 0 &&
                <div className="flex gap-2 overflow-x-auto sidebar-scroll px-5 pb-2">
                  {selectedAgent.suggested.map((s, idx) =>
                    <button
                      key={idx}
                      onClick={() => handleSuggestion(selectedAgent, s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-[#262626] bg-[#0f0f0f] hover:bg-[#0d0d0d] hover:border-[#00d4ff]/50 transition-colors text-[#e5e5e5] whitespace-nowrap"
                      aria-label={`Use suggestion: ${s}`}
                      title="Click to use this command">

                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#00d4ff]" />
                        {s}
                      </span>
                    </button>
                  )}
                </div>
              }

              {/* Messages list with extra bottom padding so content never sits under the composer */}
              <div ref={listRef} className="flex-1 overflow-y-auto sidebar-scroll px-5 py-3 pb-24">
                <div className="mx-auto w-full max-w-2xl space-y-3">
                  {messages.length === 0 ?
                    <div className="text-[#a3a3a3] text-sm">
                      No messages yet. Choose a suggestion above or ask the agent what to do.
                    </div> :

                    messages.map((m, idx) => <MessageBubble key={idx} message={m} />)
                  }
                </div>
              </div>

              {/* Sticky composer with larger bottom padding and safe-area calc */}
              <div className="sticky bottom-0 z-10 bg-[#111111] border-t border-[#262626] px-5 pt-2 pb-6 md:pb-3 [padding-bottom:calc(env(safe-area-inset-bottom)+16px)]">
                <div className="flex flex-col md:flex-row gap-2">
                  <Textarea
                    ref={inputRef}
                    placeholder={`Ask ${selectedAgent.title} to help...`}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[#0d0d0d] border-[#262626] text-white min-h-[56px] max-h-40 resize-none"
                  />
                  {/* Buttons: 3/4 Send, 1/4 Stop on mobile; stacked on desktop */}
                  <div className="w-full md:w-[200px]">
                    <div className="grid grid-cols-4 md:grid-cols-1 gap-2">
                      {/* SEND spans 3/4 on mobile */}
                      <Button
                        onClick={sendMessage}
                        disabled={loading || !conversation}
                        className="col-span-3 bg-[#00d4ff] text-[#0a0a0a] hover:bg-[#0ea5e9] w-full"
                        aria-label="Send message"
                        title="Send"
                      >
                        <Send className="w-4 h-4 mr-2" /> Send
                      </Button>

                      {/* STOP spans 1/4 on mobile, icon-only */}
                      <Button
                        onClick={stopGeneration}
                        variant="outline"
                        disabled={isStopped || !conversation}
                        className="col-span-1 border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/10 w-full flex items-center justify-center"
                        aria-label="Stop agent"
                        title="Stop"
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer below conversation */}
        <div className="mt-3 flex items-start gap-2 text-[11px] text-[#a3a3a3]">
          <AlertCircle className="w-3.5 h-3.5 text-[#fbbf24] mt-0.5" />
          <p className="">Agents can make mistakes. Check important info.

          </p>
        </div>
      </div>
    </div>);

}
