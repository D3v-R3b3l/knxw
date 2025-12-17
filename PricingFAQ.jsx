import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  CreditCard, 
  Zap, 
  Users, 
  Shield, 
  ArrowLeft,
  Check,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Clock,
  Bot,
  Target,
  Cloud,
  Brain
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const faqs = [
  {
    category: "Credits & Usage",
    icon: Zap,
    color: "from-[#00d4ff] to-[#0ea5e9]",
    questions: [
      {
        q: "What exactly is a 'credit' and how are they consumed?",
        a: "1 Credit = 1 psychographic profile analysis or update. Every time our AI analyzes a user's behavior to generate or refresh their psychological insights, it consumes 1 credit. This includes initial profiling from captured events, profile updates from new behavioral data, AI agent actions, and regeneration of insights. Basic event capture (page views, clicks) is completely free and unlimited."
      },
      {
        q: "Do page views, events, and integrations consume credits?",
        a: "No. Capturing events (page views, clicks, form interactions) is free and unlimited. AWS S3 exports, EventBridge streaming, and SES notifications are also included in your plan limits without consuming psychographic credits. Credits are only used for AI-powered analysis and agent actions."
      },
      {
        q: "How often do profiles get updated and consume credits?",
        a: "Our AI intelligently determines when to update profiles based on behavioral significance. Minor interactions may not trigger updates, while major actions (purchases, feature adoption, significant engagement patterns) will. Active users typically consume 3-8 credits per month, but this varies based on their activity level and complexity."
      },
      {
        q: "Can I control credit consumption and monitor usage?",
        a: "Yes. You can set analysis frequency (real-time, hourly, daily), configure minimum event thresholds for updates, pause analysis for specific user segments, and monitor real-time usage in your billing dashboard. You'll receive alerts at 80% and 95% of your monthly limit."
      },
      {
        q: "What happens with AI agents and credit usage?",
        a: "AI agents consume credits when they perform psychographic analysis or generate personalized content. Growth plans include up to 500 agent actions per month, while Pro plans have unlimited agent actions. Each agent action that requires psychographic processing counts as 1 credit."
      }
    ]
  },
  {
    category: "Plans & Billing",
    icon: CreditCard,
    color: "from-[#10b981] to-[#059669]",
    questions: [
      {
        q: "What's the difference between plan tiers?",
        a: "Builder (Free): 1,000 credits/month, launch psychographic intelligence into your app, real-time profiling, basic dashboards, JavaScript SDK, no content engine. Scale ($99): 50,000 credits included + $0.015 per 1k after, where behavior starts to affect money, increase conversions, reduce churn, personalize experiences, AI content engine, advanced segmentation. Infrastructure ($499): 250,000 credits included + $0.012 per 1k after, knXw becomes a system dependency, predict churn, market intelligence, batch analytics, priority support & SLA. Enterprise: Custom credits, organizational intelligence, dedicated infrastructure."
      },
      {
        q: "What AWS integrations are included in each plan?",
        a: "Developer: 100 S3 exports, 1K EventBridge events, 100 SES emails monthly. Growth: Unlimited S3 exports, 100K EventBridge events, 1K SES emails. Pro: Unlimited S3 exports, 1M EventBridge events, 10K SES emails. All plans include real-time streaming capabilities and automated export scheduling."
      },
      {
        q: "How does ROI Attribution pricing work?",
        a: "Developer: View-only attribution reports. Growth: Full Meta CAPI integration with 5,000 conversion forwards/month. Pro: Complete attribution with Meta + Google Ads + GA4, supporting 50,000 conversion forwards/month. All forwarded conversions include psychological context and attribution modeling."
      },
      {
        q: "What happens if I exceed my monthly limits?",
        a: "Scale: $0.015 per 1,000 credits after 50,000. Infrastructure: $0.012 per 1,000 credits after 250,000. AWS usage: Pay-as-you-go AWS rates. Conversion forwards: $0.001 per conversion. You'll receive alerts at 80% and 95% of your limits. All overages are clearly itemized on your next invoice. No service interruptions or throttling."
      },
      {
        q: "Can I change plans anytime?",
        a: "Yes. Upgrades are immediate with prorated billing. Downgrades take effect at your next billing cycle. Unused credits don't carry over, but existing data and configurations remain accessible. Annual billing saves 15% on all paid plans."
      }
    ]
  },
  {
    category: "Features & AI Agents",
    icon: Bot,
    color: "from-[#fbbf24] to-[#f59e0b]",
    questions: [
      {
        q: "What AI agents are available and how do they work?",
        a: "knXw includes 12+ specialized AI agents: Self-Optimizing Engagement Architect (auto-tunes personalization), Psycho-Forensic Debugger (diagnoses journey friction), Ethical AI Guardian (compliance monitoring), Growth Orchestrator, Churn Predictor, A/B Test Optimizer, and more. They work autonomously to analyze patterns and take actions based on your configured rules."
      },
      {
        q: "What are agent action limits?",
        a: "Developer: Agents are read-only (insights only, no actions). Growth: 500 agent actions per month (actions like sending emails, updating profiles, creating segments). Pro: Unlimited agent actions and custom automation workflows. Enterprise: Dedicated agent compute resources and custom agents."
      },
      {
        q: "How does the new AI-assisted onboarding work?",
        a: "Our 2024 onboarding system is fully AI-driven and contextual. Instead of static tutorials, an AI assistant guides you through personalized tasks based on your setup, answers questions in real-time, and validates your progress. It adapts to your role, existing data, and goals to create a unique learning path."
      },
      {
        q: "What's included in 'Advanced Analytics'?",
        a: "Pro plans include: Cohort analysis with psychological segmentation, advanced attribution modeling, custom dashboard creation, exportable reports with psychological context, full API access for custom integrations, batch analytics for large datasets, and temporal trend analysis with confidence scoring."
      }
    ]
  },
  {
    category: "Integrations & Technical",
    icon: Cloud,
    color: "from-[#ec4899] to-[#db2777]",
    questions: [
      {
        q: "How do AWS integrations work and what's the setup process?",
        a: "knXw connects to your AWS account via IAM roles or access keys. S3 integration automatically exports psychographic data in JSON/CSV formats. EventBridge streams real-time events to your workflows. SES sends personalized emails based on psychological triggers. Setup is guided through our interface with validation testing."
      },
      {
        q: "What ad platforms support ROI attribution?",
        a: "Meta (Facebook/Instagram) via Conversions API, Google Ads via Enhanced Conversions, and Google Analytics 4 via Measurement Protocol. We send conversion events with psychological context, enabling ad platforms to optimize for users similar to your best converters. All integrations include test mode and error tracking."
      },
      {
        q: "How accurate is the psychographic analysis?",
        a: "Our AI models achieve 95%+ accuracy for core personality traits and emotional states, validated against established psychological frameworks (Big Five, DISC, emotional intelligence models). Confidence scores are provided for all analyses, and our 'Explainable AI' features show exactly how conclusions were reached."
      },
      {
        q: "What about data privacy and GDPR compliance?",
        a: "knXw is built privacy-first: automatic PII detection and hashing, granular consent management, one-click data exports and deletions, audit logs for all data operations, and dynamic compliance monitoring. Our Ethical AI Guardian agent proactively flags potential privacy issues and dark patterns."
      },
      {
        q: "Can I export my data and integrations?",
        a: "Yes. All your data (events, profiles, insights, configurations) can be exported in standard formats (JSON, CSV). Integration configurations can be exported as Infrastructure-as-Code templates. We provide migration assistance for Enterprise customers and maintain data portability standards."
      }
    ]
  },
  {
    category: "Enterprise & Support",
    icon: Shield,
    color: "from-[#8b5cf6] to-[#7c3aed]",
    questions: [
      {
        q: "What enterprise features are available in 2024?",
        a: "SSO/SCIM integration, dedicated LLM instances, custom AI agent development, advanced compliance automation (GDPR/CCPA/HIPAA), SLA guarantees with 99.9% uptime, on-premises deployment options, white-label solutions, custom integration development, and dedicated customer success teams."
      },
      {
        q: "How does multi-tenancy and workspace isolation work?",
        a: "Each workspace is completely isolated with its own database partition, API keys, integration credentials, and user access controls. Row-level security ensures no data leakage between tenants. Enterprise customers can have multiple workspaces with centralized billing and management."
      },
      {
        q: "What support levels are provided?",
        a: "Developer: Community forum and documentation. Growth: Email support with 24-hour response time plus AI-assisted onboarding. Pro: Priority email support, monthly strategy calls, and dedicated success manager. Enterprise: 24/7 phone support, dedicated technical account manager, and custom SLA agreements."
      },
      {
        q: "Can I get custom pricing or contract terms?",
        a: "Yes. Enterprise customers can negotiate custom Master Service Agreements including liability caps, custom SLAs, data processing agreements, volume discounts, and specialized compliance requirements. We offer quarterly and annual contract terms with flexible payment options."
      }
    ]
  },
  {
    category: "Getting Started & Migration",
    icon: TrendingUp,
    color: "from-[#06b6d4] to-[#0891b2]",
    questions: [
      {
        q: "How long does implementation take in 2024?",
        a: "Basic setup takes 5-10 minutes (add JS snippet, verify tracking). First psychographic insights appear within 15-30 minutes of user activity. Full platform onboarding with AI assistance typically takes 2-3 hours across several sessions. Complex integrations (AWS, ad platforms) can be completed within a day."
      },
      {
        q: "What's included in the AI-assisted setup?",
        a: "Your personal AI assistant guides you through: Client app creation, tracking snippet installation, integration testing, first data analysis, engagement rule setup, and ongoing optimization recommendations. It adapts to your technical skill level and business goals."
      },
      {
        q: "Can I migrate from other analytics platforms?",
        a: "Yes. We provide migration guides for Google Analytics, Mixpanel, Amplitude, Segment, and custom solutions. Pro+ plans include assisted migration services to map existing events to knXw's psychographic framework. Historical data can often be imported and retroactively analyzed."
      },
      {
        q: "What's your refund and trial policy?",
        a: "14-day money-back guarantee on first-time annual subscriptions. Monthly subscriptions can be cancelled anytime with no penalties. Free Developer plan includes all core features with no time limit. Pro and Enterprise trials available with full feature access for qualified prospects."
      },
      {
        q: "How do I know if knXw is right for my business?",
        a: "knXw is ideal if you: want to understand user motivations beyond demographics, need personalized engagement at scale, require ROI attribution for ad spend, have compliance requirements, or want AI-driven insights. Our AI assistant can provide a personalized assessment during onboarding."
      }
    ]
  }
];

export default function PricingFAQ() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={createPageUrl('Landing')} 
            className="inline-flex items-center gap-2 text-[#00d4ff] hover:text-[#0ea5e9] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
              <HelpCircle className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Pricing FAQ
            </h1>
          </div>
          <p className="text-[#a3a3a3] text-lg">
            Everything you need to know about knXw's credit-based pricing, AI agents, integrations, and enterprise features.
          </p>
        </div>

        {/* Quick Links */}
        <Card className="bg-[#111111] border-[#262626] mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-white mb-4">Quick Jump to Section:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {faqs.slice(0, 6).map((category, index) => (
                <button
                  key={index}
                  onClick={() => document.getElementById(`section-${index}`).scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] transition-colors text-left"
                >
                  <category.icon className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-sm text-white">{category.category}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Updated Credit Calculator */}
        <Card className="bg-[#111111] border-[#262626] mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <DollarSign className="w-5 h-5 text-[#10b981]" />
              2024 Credit Usage & Feature Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-center mb-6">
              <div className="p-4 rounded-lg bg-[#1a1a1a]">
                <div className="text-2xl font-bold text-[#00d4ff] mb-2">~3-8</div>
                <div className="text-sm text-[#a3a3a3]">Credits per active user/month</div>
              </div>
              <div className="p-4 rounded-lg bg-[#1a1a1a]">
                <div className="text-2xl font-bold text-[#10b981] mb-2">6,250+</div>
                <div className="text-sm text-[#a3a3a3]">Users supported by 50K credits</div>
              </div>
              <div className="p-4 rounded-lg bg-[#1a1a1a]">
                <div className="text-2xl font-bold text-[#fbbf24] mb-2">$0.012</div>
                <div className="text-sm text-[#a3a3a3]">Per 1K overage (Infrastructure)</div>
              </div>
              <div className="p-4 rounded-lg bg-[#1a1a1a]">
                <div className="text-2xl font-bold text-[#ec4899] mb-2">12+</div>
                <div className="text-sm text-[#a3a3a3]">AI agents included</div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-[#0f0f0f] border border-[#262626]">
              <h4 className="font-semibold text-white mb-2">Builder - Free</h4>
              <p className="text-sm text-[#a3a3a3]">1,000 credits • Launch intelligence • Basic dashboards</p>
            </div>
            <div className="p-4 rounded-lg bg-[#0f0f0f] border border-[#10b981]/30">
              <h4 className="font-semibold text-white mb-2">Scale - $99</h4>
              <p className="text-sm text-[#a3a3a3]">50K credits + overage • Increase conversion • AI content</p>
            </div>
            <div className="p-4 rounded-lg bg-[#0f0f0f] border border-[#00d4ff]/30">
              <h4 className="font-semibold text-white mb-2">Infrastructure - $499</h4>
              <p className="text-sm text-[#a3a3a3]">250K credits + overage • System dependency • Priority SLA</p>
            </div>
            </div>
            <div className="mt-6 p-4 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-lg">
              <p className="text-[#00d4ff] text-sm">
                <Brain className="w-4 h-4 inline mr-2" />
                <strong>Pro tip:</strong> Credits are only consumed for AI analysis and agent actions. Event capture, AWS exports, and basic integrations are included in your plan limits without consuming psychographic credits.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} id={`section-${categoryIndex}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color}`}>
                  <category.icon className="w-6 h-6 text-[#0a0a0a]" />
                </div>
                <h2 className="text-2xl font-bold text-white">{category.category}</h2>
              </div>
              
              <div className="space-y-4">
                {category.questions.map((faq, faqIndex) => (
                  <Card key={faqIndex} className="bg-[#111111] border-[#262626]">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-white mb-3 text-lg">
                        {faq.q}
                      </h3>
                      <div className="text-[#e5e5e5] leading-relaxed">
                        {faq.a}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions - Updated */}
        <Card className="bg-gradient-to-r from-[#111111] to-[#0f0f0f] border-[#262626] mt-12">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-[#0a0a0a]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
            <p className="text-[#a3a3a3] mb-6 max-w-2xl mx-auto">
              Our AI assistant and support team are here to help you choose the right plan and get the most out of knXw's advanced psychographic analytics platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = 'mailto:support@knxw.app?subject=Pricing Question - 2024'}
                className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
              >
                Email Support Team
              </Button>
              <Button 
                onClick={() => window.location.href = 'https://calendly.com/knxw/pricing-consultation'}
                variant="outline" 
                className="border-[#262626] text-white hover:bg-[#262626]"
              >
                Schedule Demo Call
              </Button>
            </div>
            <div className="mt-6 text-sm text-[#6b7280]">
              <p>Average response time: &lt;4 hours • Available Monday-Friday, 9 AM - 6 PM EST</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}