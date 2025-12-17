import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Clock, Zap } from "lucide-react";

export default function MetaData() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
              <Megaphone className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Meta Data</h1>
          </div>
          <p className="text-[#a3a3a3] text-lg">
            Connect your Facebook Page, ingest content, and analyze psychographic signals.
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="bg-[#111111] border-[#262626]">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-[#0a0a0a]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-[#a3a3a3] text-lg mb-6 max-w-2xl mx-auto">
              Meta (Facebook) integration is currently in development. This feature will allow you to connect your Facebook Pages, analyze posts and comments for psychographic insights, and optimize your social media strategy.
            </p>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3 text-[#a3a3a3]">
                <Zap className="w-4 h-4 text-[#00d4ff]" />
                <span>Facebook Page connection</span>
              </div>
              <div className="flex items-center gap-3 text-[#a3a3a3]">
                <Zap className="w-4 h-4 text-[#00d4ff]" />
                <span>Post and comment ingestion</span>
              </div>
              <div className="flex items-center gap-3 text-[#a3a3a3]">
                <Zap className="w-4 h-4 text-[#00d4ff]" />
                <span>Psychographic audience analysis</span>
              </div>
              <div className="flex items-center gap-3 text-[#a3a3a3]">
                <Zap className="w-4 h-4 text-[#00d4ff]" />
                <span>Content optimization recommendations</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#262626] mt-6">
          <CardHeader className="p-6">
            <CardTitle className="text-white">How it will work</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 text-[#a3a3a3] text-sm space-y-2">
            <p>1) Connect your Meta account and grant permissions for Page access.</p>
            <p>2) Ingest recent posts and comments from selected Pages.</p>
            <p>3) Run psychographic analysis to understand audience motivations and engagement patterns.</p>
            <p>4) Get actionable recommendations for content strategy and ad targeting.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}