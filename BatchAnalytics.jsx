
import React, { useState, useEffect, useCallback, useRef } from "react";
import { BatchAnalysisReport, ClientApp, User } from "@/api/entities";
import { batchAnalytics } from "@/api/functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimatedDonut from "@/components/charts/AnimatedDonut";
import AnimatedLine from "@/components/charts/AnimatedLine";
import AnimatedBar from "@/components/charts/AnimatedBar"; // NEW: Add bar chart component
import {
  Brain,
  Users,
  TrendingUp,
  Clock,
  Play,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Target,
  Lightbulb,
  FileText,
  BarChart3,
  Layers,
  AlertTriangle,
  Briefcase,
  ArrowRight,
  Trash2,
  Shield, // NEW: Add for churn analysis
  Scale, // NEW: Add for comparison analysis  
  Activity // NEW: Add for behavioral trends
} from "lucide-react";
import { format } from "date-fns";
import { SubscriptionGate } from '@/components/billing/SubscriptionGate';
import { callWithRetry } from "@/components/system/apiRetry";
import { explainBatchReport } from '@/api/functions';
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { generateBatchReportPdf } from '@/api/functions'; // NEW: Add PDF generation

const clusterColors = [
  '#00d4ff', '#10b981', '#fbbf24', '#ec4899', '#8b5cf6',
  '#f59e0b', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export default function BatchAnalyticsPage() {
  const [clientApps, setClientApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisConfig, setAnalysisConfig] = useState({
    type: 'professional_report', // UPDATED: Default to professional report
    segment_count: 5,
    time_window_days: 30,
    include_reasoning: true
  });
  const [roleChecked, setRoleChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  // tracking and preview state
  const [justCreatedReportId, setJustCreatedReportId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const resultsTopRef = useRef(null);

  // Add explanation state
  const [reportExplanation, setReportExplanation] = useState('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  // State for confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await User.me();
        setIsAdmin(me?.role === 'admin');
      } catch (e) {
        setIsAdmin(false);
        console.error('Failed to fetch user role:', e);
      } finally {
        setRoleChecked(true);
      }
    })();
  }, []);

  // Safe date formatting function for BatchAnalytics
  const safeFormatDate = (dateString) => {
    try {
      if (!dateString) return 'Unknown';

      let date;
      if (dateString instanceof Date) {
        date = dateString;
      } else if (typeof dateString === 'string' || typeof dateString === 'number') {
        date = new Date(dateString);
      } else {
        console.warn('Invalid date format in BatchAnalytics:', dateString);
        return 'Invalid date';
      }

      if (isNaN(date.getTime())) {
        console.warn('Invalid date created in BatchAnalytics:', dateString);
        return 'Invalid date';
      }

      return format(date, 'MMM d, HH:mm');
    } catch (error) {
      console.error('Error formatting date in BatchAnalytics:', error, 'Date:', dateString);
      return 'Unknown date';
    }
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [appsData] = await Promise.all([
        ClientApp.list('-created_date')
      ]);

      setClientApps(appsData);

      // If no app is selected, or the previously selected app is no longer in the list,
      // select the first available app.
      let currentSelectedApp = selectedApp;
      if (appsData.length > 0 && (!currentSelectedApp || !appsData.some(app => app.id === currentSelectedApp.id))) {
        currentSelectedApp = appsData[0];
        setSelectedApp(currentSelectedApp);
      } else if (appsData.length === 0) {
        currentSelectedApp = null;
        setSelectedApp(null);
      }

      if (currentSelectedApp) {
        // CRITICAL: Load only non-demo reports for the selected app
        const reportsData = await BatchAnalysisReport.filter(
          { is_demo: false, client_app_id: currentSelectedApp.id },
          '-created_date',
          50
        );
        setReports(reportsData);
        // If there are reports and no report is selected, or the selected report
        // doesn't belong to the current app, select the first report.
        if (reportsData.length > 0 && (!selectedReport || selectedReport.client_app_id !== currentSelectedApp.id)) {
          setSelectedReport(reportsData[0]);
        } else if (reportsData.length === 0) {
          setSelectedReport(null);
        }
      } else {
        setReports([]);
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Error loading batch analytics data:', error);
    }
    setIsLoading(false);
  }, [selectedApp, selectedReport]);

  useEffect(() => {
    if (isAdmin && roleChecked) {
      loadData();
    }
  }, [isAdmin, roleChecked, loadData]);

  const handleRunAnalysis = async () => {
    if (!selectedApp) {
      alert("Please select an application first.");
      return;
    }
    setIsAnalyzing(true);
    // Clear previous explanation and preview state when running new analysis
    setReportExplanation('');
    setShowPreview(false);

    try {
      // Wrap heavy LLM-backed analysis with retries
      const { data } = await callWithRetry(
        () => batchAnalytics({
          client_app_id: selectedApp.id,
          analysis_type: analysisConfig.type,
          segment_count: parseInt(analysisConfig.segment_count),
          time_window_days: parseInt(analysisConfig.time_window_days),
          include_reasoning: analysisConfig.include_reasoning
        }),
        { retries: 2, baseDelayMs: 1000, maxDelayMs: 8000 }
      );

      // Reload to show new report, with a slight delay to ensure backend update
      setTimeout(async () => {
        // Fetch reports for the currently selected app to ensure data consistency
        const reloadedReports = await BatchAnalysisReport.filter(
          { is_demo: false, client_app_id: selectedApp.id },
          '-created_date',
          50
        );
        setReports(reloadedReports);
        const newReport = reloadedReports.find(r => r.id === data.report_id);
        if (newReport) {
          setSelectedReport(newReport);
          setJustCreatedReportId(newReport.id);
          setShowPreview(false);
          // auto-clear the "new" highlight after a few seconds
          setTimeout(() => setJustCreatedReportId(null), 5000);
        } else if (reloadedReports.length > 0) {
          setSelectedReport(reloadedReports[0]);
        }
      }, 1000);
    } catch (error) {
      console.error('Batch analysis failed:', error);
      alert(`Analysis failed: ${error?.response?.data?.error || error.message || 'Unknown error'}`);
    }
    setIsAnalyzing(false);
  };

  const handleExplainReport = async () => {
    if (!selectedReport) return;

    setIsLoadingExplanation(true);
    setReportExplanation(''); // Clear previous explanation
    try {
      // The import is already at the top of the file
      const { data } = await explainBatchReport({ report_id: selectedReport.id });
      setReportExplanation(data.explanation);
    } catch (error) {
      console.error('Failed to explain report:', error);
      alert('Failed to generate explanation. Please try again.');
    }
    setIsLoadingExplanation(false);
  };

  // when a report is selected, scroll it into view for visibility
  useEffect(() => {
    if (selectedReport && resultsTopRef.current) {
      resultsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedReport]);

  // UPDATED: Enhanced download function to generate PDF
  const downloadReport = async (report) => {
    if (report.status !== 'completed') {
      alert('Report is not ready for download yet.');
      return;
    }

    try {
      const response = await generateBatchReportPdf({ report_id: report.id });
      
      // Create download from HTML content
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `knxw-report-${report.analysis_type}-${format(new Date(report.created_date), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate report:', error);
      // Fallback to JSON download
      const dataStr = JSON.stringify(report, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `knxw_batch_report_${report.analysis_type}_${format(new Date(report.created_date), 'yyyy-MM-dd')}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const handleDeleteReport = (e, reportIdToDelete) => {
    e.stopPropagation(); // Prevent button click from bubbling up and selecting the report
    setReportToDelete(reportIdToDelete);
    setShowDeleteDialog(true);
  };

  const confirmDeleteReport = async () => {
    if (!reportToDelete) {
      setShowDeleteDialog(false); // Close dialog if reportToDelete is unexpectedly null
      return;
    }

    setIsDeleting(reportToDelete);
    setShowDeleteDialog(false); // Close dialog immediately upon confirmation

    try {
      await BatchAnalysisReport.delete(reportToDelete);

      const updatedReports = reports.filter(r => r.id !== reportToDelete);
      setReports(updatedReports);

      // If the deleted report was selected, select the first of the remaining, or null
      if (selectedReport?.id === reportToDelete) {
        setSelectedReport(updatedReports.length > 0 ? updatedReports[0] : null);
        setReportExplanation(''); // Clear explanation as well
      }

    } catch (error) {
      console.error("Failed to delete report:", error);
      alert("Could not delete the report. Please try again.");
    } finally {
      setIsDeleting(null);
      setReportToDelete(null); // Clear the reportToDelete state
    }
  };

  const getAnalysisIcon = (type) => {
    switch (type) {
      case 'professional_report':
        return <Briefcase className="w-4 h-4 mr-1" />;
      case 'psychographic_clustering':
        return <Brain className="w-4 h-4 mr-1" />;
      case 'full_segmentation': // Old type, mapped to Brain as it's similar
      case 'clustering': // Old type, mapped to Brain
        return <Brain className="w-4 h-4 mr-1" />;
      case 'behavioral_trend_analysis':
        return <Activity className="w-4 h-4 mr-1" />;
      case 'churn_prediction_analysis':
        return <Shield className="w-4 h-4 mr-1" />;
      case 'psychographic_comparison':
        return <Scale className="w-4 h-4 mr-1" />;
      case 'cohort_analysis':
      case 'trend_analysis': // Old type, mapped to BarChart3
        return <BarChart3 className="w-4 h-4 mr-1" />;
      default:
        return <FileText className="w-4 h-4 mr-1" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30';
      case 'failed':
        return 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30';
      case 'in_progress':
        return 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30';
      default:
        return 'bg-[#a3a3a3]/20 text-[#a3a3a3] border-[#a3a3a3]/30';
    }
  };


  const renderClusterAnalysis = (results) => {
    if (!results.clusters) return (
      <div className="text-center text-[#a3a3a3] py-8">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
        <p>No cluster analysis data available for this report.</p>
      </div>
    );

    const clusterArray = Object.values(results.clusters);
    const pieData = clusterArray.map((cluster, index) => ({
      name: cluster.ai_insights?.cluster_name || `Cluster ${cluster.cluster_id}`,
      value: cluster.size,
      percentage: cluster.percentage,
      color: clusterColors[index % clusterColors.length]
    }));

    return (
      <div className="space-y-6">
        {/* Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00d4ff]" />
                Segment Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <AnimatedDonut
                  data={pieData}
                  innerRadius={70}
                  outerRadius={110}
                  centerTitle={pieData.reduce((s, d) => s + d.value, 0)}
                  centerSubtitle="users"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#fbbf24]" />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[#a3a3a3]">Total Profiles</span>
                <span className="font-bold text-white">{results.total_profiles_analyzed?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a3a3a3]">Segments Created</span>
                <span className="font-bold text-white">{results.segment_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a3a3a3]">Largest Segment</span>
                <span className="font-bold text-white">
                  {Math.max(...clusterArray.map(c => parseFloat(c.percentage)))}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a3a3a3]">Generated</span>
                <span className="font-bold text-white">
                  {safeFormatDate(results.generated_at)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Individual Cluster Details */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#00d4ff]" />
            Psychographic Segments
          </h3>

          <div className="grid gap-4">
            {clusterArray.map((cluster, index) => (
              <Card key={cluster.cluster_id} className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: clusterColors[index % clusterColors.length] }}
                      />
                      {cluster.ai_insights?.cluster_name || `Segment ${cluster.cluster_id + 1}`}
                      <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">
                        {cluster.size} users ({cluster.percentage}%)
                      </Badge>
                    </CardTitle>
                  </div>
                  {cluster.ai_insights?.archetype_description && (
                    <p className="text-[#a3a3a3] text-sm mt-2">
                      {cluster.ai_insights.archetype_description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {cluster.ai_insights && (
                    <Tabs defaultValue="characteristics" className="w-full">
                      <TabsList className="bg-[#0a0a0a] border border-[#262626]">
                        <TabsTrigger value="characteristics">Key Traits</TabsTrigger>
                        <TabsTrigger value="business">Business Value</TabsTrigger>
                        <TabsTrigger value="recommendations">Marketing</TabsTrigger>
                        <TabsTrigger value="product">Product Insights</TabsTrigger>
                      </TabsList>

                      <TabsContent value="characteristics" className="space-y-3">
                        <div>
                          <h5 className="font-semibold text-white mb-2">Behavioral Characteristics</h5>
                          <div className="space-y-1">
                            {cluster.ai_insights.key_characteristics?.map((trait, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-[#10b981]" />
                                <span className="text-sm text-[#a3a3a3]">{trait}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="business" className="space-y-3">
                        <div className="p-4 rounded-lg bg-[#0a0a0a] border border-[#262626]">
                          <p className="text-sm text-white">{cluster.ai_insights.business_value}</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="recommendations" className="space-y-3">
                        <div className="space-y-2">
                          {cluster.ai_insights.marketing_recommendations?.map((rec, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-[#fbbf24] mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-[#a3a3a3]">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="product" className="space-y-3">
                        <div className="space-y-2">
                          {cluster.ai_insights.product_insights?.map((insight, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Target className="w-4 h-4 text-[#ec4899] mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-[#a3a3a3]">{insight}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}

                  {/* Personality Trait Bars */}
                  <div>
                    <h5 className="font-semibold text-white mb-3">Average Personality Traits</h5>
                    <div className="space-y-2">
                      {Object.entries(cluster.avg_personality_traits || {}).map(([trait, value]) => (
                        <div key={trait} className="flex items-center gap-3">
                          <span className="text-sm text-[#a3a3a3] w-20 capitalize">{trait}</span>
                          <div className="flex-1 bg-[#262626] rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#00d4ff] to-[#10b981] h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(value * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white w-12">
                            {(value * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTrendAnalysis = (results) => {
    if (!results.trend_analysis) return (
      <div className="text-center text-[#a3a3a3] py-8">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
        <p>No trend analysis data available for this report.</p>
      </div>
    );

    const trendData = Object.values(results.trend_analysis)
      .sort((a, b) => b.week_offset - a.week_offset)
      .map(week => ({
        week: `${week.week_offset}w ago`,
        confidence: week.avg_confidence ? Number((week.avg_confidence * 100).toFixed(1)) : null,
        profile_count: week.profile_count
      }));

    return (
      <div className="space-y-6">
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#10b981]" />
              Confidence Trends Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <AnimatedLine
                data={trendData}
                xKey="week"
                lines={[
                  { key: "confidence", color: "#00d4ff", name: "Avg Confidence (%)" }
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // UPDATED: Enhanced rendering functions for new analysis types
  const renderProfessionalReport = (results) => {
    if (!results.executive_summary) return (
      <div className="text-center text-[#a3a3a3] py-8">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
        <p>Professional report data is not available or incomplete.</p>
      </div>
    );

    return (
      <div className="space-y-8">
        {/* Executive Summary */}
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#00d4ff]" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white text-lg leading-relaxed">{results.executive_summary}</p>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        {results.key_metrics && (
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#10b981]" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#00d4ff]">
                    {results.key_metrics.total_users_analyzed?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-[#a3a3a3]">Users Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#10b981]">
                    {results.key_metrics.segments_identified || 0}
                  </div>
                  <div className="text-sm text-[#a3a3a3]">Segments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#fbbf24]">
                    {((results.key_metrics.confidence_score || 0) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-[#a3a3a3]">Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#ec4899] truncate">
                    {results.key_metrics.primary_opportunity || 'N/A'}
                  </div>
                  <div className="text-sm text-[#a3a3a3]">Top Opportunity</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Segments */}
        {results.user_segments && results.user_segments.length > 0 && (
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#8b5cf6]" />
                User Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {results.user_segments.map((segment, index) => (
                  <div key={index} className="bg-[#0a0a0a] rounded-lg p-6 border border-[#262626]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-white">{segment.segment_name}</h4>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">
                          {segment.size_percentage} ({segment.user_count?.toLocaleString()} users)
                        </Badge>
                        <Badge className={`${
                          segment.conversion_potential === 'high' ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' :
                          segment.conversion_potential === 'medium' ? 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30' :
                          'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30'
                        }`}>
                          {segment.conversion_potential} potential
                        </Badge>
                      </div>
                    </div>

                    <p className="text-[#a3a3a3] mb-4">{segment.description}</p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-white mb-2">Key Traits</h5>
                        <ul className="space-y-1">
                          {segment.key_traits?.map((trait, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-[#a3a3a3]">
                              <CheckCircle className="w-3 h-3 text-[#10b981]" />
                              {trait}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-2">Product Recommendations</h5>
                        <ul className="space-y-1">
                          {segment.product_recommendations?.map((rec, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-[#a3a3a3]">
                              <Lightbulb className="w-3 h-3 text-[#fbbf24]" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-[#111111] rounded-lg border border-[#262626]">
                      <h5 className="font-semibold text-white mb-2">Business Value & Strategy</h5>
                      <p className="text-sm text-[#a3a3a3] mb-2">{segment.business_value}</p>
                      <p className="text-sm text-[#00d4ff]">{segment.marketing_strategy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strategic Insights */}
        {results.strategic_insights && results.strategic_insights.length > 0 && (
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#ec4899]" />
                Strategic Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.strategic_insights.map((insight, index) => (
                  <div key={index} className="bg-[#0a0a0a] rounded-lg p-4 border border-[#262626]">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${
                        insight.impact === 'high' ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30' :
                        insight.impact === 'medium' ? 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30' :
                        'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30'
                      }`}>
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p className="text-white font-semibold mb-2">{insight.insight}</p>
                    <p className="text-[#a3a3a3] text-sm mb-3">{insight.rationale}</p>
                    <div>
                      <h6 className="text-white text-sm font-semibold mb-1">Action Items:</h6>
                      <ul className="space-y-1">
                        {insight.action_items?.map((action, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-[#a3a3a3]">
                            <ArrowRight className="w-3 h-3 text-[#00d4ff]" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {results.next_steps && results.next_steps.length > 0 && (
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#10b981]" />
                Recommended Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.next_steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#00d4ff] rounded-full flex items-center justify-center text-[#0a0a0a] font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-white">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Methodology */}
        {results.methodology_notes && (
          <Card className="bg-[#0f0f0f] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-[#a3a3a3] text-sm">Analysis Methodology</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#6b7280] text-sm">{results.methodology_notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // NEW: Render functions for other analysis types
  const renderBehavioralTrendAnalysis = (results) => {
    const trend = results.behavioral_trend_analysis; // Assuming 'behavioral_trend_analysis' is the key in results
    if (!trend) return (
      <div className="text-center text-[#a3a3a3] py-8">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
        <p>No behavioral trend analysis data available for this report.</p>
      </div>
    );

    return (
      <div className="space-y-6">
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#10b981]" />
              Behavioral Trends Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white text-lg leading-relaxed">{trend.summary}</p>
          </CardContent>
        </Card>

        {trend.key_trends && trend.key_trends.length > 0 && (
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#fbbf24]" />
                Key Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trend.key_trends.map((t, index) => (
                  <div key={index} className="bg-[#0a0a0a] rounded-lg p-4 border border-[#262626]">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${
                        t.impact === 'high' ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30' :
                        t.impact === 'medium' ? 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30' :
                        'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30'
                      }`}>
                        {t.impact} impact
                      </Badge>
                    </div>
                    <h4 className="text-white font-semibold mb-2">{t.trend_name}</h4>
                    <p className="text-[#a3a3a3] text-sm mb-3">{t.description}</p>
                    <div>
                      <h6 className="text-white text-sm font-semibold mb-1">Recommendation:</h6>
                      <p className="text-sm text-[#00d4ff]">{t.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderChurnPredictionAnalysis = (results) => {
    const churn = results.churn_analysis; // Assuming 'churn_analysis' is the key in results
    if (!churn) return (
      <div className="text-center text-[#a3a3a3] py-8">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
        <p>No churn prediction data available for this report.</p>
      </div>
    );

    return (
      <div className="space-y-6">
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#ef4444]" />
              Churn Risk Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${
                churn.overall_risk_level === 'high' ? 'text-[#ef4444]' :
                churn.overall_risk_level === 'medium' ? 'text-[#fbbf24]' :
                'text-[#10b981]'
              }`}>
                {(churn.overall_risk_level || 'unknown').toUpperCase()}
              </div>
              <div className="text-sm text-[#a3a3a3]">Overall Risk Level</div>
            </div>
          </CardContent>
        </Card>

        {churn.risk_segments && churn.risk_segments.length > 0 && (
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#8b5cf6]" />
                Risk Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churn.risk_segments.map((segment, index) => (
                  <div key={index} className="bg-[#0a0a0a] rounded-lg p-4 border border-[#262626]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-white">{segment.segment_name}</h4>
                      <Badge className={`${
                        segment.risk_level === 'high' ? 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30' :
                        segment.risk_level === 'medium' ? 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30' :
                        'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30'
                      }`}>
                        {segment.size_percentage} - {(segment.risk_level || 'unknown').toUpperCase()} RISK
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-white mb-2">Churn Indicators</h5>
                        <ul className="space-y-1">
                          {segment.churn_indicators?.map((indicator, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-[#a3a3a3]">
                              <AlertTriangle className="w-3 h-3 text-[#ef4444]" />
                              {indicator}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-white mb-2">Prevention Strategies</h5>
                        <ul className="space-y-1">
                          {segment.prevention_strategies?.map((strategy, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-[#a3a3a3]">
                              <Shield className="w-3 h-3 text-[#10b981]" />
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPsychographicComparison = (results) => {
    const comparison = results.comparison_analysis; // Assuming 'comparison_analysis' is the key in results
    if (!comparison) return (
      <div className="text-center text-[#a3a3a3] py-8">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
        <p>No comparison analysis data available for this report.</p>
      </div>
    );

    return (
      <div className="space-y-6">
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#8b5cf6]" />
              Segment Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white text-lg">
              Comparing: <span className="text-[#00d4ff]">{(comparison.segments_compared || []).join(' vs ')}</span>
            </p>
          </CardContent>
        </Card>

        {comparison.key_differences && comparison.key_differences.length > 0 && (
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#ec4899]" />
                Key Differences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparison.key_differences.map((diff, index) => (
                  <div key={index} className="bg-[#0a0a0a] rounded-lg p-4 border border-[#262626]">
                    <h4 className="text-white font-semibold mb-3">{diff.dimension?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div className="bg-[#111111] p-3 rounded-lg border border-[#00d4ff]/30">
                        <h5 className="text-[#00d4ff] font-semibold mb-2">{comparison.segments_compared?.[0] || 'Segment 1'}</h5>
                        <p className="text-[#a3a3a3] text-sm">{diff.segment1_trait}</p>
                      </div>
                      <div className="bg-[#111111] p-3 rounded-lg border border-[#ec4899]/30">
                        <h5 className="text-[#ec4899] font-semibold mb-2">{comparison.segments_compared?.[1] || 'Segment 2'}</h5>
                        <p className="text-[#a3a3a3] text-sm">{diff.segment2_trait}</p>
                      </div>
                    </div>
                    <div>
                      <h6 className="text-white text-sm font-semibold mb-1">Business Implication:</h6>
                      <p className="text-sm text-[#fbbf24]">{diff.business_implication}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

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
        requiredPlan="growth"
        feature="Advanced Batch Analytics"
        customMessage="Advanced batch analytics and segmentation require the Growth plan or higher. Upgrade your plan to access this powerful feature."
      >
        <div className="min-h-[40vh] flex items-center justify-center bg-[#0a0a0a] text-white">
          <p>Redirecting to subscription page...</p>
        </div>
      </SubscriptionGate>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24">
        {/* Header */}
        <div className="mb-8" data-tour="batch-analytics-overview">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
              <TrendingUp className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Batch Analytics
            </h1>
          </div>
          <p className="text-[#a3a3a3] text-lg">
            AI-powered psychographic reports and business intelligence
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-[#111111] border-[#262626] sticky top-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-[#10b981]" />
                  Generate Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* App Selection */}
                <div>
                  <Label htmlFor="selectedApp" className="block text-sm font-medium text-[#a3a3a3] mb-2">Select Application</Label>
                  <Select
                    value={selectedApp?.id || ''}
                    onValueChange={(appId) => {
                      const app = clientApps.find(app => app.id === appId);
                      setSelectedApp(app);
                      setSelectedReport(null);
                      setReportExplanation('');
                      setShowPreview(false);
                    }}
                    disabled={clientApps.length === 0 || isLoading}
                  >
                    <SelectTrigger id="selectedApp" className="bg-[#0a0a0a] border-[#262626] text-white">
                      <SelectValue placeholder="Select an app" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#262626] text-white">
                      {isLoading ? (
                        <SelectItem value={null} disabled>Loading apps...</SelectItem>
                      ) : clientApps.length === 0 ? (
                        <SelectItem value={null} disabled>No applications available</SelectItem>
                      ) : (
                        clientApps.map((app) => (
                          <SelectItem key={app.id} value={app.id} className="text-white hover:bg-[#262626] hover:text-[#00d4ff] focus:bg-[#262626] focus:text-[#00d4ff]">
                            {app.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {clientApps.length === 0 && !isLoading && (
                    <p className="text-xs text-red-400 mt-1">No applications found. Please create one.</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="analysisType" className="block text-sm font-medium text-[#a3a3a3] mb-2">Report Type</Label>
                  <Select
                    value={analysisConfig.type}
                    onValueChange={(value) => setAnalysisConfig(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger id="analysisType" className="bg-[#0a0a0a] border-[#262626] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#262626] text-white">
                      <SelectItem value="professional_report" className="text-white hover:bg-[#262626] hover:text-[#00d4ff] focus:bg-[#262626] focus:text-[#00d4ff]">
                        📊 Professional Report
                      </SelectItem>
                      <SelectItem value="psychographic_clustering" className="text-white hover:bg-[#262626] hover:text-[#00d4ff] focus:bg-[#262626] focus:text-[#00d4ff]">
                        🧠 Psychographic Clustering
                      </SelectItem>
                      <SelectItem value="behavioral_trend_analysis" className="text-white hover:bg-[#262626] hover:text-[#00d4ff] focus:bg-[#262626] focus:text-[#00d4ff]">
                        📈 Behavioral Trends
                      </SelectItem>
                      <SelectItem value="churn_prediction_analysis" className="text-white hover:bg-[#262626] hover:text-[#00d4ff] focus:bg-[#262626] focus:text-[#00d4ff]">
                        🛡️ Churn Prediction
                      </SelectItem>
                      <SelectItem value="psychographic_comparison" className="text-white hover:bg-[#262626] hover:text-[#00d4ff] focus:bg-[#262626] focus:text-[#00d4ff]">
                        ⚖️ Segment Comparison
                      </SelectItem>
                      <SelectItem value="cohort_analysis" className="text-white hover:bg-[#262626] hover:text-[#00d4ff] focus:bg-[#262626] focus:text-[#00d4ff]">
                        📊 Cohort Analysis
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="segmentCount" className="block text-sm font-medium text-[#a3a3a3] mb-2">Segments</Label>
                  <Input
                    id="segmentCount"
                    type="number"
                    value={analysisConfig.segment_count}
                    onChange={(e) => setAnalysisConfig(prev => ({ ...prev, segment_count: e.target.value }))}
                    min="3"
                    max="10"
                    className="bg-[#0a0a0a] border-[#262626] text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="timeWindowDays" className="block text-sm font-medium text-[#a3a3a3] mb-2">Time Window (days)</Label>
                  <Input
                    id="timeWindowDays"
                    type="number"
                    value={analysisConfig.time_window_days}
                    onChange={(e) => setAnalysisConfig(prev => ({ ...prev, time_window_days: e.target.value }))}
                    min="7"
                    max="365"
                    className="bg-[#0a0a0a] border-[#262626] text-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeReasoning"
                    checked={analysisConfig.include_reasoning}
                    onChange={(e) => setAnalysisConfig(prev => ({ ...prev, include_reasoning: e.target.checked }))}
                    className="rounded border-[#262626] bg-[#0a0a0a] text-[#00d4ff] focus:ring-0 focus:ring-offset-0 focus:border-[#00d4ff]"
                  />
                  <Label htmlFor="includeReasoning" className="text-sm text-[#a3a3a3]">
                    Include AI reasoning
                  </Label>
                </div>

                <Button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing || !selectedApp}
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-[#0a0a0a]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>

                {/* Report History */}
                <div className="mt-6">
                  <h4 className="font-semibold text-white mb-3">Recent Reports</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-24">
                        <Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" />
                      </div>
                    ) : reports.length === 0 ? (
                      <p className="text-sm text-[#a3a3a3] text-center py-4">No reports found for this application.</p>
                    ) : (
                      reports.slice(0, 10).map((report) => (
                        <button
                          key={report.id}
                          onClick={() => {
                            setSelectedReport(report);
                            setShowPreview(false);
                            setReportExplanation('');
                          }}
                          className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                            selectedReport?.id === report.id
                              ? 'bg-[#00d4ff]/10 border-[#00d4ff]/50'
                              : 'bg-[#1a1a1a] border-[#262626] hover:border-[#00d4ff]/30'
                          } ${report.id === justCreatedReportId ? 'ring-2 ring-[#00d4ff]/50' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white capitalize flex items-center">
                              {getAnalysisIcon(report.analysis_type)}
                              {report.analysis_type.replace(/_/g, ' ')}
                            </span>
                            <div className="flex items-center -mr-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadReport(report);
                                }}
                                className="h-6 w-6 p-0 text-[#a3a3a3] hover:text-white"
                                title="Download Report"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isDeleting === report.id}
                                onClick={(e) => handleDeleteReport(e, report.id)}
                                className="h-6 w-6 p-0 text-[#a3a3a3] hover:text-red-500 disabled:opacity-50"
                                title="Delete report"
                              >
                                {isDeleting === report.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <Trash2 className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-[#a3a3a3]">
                            <span>{safeFormatDate(report.created_date)}</span>
                            <Badge className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap ${getStatusColor(report.status)}`}>
                              {report.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3" ref={resultsTopRef}>
            {selectedReport ? (
              <div className="space-y-6">
                {/* Report Header */}
                <Card className={`bg-[#111111] border-[#262626] ${selectedReport.id === justCreatedReportId ? 'ring-2 ring-[#00d4ff]/50' : ''}`}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock className="w-5 h-5 text-[#fbbf24] flex-shrink-0" />
                        <div>
                          <CardTitle className="text-white text-lg md:text-xl font-bold truncate capitalize">
                            {String(selectedReport.analysis_type || '').replace(/_/g, ' ')} Report
                          </CardTitle>
                          <p className="text-[#a3a3a3] text-sm">
                            Generated on {safeFormatDate(selectedReport.created_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                        <Badge className={`whitespace-nowrap ${getStatusColor(selectedReport.status)}`}>
                          {selectedReport.status}
                        </Badge>
                        {selectedReport.id === justCreatedReportId && (
                          <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">New</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPreview((v) => !v)}
                          className="h-8 border-[#262626] hover:border-[#a3a3a3] whitespace-nowrap"
                        >
                          {showPreview ? 'Hide JSON' : 'Show JSON'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleExplainReport}
                          disabled={selectedReport.status !== 'completed' || isLoadingExplanation}
                          className="border-[#262626] hover:border-[#a3a3a3] whitespace-nowrap disabled:opacity-50"
                        >
                          {isLoadingExplanation ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Explaining...
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4 mr-2" />
                              Explain Report
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadReport(selectedReport)}
                          disabled={selectedReport.status !== 'completed'}
                          className="border-[#262626] hover:border-[#a3a3a3] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                          title={selectedReport.status !== 'completed' ? 'Report is not ready yet' : 'Download professional report'}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* AI Explanation Panel */}
                {reportExplanation && (
                  <Card className="bg-gradient-to-r from-[#00d4ff]/5 to-[#0ea5e9]/5 border border-[#00d4ff]/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Brain className="w-5 h-5 text-[#00d4ff]" />
                        AI Report Explanation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-white leading-relaxed whitespace-pre-line">{reportExplanation}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* JSON Preview */}
                {showPreview && (
                  <Card className="bg-[#0f0f0f] border-[#262626]">
                    <CardContent className="p-0">
                      <div className="max-h-96 overflow-auto p-4 themed-scroll">
                        <pre className="text-xs text-[#e5e5e5] whitespace-pre-wrap">
                          {JSON.stringify(selectedReport.results || {}, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Report Content */}
                {selectedReport.status === 'completed' ? (
                  <div className="space-y-6">
                    {(() => {
                      switch (selectedReport.analysis_type) {
                        case 'professional_report':
                          return renderProfessionalReport(selectedReport.results);
                        case 'psychographic_clustering':
                        case 'full_segmentation': // Handle old type
                        case 'clustering': // Handle old type
                          return renderClusterAnalysis(selectedReport.results);
                        case 'behavioral_trend_analysis':
                          return renderBehavioralTrendAnalysis(selectedReport.results);
                        case 'churn_prediction_analysis':
                          return renderChurnPredictionAnalysis(selectedReport.results);
                        case 'psychographic_comparison':
                          return renderPsychographicComparison(selectedReport.results);
                        case 'cohort_analysis':
                        case 'trend_analysis': // Handle old type
                          return renderTrendAnalysis(selectedReport.results);
                        default:
                          return (
                            <div className="text-center text-[#a3a3a3] py-8">
                              <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
                              <p>Unknown report type or no data to display.</p>
                            </div>
                          );
                      }
                    })()}
                  </div>
                ) : (
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardContent className="p-6 text-center">
                      {selectedReport.status === 'failed' ? (
                        <>
                          <AlertCircle className="w-12 h-12 text-[#ef4444] mx-auto mb-4" />
                          <p className="text-[#a3a3a3]">Report generation failed.</p>
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-12 h-12 text-[#fbbf24] mx-auto mb-4 animate-spin" />
                          <p className="text-[#a3a3a3]">Generating professional report...</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-12 text-center">
                  <Brain className="w-16 h-16 text-[#a3a3a3] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    AI-Powered Business Intelligence
                  </h3>
                  <p className="text-[#a3a3a3] max-w-md mx-auto">
                    Generate comprehensive, professional reports with AI explanations, visualizations, and actionable business insights from your psychographic data.
                  </p>
                  {isLoading && (
                     <div className="flex justify-center items-center mt-4">
                     <Loader2 className="w-6 h-6 animate-spin text-[#00d4ff] mr-2" />
                     <p className="text-[#a3a3a3]">Loading applications and reports...</p>
                   </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Report"
        description="Are you sure you want to permanently delete this analysis report? This action cannot be undone and all insights will be lost."
        confirmText="Delete Report"
        cancelText="Keep Report"
        onConfirm={confirmDeleteReport}
        variant="destructive"
      />
    </div>
  );
}
