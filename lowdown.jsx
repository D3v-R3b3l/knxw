import React, { useState } from 'react';
import {
  Brain,
  Database,
  Users,
  Code,
  Share2,
  Server,
  Activity,
  Zap,
  Shield,
  Bot,
  LayoutGrid,
  Route,
  FileCode,
  LogIn,
  ExternalLink,
  GitBranch,
  ArrowRight,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Folder,
  File,
  Settings,
  Target,
  MessageSquare
} from 'lucide-react';
import HeadManager from '../components/HeadManager';

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <section className="mb-6 border border-[#262626] bg-[#111111] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#00d4ff] flex-shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-[#6b7280] flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-[#6b7280] flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-[#262626]">
          {children}
        </div>
      )}
    </section>
  );
};

const FlowStep = ({ number, title, description, color = 'blue' }) => {
  const colors = {
    blue: 'bg-[#00d4ff] text-[#0a0a0a]',
    green: 'bg-[#10b981] text-white',
    purple: 'bg-[#8b5cf6] text-white',
    yellow: 'bg-[#fbbf24] text-[#0a0a0a]',
    pink: 'bg-[#ec4899] text-white'
  };

  return (
    <div className="flex items-start gap-3 sm:gap-4 mb-4">
      <div className={`w-8 h-8 rounded-full ${colors[color]} flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1`}>
        {number}
      </div>
      <div className="min-w-0">
        <h4 className="font-semibold text-white text-sm sm:text-base">{title}</h4>
        <p className="text-[#a3a3a3] text-sm mt-1">{description}</p>
      </div>
    </div>
  );
};

const FileTreeItem = ({ name, type, description, level = 0 }) => {
  const Icon = type === 'folder' ? Folder : File;
  const textColor = type === 'folder' ? 'text-[#fbbf24]' : 'text-[#00d4ff]';
  const paddingLeft = `${level * 1.5}rem`;
  
  return (
    <div className="flex items-start gap-2 py-1 text-xs sm:text-sm font-mono" style={{ paddingLeft }}>
      <Icon className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 ${textColor}`} />
      <div className="min-w-0">
        <span className="text-white font-medium">{name}</span>
        {description && <span className="text-[#6b7280] ml-2">// {description}</span>}
      </div>
    </div>
  );
};

const EntityCard = ({ name, description }) => (
  <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3 sm:p-4">
    <h4 className="font-bold text-white text-sm sm:text-base mb-1">{name}</h4>
    <p className="text-[#a3a3a3] text-xs sm:text-sm">{description}</p>
  </div>
);

const FunctionCard = ({ name, description, category }) => {
  const categoryColors = {
    core: 'bg-[#00d4ff]/20 text-[#00d4ff]',
    integration: 'bg-[#10b981]/20 text-[#10b981]',
    ai: 'bg-[#8b5cf6]/20 text-[#8b5cf6]',
    admin: 'bg-[#fbbf24]/20 text-[#fbbf24]'
  };

  return (
    <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-white text-sm sm:text-base">{name}</h4>
        <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[category] || categoryColors.core}`}>
          {category}
        </span>
      </div>
      <p className="text-[#a3a3a3] text-xs sm:text-sm">{description}</p>
    </div>
  );
};

export default function LowdownPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <HeadManager
        title="knXw Platform Lowdown"
        description="The internal grand manifest of the entire knXw platform architecture, systems, and logic."
        disableIndexing={true}
      />
      
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-[#262626]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-3 bg-gradient-to-br from-[#00d4ff]/10 to-[#0ea5e9]/10 rounded-2xl border border-[#00d4ff]/20 mb-4">
            <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-[#00d4ff]" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            knXw Platform Lowdown
          </h1>
          <p className="text-base sm:text-lg text-[#a3a3a3] max-w-2xl mx-auto">
            The comprehensive internal manifest of the knXw architecture, data flows, AI systems, and core logic.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        
        {/* System Architecture */}
        <CollapsibleSection title="System Architecture" icon={LayoutGrid} defaultOpen={true}>
          <p className="text-[#a3a3a3] mb-6 text-sm sm:text-base leading-relaxed">
            knXw operates as a distributed, cloud-native system designed for high-throughput data ingestion, 
            real-time AI processing, and scalable analytics.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#0a0a0a] border border-[#00d4ff]/30 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-[#00d4ff] mx-auto mb-2" />
              <h4 className="font-bold text-white mb-1">Frontend SPA</h4>
              <p className="text-xs text-[#a3a3a3]">React + Base44 SDK</p>
            </div>
            <div className="bg-[#0a0a0a] border border-[#10b981]/30 rounded-lg p-4 text-center">
              <Server className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
              <h4 className="font-bold text-white mb-1">API Gateway</h4>
              <p className="text-xs text-[#a3a3a3]">Deno Deploy Functions</p>
            </div>
            <div className="bg-[#0a0a0a] border border-[#8b5cf6]/30 rounded-lg p-4 text-center">
              <Database className="w-8 h-8 text-[#8b5cf6] mx-auto mb-2" />
              <h4 className="font-bold text-white mb-1">PostgreSQL DB</h4>
              <p className="text-xs text-[#a3a3a3]">Base44 Entities</p>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <h4 className="font-bold text-white mb-3 text-sm sm:text-base">Data Flow Architecture</h4>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#00d4ff] rounded-full flex-shrink-0"></div>
                <span className="text-[#a3a3a3]">User → Frontend SPA → API Gateway → Backend Services</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#10b981] rounded-full flex-shrink-0"></div>
                <span className="text-[#a3a3a3]">Backend Services ↔ PostgreSQL Database</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#fbbf24] rounded-full flex-shrink-0"></div>
                <span className="text-[#a3a3a3]">Processing Workers → External Services</span>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Data Lifecycle */}
        <CollapsibleSection title="Data Lifecycle" icon={Activity}>
          <p className="text-[#a3a3a3] mb-6 text-sm sm:text-base leading-relaxed">
            The journey of a single user interaction from raw data point to enriched, actionable psychographic insight.
          </p>
          
          <div className="space-y-4">
            <FlowStep 
              number="1" 
              title="User Action" 
              description="Click, scroll, page view, form submission" 
              color="blue" 
            />
            <FlowStep 
              number="2" 
              title="SDK Capture" 
              description="knxw.js batches events with context" 
              color="blue" 
            />
            <FlowStep 
              number="3" 
              title="Event Ingestion" 
              description="captureEvent API validates & stores" 
              color="green" 
            />
            <FlowStep 
              number="4" 
              title="Raw Storage" 
              description="CapturedEvent entity in PostgreSQL" 
              color="green" 
            />
            <FlowStep 
              number="5" 
              title="Live Processing" 
              description="liveProfileProcessor analyzes in real-time" 
              color="purple" 
            />
            <FlowStep 
              number="6" 
              title="AI Enrichment" 
              description="Multi-layer AI inference pipeline" 
              color="purple" 
            />
            <FlowStep 
              number="7" 
              title="Fused Profile" 
              description="UserPsychographicProfile updated" 
              color="yellow" 
            />
            <FlowStep 
              number="8" 
              title="Activation" 
              description="Segmentation, engagements, insights" 
              color="pink" 
            />
          </div>
        </CollapsibleSection>

        {/* AI Pipeline */}
        <CollapsibleSection title="AI Inference Pipeline" icon={Brain}>
          <p className="text-[#a3a3a3] mb-6 text-sm sm:text-base leading-relaxed">
            Hybrid AI combining heuristics, machine learning, and LLM reasoning for cost-effective psychographic analysis.
          </p>

          <div className="grid gap-4 mb-6">
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-5 h-5 text-[#00d4ff]" />
                <h4 className="font-bold text-white">Layer 1: Event Windowing</h4>
              </div>
              <p className="text-[#a3a3a3] text-sm">Gathers recent user events into behavioral snapshots (last 20 events, 5-minute windows)</p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-[#10b981]" />
                <h4 className="font-bold text-white">Layer 2: Heuristics & ML</h4>
              </div>
              <p className="text-[#a3a3a3] text-sm">Fast, rule-based + pattern-matching algorithms for initial scoring (engagement, risk, cognitive style)</p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-5 h-5 text-[#8b5cf6]" />
                <h4 className="font-bold text-white">Layer 3: Deep Inference (LLM)</h4>
              </div>
              <p className="text-[#a3a3a3] text-sm">Triggered for ambiguity - provides deep reasoning, nuance, and human-readable evidence</p>
            </div>

            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-[#fbbf24]" />
                <h4 className="font-bold text-white">Layer 4: Profile Fusion</h4>
              </div>
              <p className="text-[#a3a3a3] text-sm">Combines all layers with confidence weighting into unified psychographic profile</p>
            </div>
          </div>
        </CollapsibleSection>

        {/* File Structure */}
        <CollapsibleSection title="Complete File Structure" icon={FileCode}>
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 overflow-x-auto">
            <div className="font-mono text-xs sm:text-sm">
              <FileTreeItem name="/" type="folder" description="Root directory" level={0} />
              
              <FileTreeItem name="agents/" type="folder" description="AI Agent JSON configurations" level={1} />
              <FileTreeItem name="growth_orchestrator.json" type="file" description="Growth automation agent" level={2} />
              <FileTreeItem name="data_guardian.json" type="file" description="Data quality monitoring" level={2} />
              <FileTreeItem name="compliance_officer.json" type="file" description="Privacy & compliance" level={2} />
              <FileTreeItem name="docs_assistant.json" type="file" description="Documentation help" level={2} />
              <FileTreeItem name="..." type="file" description="12 total agents" level={2} />
              
              <FileTreeItem name="components/" type="folder" description="React components" level={1} />
              <FileTreeItem name="admin/" type="folder" description="Admin UI components" level={2} />
              <FileTreeItem name="dashboard/" type="folder" description="Dashboard components" level={2} />
              <FileTreeItem name="documentation/" type="folder" description="Docs page components" level={2} />
              <FileTreeItem name="onboarding/" type="folder" description="User onboarding flows" level={2} />
              <FileTreeItem name="ui/" type="folder" description="Shadcn/ui components" level={2} />
              <FileTreeItem name="..." type="folder" description="15 total component folders" level={2} />
              
              <FileTreeItem name="entities/" type="folder" description="Database entity schemas" level={1} />
              <FileTreeItem name="User.json" type="file" description="User entity schema" level={2} />
              <FileTreeItem name="CapturedEvent.json" type="file" description="Raw event data" level={2} />
              <FileTreeItem name="UserPsychographicProfile.json" type="file" description="AI-generated profiles" level={2} />
              <FileTreeItem name="ClientApp.json" type="file" description="Client applications" level={2} />
              <FileTreeItem name="..." type="file" description="85 total entities" level={2} />
              
              <FileTreeItem name="functions/" type="folder" description="Backend Deno Deploy functions" level={1} />
              <FileTreeItem name="lib/" type="folder" description="Shared backend utilities" level={2} />
              <FileTreeItem name="captureEvent.js" type="file" description="Core event ingestion" level={2} />
              <FileTreeItem name="liveProfileProcessor.js" type="file" description="Real-time AI processing" level={2} />
              <FileTreeItem name="createClientApp.js" type="file" description="App creation endpoint" level={2} />
              <FileTreeItem name="..." type="file" description="120+ total functions" level={2} />
              
              <FileTreeItem name="pages/" type="folder" description="React page components" level={1} />
              <FileTreeItem name="Dashboard.js" type="file" description="Main analytics dashboard" level={2} />
              <FileTreeItem name="Profiles.js" type="file" description="Unified customer profiles" level={2} />
              <FileTreeItem name="MyApps.js" type="file" description="Client app management" level={2} />
              <FileTreeItem name="..." type="file" description="35 total pages" level={2} />
              
              <FileTreeItem name="Layout.js" type="file" description="Global app layout" level={1} />
            </div>
          </div>
        </CollapsibleSection>

        {/* Core Entities */}
        <CollapsibleSection title="Core Database Entities" icon={Database}>
          <p className="text-[#a3a3a3] mb-6 text-sm sm:text-base leading-relaxed">
            Base44-managed PostgreSQL entities with RLS security and SDK access.
          </p>
          
          <div className="grid gap-4">
            <EntityCard 
              name="UserPsychographicProfile" 
              description="Core AI-generated psychological profile with motivations, personality traits, emotional state, and reasoning"
            />
            <EntityCard 
              name="CapturedEvent" 
              description="Raw behavioral events from user interactions (clicks, page views, forms)"
            />
            <EntityCard 
              name="PsychographicInsight" 
              description="AI-generated actionable insights with confidence scores and recommendations"
            />
            <EntityCard 
              name="CoreCustomer" 
              description="Unified customer record linking email hashes and external IDs across systems"
            />
            <EntityCard 
              name="ClientApp" 
              description="Client application configurations with API keys and authorized domains"
            />
            <EntityCard 
              name="EngagementRule" 
              description="Automated engagement triggers based on psychographic conditions"
            />
            <EntityCard 
              name="ABTest" 
              description="A/B test configurations for engagement optimization"
            />
            <EntityCard 
              name="BillingSubscription" 
              description="User subscription plans and usage tracking"
            />
          </div>
          
          <div className="mt-6 bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <p className="text-[#6b7280] text-xs sm:text-sm">
              <strong className="text-white">Total Entities:</strong> 85 entities covering users, events, profiles, insights, integrations, billing, compliance, and system logs
            </p>
          </div>
        </CollapsibleSection>

        {/* Backend Functions */}
        <CollapsibleSection title="Backend Functions" icon={Server}>
          <p className="text-[#a3a3a3] mb-6 text-sm sm:text-base leading-relaxed">
            Deno Deploy serverless functions handling all backend logic and external integrations.
          </p>
          
          <div className="grid gap-4">
            <FunctionCard 
              name="captureEvent.js" 
              description="Core event ingestion endpoint with validation and rate limiting"
              category="core"
            />
            <FunctionCard 
              name="liveProfileProcessor.js" 
              description="Real-time AI processing of events into psychographic profiles"
              category="ai"
            />
            <FunctionCard 
              name="syncHubSpot.js" 
              description="Bidirectional HubSpot CRM data synchronization"
              category="integration"
            />
            <FunctionCard 
              name="metaIngestPage.js" 
              description="Facebook/Instagram page data ingestion and analysis"
              category="integration"
            />
            <FunctionCard 
              name="batchAnalytics.js" 
              description="Deep segmentation and trend analysis processing"
              category="ai"
            />
            <FunctionCard 
              name="stripeWebhookHandler.js" 
              description="Stripe billing webhook processing and subscription management"
              category="integration"
            />
            <FunctionCard 
              name="auditLogger.js" 
              description="Comprehensive audit trail and compliance logging"
              category="admin"
            />
            <FunctionCard 
              name="triggerCheckin.js" 
              description="AI-powered contextual user engagement triggers"
              category="ai"
            />
          </div>
          
          <div className="mt-6 bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <p className="text-[#6b7280] text-xs sm:text-sm">
              <strong className="text-white">Total Functions:</strong> 120+ backend functions covering ingestion, AI processing, integrations, billing, admin tools, and system utilities
            </p>
          </div>
        </CollapsibleSection>

        {/* AI Agents */}
        <CollapsibleSection title="AI Agents" icon={Bot}>
          <p className="text-[#a3a3a3] mb-6 text-sm sm:text-base leading-relaxed">
            Specialized AI agents automating complex workflows and providing intelligent assistance.
          </p>
          
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#10b981]" />
                  Growth Orchestrator
                </h4>
                <p className="text-[#a3a3a3] text-sm">Analyzes growth opportunities and creates engagement campaigns</p>
              </div>
              
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#fbbf24]" />
                  Data Guardian
                </h4>
                <p className="text-[#a3a3a3] text-sm">Monitors data quality and identifies inconsistencies</p>
              </div>
              
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#8b5cf6]" />
                  Compliance Officer
                </h4>
                <p className="text-[#a3a3a3] text-sm">Manages privacy requests and regulatory compliance</p>
              </div>
              
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#ec4899]" />
                  Psycho-Forensic Debugger
                </h4>
                <p className="text-[#a3a3a3] text-sm">Diagnoses user friction through psychological journey reconstruction</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <p className="text-[#6b7280] text-xs sm:text-sm">
              <strong className="text-white">Total Agents:</strong> 16 specialized AI agents covering growth, compliance, optimization, content generation, and user assistance
            </p>
          </div>
        </CollapsibleSection>

        {/* User Journeys */}
        <CollapsibleSection title="User Journey Maps" icon={Route}>
          <p className="text-[#a3a3a3] mb-6 text-sm sm:text-base leading-relaxed">
            End-to-end user experiences across key platform features and workflows.
          </p>
          
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <LogIn className="w-4 h-4 text-[#00d4ff]" />
                Onboarding & App Creation
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-[#6b7280]" />
                  <span className="text-[#a3a3a3]">Landing page → Authentication → Dashboard (empty state)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-[#6b7280]" />
                  <span className="text-[#a3a3a3]">MyApps → createClientApp function → SDK snippet generated</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#10b981]" />
                Analytics Dashboard
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-[#6b7280]" />
                  <span className="text-[#a3a3a3]">Dashboard load → DashboardProvider → Entity fetches</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-[#6b7280]" />
                  <span className="text-[#a3a3a3]">Data aggregation → Charts render → CheckIn triggers</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#8b5cf6]" />
                CRM Integration
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-[#6b7280]" />
                  <span className="text-[#a3a3a3]">Data import → Identity resolution → Profile linking</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-[#6b7280]" />
                  <span className="text-[#a3a3a3]">Psychographic analysis → CRM write-back sync</span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Integrations */}
        <CollapsibleSection title="External Integrations" icon={Share2}>
          <p className="text-[#a3a3a3] mb-6 text-sm sm:text-base leading-relaxed">
            Seamless connections with essential third-party services and platforms.
          </p>
          
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-[#ff6b35] rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <h4 className="font-bold text-white mb-1">Stripe</h4>
                <p className="text-xs text-[#a3a3a3]">Billing & Subscriptions</p>
              </div>
              
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-[#ff5722] rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <h4 className="font-bold text-white mb-1">HubSpot</h4>
                <p className="text-xs text-[#a3a3a3]">CRM Sync</p>
              </div>
              
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-[#1877f2] rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <h4 className="font-bold text-white mb-1">Meta</h4>
                <p className="text-xs text-[#a3a3a3]">Social Data & CAPI</p>
              </div>
              
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-[#4285f4] rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <h4 className="font-bold text-white mb-1">Google</h4>
                <p className="text-xs text-[#a3a3a3]">GA4 & Ads API</p>
              </div>
              
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-[#ff9900] rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <h4 className="font-bold text-white mb-1">AWS</h4>
                <p className="text-xs text-[#a3a3a3]">S3, EventBridge, SES</p>
              </div>
              
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-[#0078d4] rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Az</span>
                </div>
                <h4 className="font-bold text-white mb-1">Azure</h4>
                <p className="text-xs text-[#a3a3a3]">Blob, Event Hubs</p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Security & Compliance */}
        <CollapsibleSection title="Security & Compliance" icon={Shield}>
          <div className="grid gap-4">
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#10b981]" />
                Authentication & Authorization
              </h4>
              <ul className="space-y-1 text-sm text-[#a3a3a3]">
                <li>• Base44 OAuth-based authentication (Google Sign-In)</li>
                <li>• Role-Based Access Control (admin/user roles)</li>
                <li>• Entity-level Row-Level Security (RLS)</li>
              </ul>
            </div>

            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#8b5cf6]" />
                Data Encryption
              </h4>
              <ul className="space-y-1 text-sm text-[#a3a3a3]">
                <li>• At-rest encryption for all PostgreSQL data</li>
                <li>• HTTPS/SSL for all data in transit</li>
                <li>• Envelope encryption with KMS for API keys</li>
              </ul>
            </div>

            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#fbbf24]" />
                Compliance Features
              </h4>
              <ul className="space-y-1 text-sm text-[#a3a3a3]">
                <li>• GDPR/CCPA data export and deletion</li>
                <li>• Comprehensive audit logging</li>
                <li>• PII sanitization and validation</li>
                <li>• Rate limiting and abuse protection</li>
              </ul>
            </div>
          </div>
        </CollapsibleSection>

        {/* Platform Stats */}
        <div className="mt-8 bg-gradient-to-r from-[#111111] to-[#0f0f0f] border border-[#262626] rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Platform Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#00d4ff]">85</div>
              <div className="text-xs sm:text-sm text-[#a3a3a3]">Database Entities</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#10b981]">120+</div>
              <div className="text-xs sm:text-sm text-[#a3a3a3]">Backend Functions</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#8b5cf6]">16</div>
              <div className="text-xs sm:text-sm text-[#a3a3a3]">AI Agents</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#fbbf24]">35</div>
              <div className="text-xs sm:text-sm text-[#a3a3a3]">User Pages</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}