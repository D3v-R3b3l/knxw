import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Book, Zap, Key, Activity, Webhook, PlayCircle, Gamepad2, ArrowRight, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function DevelopersPage() {
  const quickstartSteps = [
    {
      number: 1,
      title: "Get Your API Key",
      description: "Create an API key from your dashboard to authenticate requests",
      link: createPageUrl('DeveloperKeys'),
      linkText: "Manage Keys"
    },
    {
      number: 2,
      title: "Make Your First Request",
      description: "Send an event and start building psychographic profiles",
      link: createPageUrl('DeveloperPlayground'),
      linkText: "Try Playground"
    },
    {
      number: 3,
      title: "Integrate Your App",
      description: "Use our SDK or REST API to integrate knXw into your application",
      link: createPageUrl('Documentation'),
      linkText: "View Docs"
    }
  ];

  const apiEndpoints = [
    {
      method: "POST",
      path: "/api/v1/events",
      description: "Ingest behavioral events to build psychographic profiles",
      icon: Activity,
      color: "text-[#10b981]"
    },
    {
      method: "POST",
      path: "/api/v1/profiles",
      description: "Retrieve detailed psychographic profile for a user",
      icon: Code,
      color: "text-[#00d4ff]"
    },
    {
      method: "POST",
      path: "/api/v1/insights",
      description: "Get AI-powered insights and recommendations",
      icon: Zap,
      color: "text-[#fbbf24]"
    },
    {
      method: "POST",
      path: "/api/v1/recommendations",
      description: "Generate personalized recommendations based on psychology",
      icon: PlayCircle,
      color: "text-[#ec4899]"
    }
  ];

  const gamedevEndpoints = [
    {
      method: "POST",
      path: "/api/v1/gamedev/motivation",
      description: "Get player's primary motivations and player type",
      icon: Zap,
      color: "text-[#ec4899]"
    },
    {
      method: "POST",
      path: "/api/v1/gamedev/difficulty",
      description: "Adaptive difficulty recommendations based on psychology",
      icon: Activity,
      color: "text-[#00d4ff]"
    },
    {
      method: "POST",
      path: "/api/v1/gamedev/reward",
      description: "Personalized reward recommendations for players",
      icon: Gamepad2,
      color: "text-[#fbbf24]"
    },
    {
      method: "POST",
      path: "/api/v1/gamedev/churn",
      description: "Churn risk scoring and retention recommendations",
      icon: Activity,
      color: "text-[#10b981]"
    }
  ];

  const features = [
    {
      icon: Key,
      title: "API Key Management",
      description: "Secure key generation, rotation, and scoping for your applications",
      link: createPageUrl('DeveloperKeys'),
      color: "from-[#00d4ff] to-[#0ea5e9]"
    },
    {
      icon: Activity,
      title: "Usage Dashboard",
      description: "Monitor API usage, track rate limits, and analyze performance",
      link: createPageUrl('DeveloperUsage'),
      color: "from-[#10b981] to-[#059669]"
    },
    {
      icon: Gamepad2,
      title: "GameDev SDK",
      description: "Real-time psychographic intelligence for Unity, Unreal, and more",
      link: createPageUrl('DeveloperGameDev'),
      color: "from-[#ec4899] to-[#db2777]"
    },
    {
      icon: Book,
      title: "Complete Documentation",
      description: "Comprehensive guides, examples, and API reference",
      link: createPageUrl('Documentation'),
      color: "from-[#8b5cf6] to-[#7c3aed]"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full px-4 py-2 mb-6">
            <Code className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-sm text-[#00d4ff] font-medium">knXw Developer Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#a3a3a3] bg-clip-text text-transparent">
            Build with Psychographic Intelligence
          </h1>
          
          <p className="text-xl text-[#a3a3a3] max-w-3xl mx-auto mb-8">
            REST API and SDK to integrate real-time psychographic analytics, AI-powered insights, 
            and personalized recommendations into your applications and games.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button 
              onClick={() => window.location.href = createPageUrl('DeveloperPlayground')}
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Try the Playground
            </Button>
            <Button 
              onClick={() => window.location.href = createPageUrl('Documentation')}
              variant="outline"
              className="border-[#262626] text-white hover:bg-[#1a1a1a]"
            >
              <Book className="w-4 h-4 mr-2" />
              Read Documentation
            </Button>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#fbbf24]" />
            Quick Start Guide
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {quickstartSteps.map((step) => (
              <Card 
                key={step.number}
                className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/50 transition-colors cursor-pointer group"
                onClick={() => window.location.href = step.link}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#00d4ff]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[#00d4ff] font-bold">{step.number}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[#a3a3a3] mb-4">{step.description}</p>
                      <div className="flex items-center gap-2 text-[#00d4ff] text-sm font-medium group-hover:gap-3 transition-all">
                        <span>{step.linkText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Developer Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card 
                key={feature.title}
                className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/30 transition-all cursor-pointer group"
                onClick={() => window.location.href = feature.link}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#a3a3a3]">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* REST API Endpoints */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">REST API Endpoints</h2>
          <div className="grid gap-4">
            {apiEndpoints.map((endpoint) => (
              <Card key={endpoint.path} className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center flex-shrink-0">
                      <endpoint.icon className={`w-5 h-5 ${endpoint.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-[#10b981]/20 text-[#10b981]">{endpoint.method}</Badge>
                        <code className="text-sm text-[#00d4ff] font-mono">{endpoint.path}</code>
                      </div>
                      <p className="text-sm text-[#a3a3a3]">{endpoint.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* GameDev SDK Section */}
        <Card className="bg-gradient-to-r from-[#ec4899]/10 to-[#db2777]/10 border-[#ec4899]/30 mb-16">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white mb-2">
                  <Gamepad2 className="w-6 h-6 text-[#ec4899]" />
                  GameDev SDK
                </CardTitle>
                <CardDescription className="text-[#a3a3a3]">
                  Real-time psychographic intelligence for games. Adaptive difficulty, personalized rewards, and churn prevention.
                </CardDescription>
              </div>
              <Button 
                onClick={() => window.location.href = createPageUrl('DeveloperGameDev')}
                className="bg-[#ec4899] hover:bg-[#db2777] text-white"
              >
                Explore GameDev SDK
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {gamedevEndpoints.map((endpoint) => (
                <div key={endpoint.path} className="flex items-center gap-4 p-4 bg-[#0a0a0a]/50 rounded-lg">
                  <div className="w-8 h-8 bg-[#1a1a1a] rounded-lg flex items-center justify-center flex-shrink-0">
                    <endpoint.icon className={`w-4 h-4 ${endpoint.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="border-[#ec4899]/30 text-[#ec4899] text-xs">
                        {endpoint.method}
                      </Badge>
                      <code className="text-xs text-[#e5e5e5] font-mono">{endpoint.path}</code>
                    </div>
                    <p className="text-xs text-[#a3a3a3]">{endpoint.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white">Platform Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-[#00d4ff] mb-2">&lt;150ms</div>
                <div className="text-sm text-[#a3a3a3]">p95 Latency</div>
                <div className="text-xs text-[#666666] mt-1">Edge-optimized endpoints</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#10b981] mb-2">1000</div>
                <div className="text-sm text-[#a3a3a3]">Requests/min</div>
                <div className="text-xs text-[#666666] mt-1">Per API key default</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#ec4899] mb-2">99.9%</div>
                <div className="text-sm text-[#a3a3a3]">Uptime SLA</div>
                <div className="text-xs text-[#666666] mt-1">Enterprise tier</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#fbbf24] mb-2">HMAC</div>
                <div className="text-sm text-[#a3a3a3]">Webhook Security</div>
                <div className="text-xs text-[#666666] mt-1">SHA-256 signed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}