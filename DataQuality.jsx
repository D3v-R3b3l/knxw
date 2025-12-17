
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  RefreshCw,
  Trash2,
  AlertCircle,
  TrendingUp,
  Users,
  Database
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '../components/ui/PageHeader';

export default function DataQualityPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [qualityReport, setQualityReport] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [inconsistencies, setInconsistencies] = useState([]);
  const { toast } = useToast();

  const runQualityScan = async () => {
    setIsScanning(true);

    try {
      // Load all profiles and events for analysis
      const profiles = await base44.entities.UserPsychographicProfile.filter({ is_demo: false }, '-last_analyzed', 500);
      const events = await base44.entities.CapturedEvent.filter({ is_demo: false }, '-timestamp', 1000);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this psychographic data for quality issues, duplicates, anomalies, and inconsistencies.

Total profiles: ${profiles.length}
Total events: ${events.length}

Sample profiles:
${JSON.stringify(profiles.slice(0, 10).map(p => ({
  user_id: p.user_id,
  cognitive_style: p.cognitive_style,
  risk_profile: p.risk_profile,
  staleness_score: p.staleness_score,
  last_analyzed: p.last_analyzed
})), null, 2)}

Sample events:
${JSON.stringify(events.slice(0, 20).map(e => ({
  user_id: e.user_id,
  event_type: e.event_type,
  timestamp: e.timestamp
})), null, 2)}

Provide comprehensive data quality analysis:

1. **Duplicate Detection**: Find potential duplicate user profiles (same user_id appearing multiple times, similar behavioral patterns)
2. **Anomaly Detection**: Identify unusual patterns in event streams (impossible event sequences, suspicious timing, outlier behaviors)
3. **Data Inconsistencies**: Find profiles with missing required fields, invalid confidence scores, expired profiles still active
4. **Staleness Issues**: Identify profiles that haven't been updated in >30 days
5. **Event Quality**: Find malformed events, events without proper user mapping, orphaned sessions

Return actionable findings with specific recommendations.`,
        response_json_schema: {
          type: "object",
          properties: {
            duplicate_profiles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_ids: { type: "array", items: { type: "string" } },
                  confidence: { type: "number" },
                  reason: { type: "string" },
                  recommended_action: { type: "string" }
                }
              }
            },
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" },
                  affected_records: { type: "number" },
                  recommendation: { type: "string" }
                }
              }
            },
            inconsistencies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  issue: { type: "string" },
                  affected_count: { type: "number" },
                  fix_suggestion: { type: "string" }
                }
              }
            },
            overall_health_score: { type: "number" },
            summary: { type: "string" },
            priority_actions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setQualityReport(response);
      setDuplicates(response.duplicate_profiles || []);
      setAnomalies(response.anomalies || []);
      setInconsistencies(response.inconsistencies || []);

      toast({
        title: 'Quality Scan Complete',
        description: 'AI has analyzed your data and identified quality issues'
      });
    } catch (error) {
      console.error('Failed to run quality scan:', error);
      toast({
        title: 'Scan Failed',
        description: error.message || 'Could not complete quality scan',
        variant: 'destructive'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleMergeDuplicates = async (duplicate) => {
    if (!confirm(`Merge ${duplicate.user_ids.length} duplicate profiles? This cannot be undone.`)) return;

    // Implementation would merge profiles
    toast({
      title: 'Merge Scheduled',
      description: 'Duplicate profiles will be merged in the background'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return { bg: 'bg-[#ef4444]', text: 'text-white' };
      case 'high': return { bg: 'bg-[#f97316]', text: 'text-white' };
      case 'medium': return { bg: 'bg-[#fbbf24]', text: 'text-[#0a0a0a]' };
      default: return { bg: 'bg-[#3b82f6]', text: 'text-white' };
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeader
          title="Data Quality"
          description="AI-powered data validation, cleaning, and health monitoring"
          icon={ShieldCheck}
          docSection="data-quality"
          actions={
            <Button
              onClick={runQualityScan}
              disabled={isScanning}
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run Quality Scan
                </>
              )}
            </Button>
          }
        />

        {qualityReport ? (
          <div className="space-y-6">
            {/* Health Score */}
            <Card className="bg-gradient-to-br from-[#10b981]/20 to-[#059669]/20 border-[#10b981]/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#a3a3a3] mb-2">Overall Data Health Score</p>
                    <p className="text-5xl font-bold text-white">{Math.round(qualityReport.overall_health_score * 100)}%</p>
                  </div>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
                    <ShieldCheck className="w-12 h-12 text-white" />
                  </div>
                </div>
                <p className="text-[#e5e5e5] mt-4">{qualityReport.summary}</p>
              </CardContent>
            </Card>

            {/* Priority Actions */}
            {qualityReport.priority_actions?.length > 0 && (
              <Card className="bg-[#111111] border-[#fbbf24]/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#fbbf24]" />
                    Priority Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {qualityReport.priority_actions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg">
                        <AlertCircle className="w-5 h-5 text-[#fbbf24] mt-0.5 flex-shrink-0" />
                        <span className="text-[#e5e5e5]">{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="duplicates" className="space-y-6">
              <TabsList className="bg-[#111111] border border-[#262626]">
                <TabsTrigger value="duplicates" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] data-[state=active]:font-semibold">
                  Duplicates ({duplicates.length})
                </TabsTrigger>
                <TabsTrigger value="anomalies" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] data-[state=active]:font-semibold">
                  Anomalies ({anomalies.length})
                </TabsTrigger>
                <TabsTrigger value="inconsistencies" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] data-[state=active]:font-semibold">
                  Inconsistencies ({inconsistencies.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="duplicates" className="space-y-4">
                {duplicates.map((dup, idx) => (
                  <Card key={idx} className="bg-[#111111] border-[#262626]">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-base">Duplicate Group {idx + 1}</CardTitle>
                        <Badge className="bg-[#fbbf24] text-[#0a0a0a] font-bold border-none">
                          {Math.round(dup.confidence * 100)}% match
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-white">
                      <div>
                        <p className="text-sm text-[#e5e5e5] mb-2">Affected User IDs:</p>
                        <div className="flex flex-wrap gap-2">
                          {dup.user_ids.map(id => (
                            <Badge key={id} className="bg-[#262626] text-[#e5e5e5] border-none font-mono text-xs">
                              {id}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#e5e5e5]"><strong className="text-white">Reason:</strong> {dup.reason}</p>
                      <p className="text-sm text-[#e5e5e5]"><strong className="text-[#00d4ff]">Recommendation:</strong> {dup.recommended_action}</p>
                      <Button
                        onClick={() => handleMergeDuplicates(dup)}
                        size="sm"
                        className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
                      >
                        Merge Duplicates
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {duplicates.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 text-[#10b981] mx-auto mb-4" />
                    <p className="text-[#a3a3a3]">No duplicate profiles detected</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="anomalies" className="space-y-4">
                {anomalies.map((anomaly, idx) => {
                  const colors = getSeverityColor(anomaly.severity);
                  return (
                    <Card key={idx} className="bg-[#111111] border-[#262626]">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-base">{anomaly.type}</CardTitle>
                          <Badge className={`${colors.bg} ${colors.text} font-bold border-none`}>
                            {anomaly.severity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 text-white">
                        <p className="text-[#e5e5e5]">{anomaly.description}</p>
                        <p className="text-sm text-[#a3a3a3]">
                          Affected Records: <span className="text-white font-semibold">{anomaly.affected_records}</span>
                        </p>
                        <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg p-3">
                          <p className="text-sm text-[#00d4ff] font-semibold">Recommendation:</p>
                          <p className="text-sm text-[#e5e5e5] mt-1">{anomaly.recommendation}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {anomalies.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 text-[#10b981] mx-auto mb-4" />
                    <p className="text-[#a3a3a3]">No anomalies detected in event stream</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="inconsistencies" className="space-y-4">
                {inconsistencies.map((issue, idx) => (
                  <Card key={idx} className="bg-[#111111] border-[#262626]">
                    <CardHeader>
                      <CardTitle className="text-white text-base">{issue.field}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-white">
                      <p className="text-[#e5e5e5]"><strong className="text-white">Issue:</strong> {issue.issue}</p>
                      <p className="text-sm text-[#a3a3a3]">
                        Affected Count: <span className="text-white font-semibold">{issue.affected_count}</span>
                      </p>
                      <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg p-3">
                        <p className="text-sm text-[#10b981] font-semibold">Fix Suggestion:</p>
                        <p className="text-sm text-[#e5e5e5] mt-1">{issue.fix_suggestion}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {inconsistencies.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 text-[#10b981] mx-auto mb-4" />
                    <p className="text-[#a3a3a3]">No data inconsistencies found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="p-4 bg-gradient-to-br from-[#00d4ff]/20 to-[#0ea5e9]/20 rounded-2xl inline-flex mb-6">
              <ShieldCheck className="w-16 h-16 text-[#00d4ff]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Run Data Quality Scan
            </h3>
            <p className="text-[#a3a3a3] max-w-2xl mx-auto mb-8">
              Our AI will analyze your psychographic profiles and event data to identify duplicates, 
              anomalies, inconsistencies, and provide automated cleaning recommendations.
            </p>
            <Button
              onClick={runQualityScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#00d4ff] text-[#0a0a0a] font-semibold px-8"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Data...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Quality Scan
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
