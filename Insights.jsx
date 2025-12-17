import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle, Brain, Sparkles, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import ExplainabilityView from "../components/insights/ExplainabilityView";
import { safeFormatDate } from "../components/utils/datetime";
import PageHeader from '../components/ui/PageHeader';

export default function InsightsPage() {
  const [selectedInsight, setSelectedInsight] = useState(null);

  const { data: insights = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      // CRITICAL: Load only non-demo insights
      const data = await base44.entities.PsychographicInsight.filter({ is_demo: false }, '-created_date', 50);
      return data;
    },
  });

  const getInsightIcon = (type) => {
    const icons = {
      behavioral_pattern: TrendingUp,
      emotional_trigger: AlertCircle,
      motivation_shift: Sparkles,
      engagement_optimization: CheckCircle,
      risk_assessment: Brain
    };
    return icons[type] || Lightbulb;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      critical: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return colors[priority] || colors.medium;
  };

  const groupedInsights = insights.reduce((acc, insight) => {
    const type = insight.insight_type || 'general'; // Default to 'general' if type is missing
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(insight);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8">
        <PageHeader
          title="AI Insights"
          description="Psychographic intelligence and behavioral patterns"
          icon={Brain}
          docSection="ai-inference"
          actions={
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-[#262626] text-white hover:bg-[#1a1a1a]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          }
        />

        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <Brain className="w-8 h-8 text-[#00d4ff] animate-spin mx-auto mb-4" />
              <p className="text-[#a3a3a3]">Analyzing insights...</p>
            </div>
          ) : error ? (
            <Card className="bg-[#1a1a1a] border-[#262626]">
              <CardContent className="py-12 text-center">
                <p className="text-red-400">Error loading insights: {error.message}</p>
              </CardContent>
            </Card>
          ) : insights.length === 0 ? (
            <Card className="bg-[#1a1a1a] border-[#262626]">
              <CardContent className="py-12 text-center">
                <Lightbulb className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                <p className="text-[#a3a3a3]">No insights generated yet</p>
                <p className="text-sm text-[#6b7280] mt-2">
                  Insights will appear as we analyze user behavior patterns
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedInsights).map(([type, typeInsights]) => {
                const IconComponent = getInsightIcon(type);
                return (
                  <div key={type}>
                    <div className="flex items-center gap-3 mb-4">
                      <IconComponent className="w-6 h-6 text-[#00d4ff]" />
                      <h2 className="text-xl font-bold text-white capitalize">
                        {type.replace(/_/g, ' ')}
                      </h2>
                      <Badge variant="outline" className="border-[#00d4ff]/30 text-[#00d4ff]">
                        {typeInsights.length}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {typeInsights.map((insight, index) => (
                        <motion.div
                          key={insight.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="bg-[#1a1a1a] border-[#262626] hover:border-[#00d4ff]/30 transition-colors cursor-pointer"
                                onClick={() => setSelectedInsight(insight)}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-white text-lg">{insight.title || 'Untitled Insight'}</CardTitle>
                                <Badge className={`${getPriorityColor(insight.priority)}`}>
                                  {insight.priority || 'medium'}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-[#a3a3a3] text-sm mb-4">{insight.description || 'No description available'}</p>

                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Brain className="w-4 h-4 text-[#00d4ff]" />
                                  <span className="text-[#a3a3a3]">
                                    Confidence: {((insight.confidence_score || 0) * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <span className="text-[#6b7280]">
                                  {safeFormatDate(insight.created_date)}
                                </span>
                              </div>

                              {insight.actionable_recommendations && insight.actionable_recommendations.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-[#262626]">
                                  <p className="text-xs text-[#a3a3a3] mb-2">Recommendations:</p>
                                  <ul className="space-y-1">
                                    {insight.actionable_recommendations.slice(0, 2).map((rec, idx) => (
                                      <li key={idx} className="text-sm text-white flex items-start gap-2">
                                        <CheckCircle className="w-3 h-3 text-[#10b981] mt-0.5 flex-shrink-0" />
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  {insight.actionable_recommendations.length > 2 && (
                                    <Button
                                      variant="link"
                                      className="text-[#00d4ff] p-0 h-auto mt-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedInsight(insight);
                                      }}
                                    >
                                      View all {insight.actionable_recommendations.length} recommendations
                                    </Button>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedInsight && (
            <ExplainabilityView
              insight={selectedInsight}
              onClose={() => setSelectedInsight(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}