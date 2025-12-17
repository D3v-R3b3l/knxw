
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target, 
  Loader2, 
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Calendar,
  BarChart3,
  HelpCircle // Added HelpCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AnimatedLine from '../components/charts/AnimatedLine';
import NetworkGraph from '../components/charts/NetworkGraph';
import { Link } from 'react-router-dom'; // Added Link
import { createPageUrl } from '@/utils'; // Added createPageUrl

export default function PredictivePsychographicsPage() {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    setIsLoading(true);
    try {
      const appsList = await base44.entities.ClientApp.list('-created_date', 50);
      setApps(appsList);
      if (appsList.length > 0) {
        setSelectedApp(appsList[0]);
      }
    } catch (error) {
      console.error('Failed to load apps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePredictions = async () => {
    if (!selectedApp) return;

    setIsGenerating(true);

    try {
      // Load recent profiles for analysis
      const profiles = await base44.entities.UserPsychographicProfile.filter(
        { is_demo: false },
        '-last_analyzed',
        100
      );

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze psychographic profile data to generate predictive insights about future user behavior.

Number of profiles analyzed: ${profiles.length}

Sample profile data:
${JSON.stringify(profiles.slice(0, 5).map(p => ({
  cognitive_style: p.cognitive_style,
  risk_profile: p.risk_profile,
  motivations: p.motivation_stack_v2?.slice(0, 2),
  personality: p.personality_traits,
  staleness: p.staleness_score
})), null, 2)}

Generate comprehensive predictions:

1. **Behavior Trend Forecasts**: Predict how user behavior patterns will evolve over the next 30 days
2. **Churn Risk Predictions**: Identify which psychographic profiles are most at risk of churning
3. **Conversion Likelihood**: Predict which psychological profiles are most likely to convert
4. **Engagement Patterns**: Forecast optimal engagement times and channels by psychology
5. **Motivation Shifts**: Predict likely changes in user motivations over time

Return detailed JSON with actionable predictions.`,
        response_json_schema: {
          type: "object",
          properties: {
            behavior_forecasts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  psychographic_profile: { type: "string" },
                  predicted_trend: { type: "string" },
                  confidence: { type: "number" },
                  time_horizon_days: { type: "number" },
                  recommended_actions: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            churn_predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  segment_name: { type: "string" },
                  churn_probability: { type: "number" },
                  risk_factors: {
                    type: "array",
                    items: { type: "string" }
                  },
                  intervention_strategy: { type: "string" },
                  expected_impact: { type: "string" }
                }
              }
            },
            conversion_predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  profile_type: { type: "string" },
                  conversion_probability: { type: "number" },
                  optimal_messaging: { type: "string" },
                  estimated_time_to_convert: { type: "string" }
                }
              }
            },
            engagement_forecasts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  psychographic_segment: { type: "string" },
                  optimal_channel: { type: "string" },
                  optimal_timing: { type: "string" },
                  predicted_engagement_rate: { type: "number" }
                }
              }
            }
          }
        }
      });

      setPredictions(response);
      
      toast({
        title: 'Predictions Generated',
        description: 'AI has analyzed your user base and generated predictive insights'
      });
    } catch (error) {
      console.error('Failed to generate predictions:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate predictions',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed]">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2"> {/* Added div for h1 and Link */}
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Predictive Psychographics
                  </h1>
                  <Link to={`${createPageUrl('Documentation')}#predictive-psychographics`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-[#6b7280] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10"
                      title="View predictive AI documentation"
                    >
                      <HelpCircle className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <p className="text-[#a3a3a3] text-lg">
                AI-powered predictions of future user behavior based on psychological profiles
              </p>
            </div>
            <Button
              onClick={generatePredictions}
              disabled={isGenerating || !selectedApp}
              className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Predictions
                </>
              )}
            </Button>
          </div>
        </div>

        {/* App Selector */}
        {apps.length > 1 && (
          <Card className="bg-[#111111] border-[#262626] mb-8">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#a3a3a3]">Application:</span>
                <select
                  value={selectedApp?.id || ''}
                  onChange={(e) => setSelectedApp(apps.find(a => a.id === e.target.value))}
                  className="bg-[#0a0a0a] border border-[#262626] text-white rounded-lg px-4 py-2 flex-1"
                >
                  {apps.map(app => (
                    <option key={app.id} value={app.id}>{app.name}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {predictions ? (
          <Tabs defaultValue="behavior" className="space-y-6">
            <TabsList className="bg-[#111111] border border-[#262626]">
              <TabsTrigger value="behavior" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white">
                Behavior Forecasts
              </TabsTrigger>
              <TabsTrigger value="churn" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white">
                Churn Predictions
              </TabsTrigger>
              <TabsTrigger value="conversion" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white">
                Conversion Likelihood
              </TabsTrigger>
              <TabsTrigger value="engagement" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white">
                Engagement Timing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="behavior" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {predictions.behavior_forecasts?.map((forecast, index) => (
                  <Card key={index} className="bg-[#111111] border-[#262626]">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-base">{forecast.psychographic_profile}</CardTitle>
                        <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] border-none">
                          {Math.round(forecast.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-[#a3a3a3] mb-2">Predicted Trend:</p>
                        <p className="text-white">{forecast.predicted_trend}</p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                        <Calendar className="w-4 h-4" />
                        <span>{forecast.time_horizon_days} days forecast</span>
                      </div>

                      <div className="pt-3 border-t border-[#262626]">
                        <p className="text-sm font-semibold text-white mb-2">Recommended Actions:</p>
                        <ul className="space-y-1">
                          {forecast.recommended_actions?.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-[#a3a3a3]">
                              <ChevronRight className="w-4 h-4 text-[#8b5cf6] mt-0.5 flex-shrink-0" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="churn" className="space-y-6">
              <div className="grid gap-6">
                {predictions.churn_predictions?.map((prediction, index) => (
                  <Card key={index} className="bg-[#111111] border-[#262626]">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{prediction.segment_name}</CardTitle>
                        <Badge className={`border-none ${
                          prediction.churn_probability > 0.7
                            ? 'bg-[#ef4444]/20 text-[#ef4444]'
                            : prediction.churn_probability > 0.4
                            ? 'bg-[#fbbf24]/20 text-[#fbbf24]'
                            : 'bg-[#10b981]/20 text-[#10b981]'
                        }`}>
                          {Math.round(prediction.churn_probability * 100)}% churn risk
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-[#a3a3a3] mb-2">Risk Factors:</p>
                        <ul className="space-y-1">
                          {prediction.risk_factors?.map((factor, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-[#e5e5e5]">
                              <AlertTriangle className="w-4 h-4 text-[#fbbf24] mt-0.5 flex-shrink-0" />
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg p-4">
                        <p className="text-sm font-semibold text-[#00d4ff] mb-2">Intervention Strategy</p>
                        <p className="text-sm text-[#e5e5e5]">{prediction.intervention_strategy}</p>
                        <p className="text-xs text-[#a3a3a3] mt-2">
                          Expected Impact: <span className="text-[#10b981] font-semibold">{prediction.expected_impact}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="conversion" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {predictions.conversion_predictions?.map((prediction, index) => (
                  <Card key={index} className="bg-[#111111] border-[#262626]">
                    <CardHeader>
                      <CardTitle className="text-white text-base">{prediction.profile_type}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-[#10b981] mb-2">
                          {Math.round(prediction.conversion_probability * 100)}%
                        </div>
                        <p className="text-sm text-[#a3a3a3]">Conversion Probability</p>
                      </div>

                      <div className="pt-3 border-t border-[#262626]">
                        <p className="text-xs text-[#6b7280] mb-1">Optimal Messaging:</p>
                        <p className="text-sm text-white">{prediction.optimal_messaging}</p>
                      </div>

                      <div>
                        <p className="text-xs text-[#6b7280] mb-1">Time to Convert:</p>
                        <p className="text-sm text-[#00d4ff] font-semibold">{prediction.estimated_time_to_convert}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {predictions.engagement_forecasts?.map((forecast, index) => (
                  <Card key={index} className="bg-[#111111] border-[#262626]">
                    <CardHeader>
                      <CardTitle className="text-white text-base">{forecast.psychographic_segment}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#6b7280] mb-1">Best Channel</p>
                          <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-none">
                            {forecast.optimal_channel}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-[#6b7280] mb-1">Best Timing</p>
                          <Badge className="bg-[#ec4899]/20 text-[#ec4899] border-none">
                            {forecast.optimal_timing}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg p-3">
                        <p className="text-sm text-[#a3a3a3] mb-1">Predicted Engagement Rate</p>
                        <p className="text-2xl font-bold text-[#10b981]">
                          {Math.round(forecast.predicted_engagement_rate * 100)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-16">
            <div className="p-4 bg-gradient-to-br from-[#8b5cf6]/20 to-[#7c3aed]/20 rounded-2xl inline-flex mb-6">
              <Brain className="w-16 h-16 text-[#8b5cf6]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Generate Predictive Insights
            </h3>
            <p className="text-[#a3a3a3] max-w-2xl mx-auto mb-8">
              Our AI will analyze your user psychographic data to predict future behavior patterns, 
              churn risks, conversion likelihood, and optimal engagement strategies.
            </p>
            <Button
              onClick={generatePredictions}
              disabled={isGenerating || !selectedApp}
              className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white font-semibold px-8"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Psychographic Data...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Predictions
                </>
              )}
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        {predictions && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#a3a3a3] mb-1">Forecasts</p>
                    <p className="text-2xl font-bold text-white">
                      {predictions.behavior_forecasts?.length || 0}
                    </p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-[#8b5cf6]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#a3a3a3] mb-1">Churn Risks</p>
                    <p className="text-2xl font-bold text-white">
                      {predictions.churn_predictions?.length || 0}
                    </p>
                  </div>
                  <AlertTriangle className="w-6 h-6 text-[#ef4444]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#a3a3a3] mb-1">Conversions</p>
                    <p className="text-2xl font-bold text-white">
                      {predictions.conversion_predictions?.length || 0}
                    </p>
                  </div>
                  <Target className="w-6 h-6 text-[#10b981]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#a3a3a3] mb-1">Segments</p>
                    <p className="text-2xl font-bold text-white">
                      {predictions.engagement_forecasts?.length || 0}
                    </p>
                  </div>
                  <Users className="w-6 h-6 text-[#00d4ff]" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
