
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ScheduledReportConfig } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectTrigger, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AnimatedLine from "@/components/charts/AnimatedLine";
import AnimatedBar from "@/components/charts/AnimatedBar";
import AnimatedDonut from "@/components/charts/AnimatedDonut";
import {
  Download,
  CalendarClock,
  Settings,
  Mail,
  CloudUpload,
  Briefcase,
  Users,
  TrendingUp,
  AlertTriangle,
  Brain,
  Target,
  BarChart3,
  Clock,
  DollarSign, // Added for new KPIs
  Shield // Added for new KPIs
} from "lucide-react";
import { generateExecutiveReport } from "@/api/functions";
import SubscriptionGate from "@/components/billing/SubscriptionGate";
import { executiveMetrics } from '@/api/functions'; // New import

export default function ExecutiveDashboardPage() { // Renamed component
  const [metrics, setMetrics] = useState(null); // New state for unified metrics
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduler, setShowScheduler] = useState(false);
  const [timePeriod, setTimePeriod] = useState(90); // New state for time period selection

  // Scheduler form state
  const [form, setForm] = useState({
    name: "",
    enabled: true,
    frequency: "weekly",
    day_of_week: 1,
    hour_utc: 9,
    minute_utc: 0,
    format: "pdf",
    destination_type: "email",
    email_to: "",
    s3_bucket: "",
    s3_key_prefix: "reports/executive",
    notes: ""
  });

  const fetchData = useCallback(async () => {// Renamed from loadAll
    setIsLoading(true);
    try {
      const [metricsResponse, schedulesList] = await Promise.all([
      executiveMetrics({
        action: 'executive_summary',
        time_period_days: timePeriod
      }),
      ScheduledReportConfig.list("-created_date")]
      );
      setMetrics(metricsResponse.data); // Assuming executiveMetrics returns { data: ... }
      setSchedules(schedulesList || []);
    } catch (error) {
      console.error("Error loading executive data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [timePeriod]); // Depend on timePeriod

  useEffect(() => {fetchData();}, [fetchData]);

  // Utility functions for formatting
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Re-evaluate useMemo calculations based on the new 'metrics' object
  const topInsights = useMemo(() => {
    const rank = { critical: 3, high: 2, medium: 1, low: 0 };
    return (metrics?.insights || []).slice().sort((a, b) =>
    (rank[b.priority] || 0) - (rank[a.priority] || 0) || new Date(b.created_date) - new Date(a.created_date)
    ).slice(0, 5);
  }, [metrics]);

  const trendData = useMemo(() => {
    // Assuming metrics.charts.conversion_trend provides data in the format { date: "YYYY-MM-DD", day: "Mon 1", conversions: X }
    return metrics?.charts?.conversion_trend || [];
  }, [metrics]);

  const motiveChartData = useMemo(() => {
    const colors = ['#00d4ff', '#10b981', '#fbbf24', '#ec4899', '#8b5cf6'];
    return (metrics?.charts?.user_motivations || []).
    map((item, i) => ({
      name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      value: item.count, // Assuming item has 'name' and 'count'
      color: colors[i % colors.length]
    }));
  }, [metrics]);

  const conversionByMotiveData = useMemo(() => {
    const colors = ['#00d4ff', '#10b981', '#fbbf24', '#ec4899', '#8b5cf6'];
    return (metrics?.charts?.conversions_by_motivation || []).
    map((item, i) => ({
      name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      conversions: item.count, // Assuming item has 'name' and 'count'
      color: colors[i % colors.length]
    }));
  }, [metrics]);


  const exportReport = async (format) => {
    try {
      const { data } = await generateExecutiveReport({ format, time_period_days: timePeriod });
      const mimeType = format === 'csv' ? 'text/csv' : 'application/pdf';
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knxw_executive_report_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  const saveSchedule = async () => {
    try {
      await ScheduledReportConfig.create(form);
      setShowScheduler(false);
      setForm({
        name: "",
        enabled: true,
        frequency: "weekly",
        day_of_week: 1,
        hour_utc: 9,
        minute_utc: 0,
        format: "pdf",
        destination_type: "email",
        email_to: "",
        s3_bucket: "",
        s3_key_prefix: "reports/executive",
        notes: ""
      });
      fetchData(); // Reload schedules and metrics
    } catch (error) {
      console.error("Failed to save schedule:", error);
      alert("Failed to save schedule. Please try again.");
    }
  };

  const toggleSchedule = async (schedule) => {
    try {
      await ScheduledReportConfig.update(schedule.id, {
        enabled: !schedule.enabled
      });
      fetchData(); // Reload schedules
    } catch (error) {
      console.error("Failed to toggle schedule:", error);
    }
  };

  return (
    <SubscriptionGate requiredPlan="growth">
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-[#0a0a0a]" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight break-words">
                    Executive Dashboard
                  </h1>
                </div>
                <p className="text-[#a3a3a3] text-base md:text-lg">
                  Board-level insights and strategic analytics
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select value={timePeriod.toString()} onValueChange={(val) => setTimePeriod(parseInt(val))}>
                  <SelectTrigger className="w-full sm:w-32 bg-[#111111] border-[#262626] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#262626] text-white">
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => exportReport('pdf')}
                  className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold flex-shrink-0"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
                <Button
                  onClick={() => exportReport('csv')}
                  variant="outline"
                  className="border-[#262626] text-white hover:bg-[#262626] hover:text-white flex-shrink-0"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">CSV</span>
                </Button>
                <Button
                  onClick={() => setShowScheduler(true)}
                  variant="outline"
                  className="border-[#262626] text-white hover:bg-[#262626] hover:text-white flex-shrink-0"
                >
                  <CalendarClock className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Schedule Reports</span>
                  <span className="md:hidden">Schedule</span>
                </Button>
              </div>
            </div>
          </div>

          {isLoading ?
          <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin" />
            </div> :

          <>
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-[#111111] border-[#262626] relative">
                  <CardHeader className="p-6 pb-0">
                    <CardTitle className="text-lg font-medium text-[#a3a3a3]">Total Revenue</CardTitle>
                    <DollarSign className="w-6 h-6 text-[#10b981] absolute top-6 right-6" />
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    {isLoading ? <div className="h-10 w-32 bg-gray-700 animate-pulse rounded-md" /> :
                  <p className="text-4xl font-bold text-white">{formatCurrency(metrics?.kpis?.total_revenue || 0)}</p>
                  }
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#262626] relative">
                  <CardHeader className="p-6 pb-0">
                    <CardTitle className="text-lg font-medium text-[#a3a3a3]">Influenced Customers</CardTitle>
                    <Users className="w-6 h-6 text-[#00d4ff] absolute top-6 right-6" />
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    {isLoading ? <div className="h-10 w-24 bg-gray-700 animate-pulse rounded-md" /> :
                  <p className="text-4xl font-bold text-white">{(metrics?.kpis?.influenced_customers || 0).toLocaleString()}</p>
                  }
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#262626] relative">
                  <CardHeader className="p-6 pb-0">
                    <CardTitle className="text-lg font-medium text-[#a3a3a3]">Avg. Churn Reduction</CardTitle>
                    <Shield className="w-6 h-6 text-[#f59e0b] absolute top-6 right-6" />
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    {isLoading ? <div className="h-10 w-28 bg-gray-700 animate-pulse rounded-md" /> :
                  <p className="text-4xl font-bold text-white">{formatPercentage(metrics?.kpis?.avg_churn_reduction || 0)}</p>
                  }
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#262626] relative">
                  <CardHeader className="p-6 pb-0">
                    <CardTitle className="text-lg font-medium text-[#a3a3a3]">Avg. CLTV Uplift</CardTitle>
                    <TrendingUp className="w-6 h-6 text-[#ec4899] absolute top-6 right-6" />
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    {isLoading ? <div className="h-10 w-28 bg-gray-700 animate-pulse rounded-md" /> :
                  <p className="text-4xl font-bold text-white">{formatPercentage(metrics?.kpis?.avg_cltv_uplift || 0)}</p>
                  }
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Conversion Trend */}
                <Card className="bg-[#111111] border-[#262626]">
                  <CardHeader className="p-6">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <BarChart3 className="w-5 h-5 text-[#00d4ff]" />
                      Conversion Trend ({timePeriod} Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    {trendData.length > 0 ?
                  <AnimatedLine
                    data={trendData}
                    xKey="day"
                    yKey="conversions"
                    height={300}
                    color="#00d4ff" /> :


                  <div className="flex items-center justify-center h-[300px] text-[#a3a3a3]">
                        No conversion trend data available for this period.
                      </div>
                  }
                  </CardContent>
                </Card>

                {/* User Motivations */}
                <Card className="bg-[#111111] border-[#262626]">
                  <CardHeader className="p-6">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Target className="w-5 h-5 text-[#10b981]" />
                      User Motivations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    {motiveChartData.length > 0 ?
                  <AnimatedDonut
                    data={motiveChartData}
                    centerText="Motivations"
                    height={300} /> :


                  <div className="flex items-center justify-center h-[300px] text-[#a3a3a3]">
                        No motivation data available
                      </div>
                  }
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Row */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Conversion by Motive */}
                <Card className="bg-[#111111] border-[#262626]">
                  <CardHeader className="p-6">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <TrendingUp className="w-5 h-5 text-[#fbbf24]" />
                      Conversions by Motivation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    {conversionByMotiveData.length > 0 ?
                  <AnimatedBar
                    data={conversionByMotiveData}
                    xKey="name"
                    yKey="conversions"
                    height={300} /> :


                  <div className="flex items-center justify-center h-[300px] text-[#a3a3a3]">
                        No conversion data available
                      </div>
                  }
                  </CardContent>
                </Card>

                {/* Top Insights */}
                <Card className="bg-[#111111] border-[#262626]">
                  <CardHeader className="p-6">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Brain className="w-5 h-5 text-[#ec4899]" />
                      Priority Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                      {topInsights.length > 0 ?
                    topInsights.map((insight, index) =>
                    <div
                      key={insight.id}
                      className="p-4 rounded-lg bg-[#0a0a0a] border border-[#262626]">

                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-white text-sm line-clamp-2">
                                {insight.title}
                              </h4>
                              <Badge
                          className={
                          insight.priority === 'critical' ?
                          'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30' :
                          insight.priority === 'high' ?
                          'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30' :
                          'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30'
                          }>

                                {insight.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-[#a3a3a3] line-clamp-3">
                              {insight.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-[#00d4ff]">
                                {Math.round((insight.confidence_score || 0) * 100)}% confidence
                              </span>
                              <span className="text-xs text-[#6b7280]">•</span>
                              <span className="text-xs text-[#6b7280]">
                                {new Date(insight.created_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                    ) :

                    <div className="flex items-center justify-center h-32 text-[#a3a3a3]">
                          <div className="text-center">
                            <Brain className="w-8 h-8 text-[#a3a3a3] mx-auto mb-2 opacity-50" />
                            <p>No insights available</p>
                          </div>
                        </div>
                    }
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Scheduled Reports Section */}
              {schedules.length > 0 &&
            <Card className="bg-[#111111] border-[#262626] mt-8">
                  <CardHeader className="p-6">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Clock className="w-5 h-5 text-[#fbbf24]" />
                      Scheduled Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-4">
                      {schedules.map((schedule) =>
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a0a] border border-[#262626]">

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-semibold text-white">{schedule.name}</h4>
                              <Badge
                          className={
                          schedule.enabled ?
                          'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' :
                          'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30'
                          }>

                                {schedule.enabled ? 'Active' : 'Disabled'}
                              </Badge>
                            </div>
                            <p className="text-xs text-[#a3a3a3]">
                              {schedule.frequency === 'weekly' &&
                        `Every ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][schedule.day_of_week]} at ${schedule.hour_utc}:${schedule.minute_utc.toString().padStart(2, '0')} UTC`
                        } • {schedule.format.toUpperCase()} to {schedule.destination_type === 'email' ? schedule.email_to : `s3://${schedule.s3_bucket}`}
                            </p>
                          </div>
                          <Button
                      onClick={() => toggleSchedule(schedule)}
                      variant="outline"
                      size="sm"
                      className="border-[#262626] hover:bg-[#262626]">

                            {schedule.enabled ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                  )}
                    </div>
                  </CardContent>
                </Card>
            }
            </>
          }
        </div>

        {/* Schedule Report Modal */}
        {showScheduler &&
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111111] border-[#262626]">
              <CardHeader className="p-6">
                <CardTitle className="text-xl text-white">Schedule Executive Report</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-white">Report Name</Label>
                  <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Weekly Executive Summary"
                  className="bg-[#0a0a0a] border-[#262626] text-white" />

                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Format</Label>
                    <Select
                    value={form.format}
                    onValueChange={(value) => setForm((f) => ({ ...f, format: value }))}>

                      <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-[#262626] text-white">
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="both">Both PDF & CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Day of Week</Label>
                    <Select
                    value={form.day_of_week.toString()}
                    onValueChange={(value) => setForm((f) => ({ ...f, day_of_week: parseInt(value) }))}>

                      <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-[#262626] text-white">
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                        <SelectItem value="0">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-white">Delivery Method</Label>
                  <Select
                  value={form.destination_type}
                  onValueChange={(value) => setForm((f) => ({ ...f, destination_type: value }))}>

                    <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#262626] text-white">
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="s3">AWS S3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.destination_type === 'email' &&
              <div>
                    <Label className="text-white">Email Address</Label>
                    <Input
                  type="email"
                  value={form.email_to}
                  onChange={(e) => setForm((f) => ({ ...f, email_to: e.target.value }))}
                  placeholder="executive@company.com"
                  className="bg-[#0a0a0a] border-[#262626] text-white" />

                  </div>
              }

                {form.destination_type === 's3' &&
              <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">S3 Bucket</Label>
                      <Input
                    value={form.s3_bucket}
                    onChange={(e) => setForm((f) => ({ ...f, s3_bucket: e.target.value }))}
                    placeholder="my-reports-bucket"
                    className="bg-[#0a0a0a] border-[#262626] text-white" />

                    </div>
                    <div>
                      <Label className="text-white">Key Prefix</Label>
                      <Input
                    value={form.s3_key_prefix}
                    onChange={(e) => setForm((f) => ({ ...f, s3_key_prefix: e.target.value }))}
                    placeholder="reports/executive"
                    className="bg-[#0a0a0a] border-[#262626] text-white" />

                    </div>
                  </div>
              }

                <div>
                  <Label className="text-white">Notes (Optional)</Label>
                  <Textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Additional notes about this report schedule..."
                  className="bg-[#0a0a0a] border-[#262626] text-white"
                  rows={3} />

                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                  onClick={() => setShowScheduler(false)}
                  variant="outline"
                  className="border-[#262626] hover:bg-[#262626]">

                    Cancel
                  </Button>
                  <Button
                  onClick={saveSchedule}
                  disabled={!form.name || form.destination_type === 'email' && !form.email_to || form.destination_type === 's3' && !form.s3_bucket}
                  className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">

                    <CalendarClock className="w-4 h-4 mr-2" />
                    Schedule Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        }
      </div>
    </SubscriptionGate>
  );
}
