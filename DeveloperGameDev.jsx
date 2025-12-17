import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gamepad2, Code, Zap, Book, PlayCircle, Webhook, Gift, Target, TrendingDown } from 'lucide-react';
import GameDevSDKDoc from '../components/documentation/GameDevSDKDoc';

export default function DeveloperGameDevPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ec4899] to-[#db2777] rounded-xl flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                GameDev SDK
              </h1>
              <p className="text-[#a3a3a3]">Real-time psychographic intelligence for games</p>
            </div>
          </div>
          
          <p className="text-lg text-[#a3a3a3] max-w-4xl mb-6">
            Integrate knXw into Unity, Unreal Engine, Godot, or PlayFab to deliver adaptive difficulty, 
            personalized rewards, player retention insights, and real-time motivation tracking.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => document.getElementById('quickstart').scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#ec4899] hover:bg-[#db2777] text-white"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Quick Start Guide
            </Button>
            <Button 
              variant="outline"
              className="border-[#262626] text-white hover:bg-[#1a1a1a]"
            >
              <Code className="w-4 h-4 mr-2" />
              View Code Examples
            </Button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-[#111111] border-[#262626] hover:border-[#ec4899]/50 transition-colors">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-[#ec4899]/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-[#ec4899]" />
              </div>
              <h3 className="font-semibold text-white mb-2">Player Motivation</h3>
              <p className="text-sm text-[#a3a3a3]">
                Understand what drives each player: achievement, social, exploration, or creativity.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/50 transition-colors">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-[#00d4ff]/20 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-5 h-5 text-[#00d4ff]" />
              </div>
              <h3 className="font-semibold text-white mb-2">Adaptive Difficulty</h3>
              <p className="text-sm text-[#a3a3a3]">
                Dynamically adjust game difficulty based on player psychology and performance.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626] hover:border-[#fbbf24]/50 transition-colors">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-[#fbbf24]/20 rounded-lg flex items-center justify-center mb-4">
                <Gift className="w-5 h-5 text-[#fbbf24]" />
              </div>
              <h3 className="font-semibold text-white mb-2">Smart Rewards</h3>
              <p className="text-sm text-[#a3a3a3]">
                Deliver personalized rewards that resonate with each player's motivations.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626] hover:border-[#10b981]/50 transition-colors">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-[#10b981]/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingDown className="w-5 h-5 text-[#10b981]" />
              </div>
              <h3 className="font-semibold text-white mb-2">Churn Prevention</h3>
              <p className="text-sm text-[#a3a3a3]">
                Identify at-risk players and get intervention recommendations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Stats */}
        <Card className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] border-[#262626] mb-12">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-[#00d4ff] mb-2">&lt;150ms</div>
                <div className="text-sm text-[#a3a3a3]">p95 Latency</div>
                <div className="text-xs text-[#666666] mt-1">Edge-optimized</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#10b981] mb-2">1000</div>
                <div className="text-sm text-[#a3a3a3]">Requests/min</div>
                <div className="text-xs text-[#666666] mt-1">Per API key</div>
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

        {/* Main Documentation */}
        <div id="quickstart">
          <GameDevSDKDoc />
        </div>
      </div>
    </div>
  );
}