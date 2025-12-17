import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  Database,
  Loader2,
  Download,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AnimatedLine from '@/components/charts/AnimatedLine';
import AnimatedBar from '@/components/charts/AnimatedBar';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

export default function DeveloperUsage() {
  const [usageData, setUsageData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const { toast } = useToast();

  useEffect(() => {
    loadUsageData();
  }, [timeRange]);

  const loadUsageData = async () => {
    setLoading(true);
    try {
      // Fetch usage events from GameUsageEvent entity
      const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      
      const events = await base44.entities.GameUsageEvent.filter(
        { timestamp: { $gte: cutoff } },
        '-timestamp',
        1000
      );

      // Process usage statistics
      const stats = processUsageStats(events);
      setUsageData(stats);

      // Process performance data
      const perf = processPerformanceData(events);
      setPerformanceData(perf);
    } catch (error) {
      console.error('Failed to load usage data:', error);
      toast({
        title: 'Load Failed',
        description: 'Could not load usage statistics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const processUsageStats = (events) => {
    const totalRequests = events.length;
    const successfulRequests = events.filter(e => e.status_code >= 200 && e.status_code < 300).length;
    const errorRequests = events.filter(e => e.status_code >= 400).length;
    const rateLimitedRequests = events.filter(e => e.is_rate_limited).length;

    // Group by endpoint
    const byEndpoint = {};
    events.forEach(e => {
      const endpoint = e.endpoint || 'unknown';
      if (!byEndpoint[endpoint]) {
        byEndpoint[endpoint] = { total: 0, errors: 0, avgLatency: 0, latencies: [] };
      }
      byEndpoint[endpoint].total++;
      if (e.status_code >= 400) byEndpoint[endpoint].errors++;
      if (e.latency_ms) byEndpoint[endpoint].latencies.push(e.latency_ms);
    });

    // Calculate average latencies
    Object.values(byEndpoint).forEach(endpoint => {
      if (endpoint.latencies.length > 0) {
        endpoint.avgLatency = endpoint.latencies.reduce((a, b) => a + b, 0) / endpoint.latencies.length;
      }
    });

    // Time series data
    const timeSeries = generateTimeSeries(events);

    return {
      totalRequests,
      successfulRequests,
      errorRequests,
      rateLimitedRequests,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests * 100).toFixed(2) : 0,
      errorRate: totalRequests > 0 ? (errorRequests / totalRequests * 100).toFixed(2) : 0,
      rateLimitRate: totalRequests > 0 ? (rateLimitedRequests / totalRequests * 100).toFixed(2) : 0,
      byEndpoint,
      timeSeries
    };
  };

  const processPerformanceData = (events) => {
    const latencies = events.map(e => e.latency_ms).filter(Boolean);
    
    if (latencies.length === 0) {
      return {
        avgLatency: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        distribution: []
      };
    }

    const sorted = latencies.sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    // Create distribution buckets
    const buckets = [0, 50, 100, 200, 500, 1000, 2000];
    const distribution = buckets.map((min, idx) => {
      const max = buckets[idx + 1] || Infinity;
      const count = latencies.filter(l => l >= min && l < max).length;
      return {
        name: max === Infinity ? `${min}+ms` : `${min}-${max}ms`,
        value: count
      };
    });

    return {
      avgLatency: Math.round(avgLatency),
      p50: Math.round(p50),
      p95: Math.round(p95),
      p99: Math.round(p99),
      distribution
    };
  };

  const generateTimeSeries = (events) => {
    const buckets = {};
    
    events.forEach(e => {
      const date = new Date(e.timestamp);
      const bucket = format(date, 'HH:00');
      if (!buckets[bucket]) {
        buckets[bucket] = { requests: 0, errors: 0 };
      }
      buckets[bucket].requests++;
      if (e.status_code >= 400) buckets[bucket].errors++;
    });

    return Object.entries(buckets)
      .map(([time, data]) => ({
        name: time,
        requests: data.requests,
        errors: data.errors
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleExport = () => {
    // Export usage data as CSV
    const csv = generateCSV(usageData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-usage-${timeRange}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();

    toast({
      title: 'Export Started',
      description: 'Downloading usage data as CSV'
    });
  };

  const generateCSV = (data) => {
    if (!data) return '';
    
    const rows = [
      ['Metric', 'Value'],
      ['Total Requests', data.totalRequests],
      ['Successful Requests', data.successfulRequests],
      ['Error Requests', data.errorRequests],
      ['Rate Limited Requests', data.rateLimitedRequests],
      ['Success Rate', `${data.successRate}%`],
      ['Error Rate', `${data.errorRate}%`],
      ['', ''],
      ['Endpoint', 'Requests', 'Errors', 'Avg Latency (ms)'],
      ...Object.entries(data.byEndpoint).map(([endpoint, stats]) => [
        endpoint,
        stats.total,
        stats.errors,
        Math.round(stats.avgLatency)
      ])
    ];

    return rows.map(row => row.join(',')).join('\n');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
                  <Activity className="w-6 h-6 text-[#0a0a0a]" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  API Usage & Performance
                </h1>
              </div>
              <p className="text-[#a3a3a3] text-lg">
                Monitor your API usage, performance metrics, and rate limits
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={loadUsageData}
                variant="outline"
                className="border-[#262626] text-[#a3a3a3] hover:bg-[#262626]"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleExport}
                className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {['1h', '24h', '7d', '30d'].map(range => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              className={timeRange === range 
                ? 'bg-[#00d4ff] text-[#0a0a0a]'
                : 'border-[#262626] text-[#a3a3a3] hover:bg-[#262626]'
              }
            >
              Last {range === '1h' ? 'Hour' : range === '24h' ? '24 Hours' : range === '7d' ? 'Week' : 'Month'}
            </Button>
          ))}
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#a3a3a3]">Total Requests</p>
                <Activity className="w-4 h-4 text-[#00d4ff]" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {usageData?.totalRequests.toLocaleString()}
              </p>
              <p className="text-xs text-[#6b7280]">All API calls</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#a3a3a3]">Success Rate</p>
                <CheckCircle className="w-4 h-4 text-[#10b981]" />
              </div>
              <p className="text-3xl font-bold text-[#10b981] mb-1">
                {usageData?.successRate}%
              </p>
              <p className="text-xs text-[#6b7280]">
                {usageData?.successfulRequests.toLocaleString()} successful
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#a3a3a3]">Error Rate</p>
                <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
              </div>
              <p className="text-3xl font-bold text-[#ef4444] mb-1">
                {usageData?.errorRate}%
              </p>
              <p className="text-xs text-[#6b7280]">
                {usageData?.errorRequests.toLocaleString()} errors
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#a3a3a3]">Rate Limited</p>
                <Zap className="w-4 h-4 text-[#fbbf24]" />
              </div>
              <p className="text-3xl font-bold text-[#fbbf24] mb-1">
                {usageData?.rateLimitRate}%
              </p>
              <p className="text-xs text-[#6b7280]">
                {usageData?.rateLimitedRequests.toLocaleString()} throttled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
                Request Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usageData?.timeSeries && usageData.timeSeries.length > 0 ? (
                <AnimatedLine
                  data={usageData.timeSeries}
                  lines={[
                    { key: 'requests', color: '#00d4ff', name: 'Requests' },
                    { key: 'errors', color: '#ef4444', name: 'Errors' }
                  ]}
                  height={300}
                />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-[#a3a3a3]">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#10b981]" />
                Latency Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceData?.distribution && performanceData.distribution.length > 0 ? (
                <AnimatedBar
                  data={performanceData.distribution}
                  bars={[{ key: 'value', color: '#10b981', name: 'Requests' }]}
                  height={300}
                />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-[#a3a3a3]">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="bg-[#111111] border-[#262626] mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#8b5cf6]" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-[#a3a3a3] mb-2">Average Latency</p>
                <p className="text-2xl font-bold text-white">{performanceData?.avgLatency}ms</p>
              </div>
              <div>
                <p className="text-sm text-[#a3a3a3] mb-2">P50 Latency</p>
                <p className="text-2xl font-bold text-white">{performanceData?.p50}ms</p>
              </div>
              <div>
                <p className="text-sm text-[#a3a3a3] mb-2">P95 Latency</p>
                <p className="text-2xl font-bold text-[#fbbf24]">{performanceData?.p95}ms</p>
              </div>
              <div>
                <p className="text-sm text-[#a3a3a3] mb-2">P99 Latency</p>
                <p className="text-2xl font-bold text-[#ef4444]">{performanceData?.p99}ms</p>
              </div>
            </div>

            {performanceData?.p95 > 500 && (
              <div className="mt-4 bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#fbbf24] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#fbbf24] mb-1">Performance Alert</h4>
                    <p className="text-sm text-[#a3a3a3]">
                      P95 latency is above recommended threshold (500ms). Consider optimizing queries or upgrading your plan.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Endpoint Breakdown */}
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#ec4899]" />
              Endpoint Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageData?.byEndpoint && Object.entries(usageData.byEndpoint)
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 10)
                .map(([endpoint, stats]) => {
                  const errorRate = stats.total > 0 ? (stats.errors / stats.total * 100).toFixed(1) : 0;
                  const isHealthy = errorRate < 5 && stats.avgLatency < 500;

                  return (
                    <div key={endpoint} className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <code className="text-sm text-white font-mono truncate">{endpoint}</code>
                          {isHealthy ? (
                            <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-[#fbbf24] flex-shrink-0" />
                          )}
                        </div>
                        <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] text-xs ml-2">
                          {stats.total} calls
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-[#6b7280] text-xs mb-1">Errors</p>
                          <p className={`font-semibold ${parseFloat(errorRate) > 5 ? 'text-[#ef4444]' : 'text-white'}`}>
                            {errorRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[#6b7280] text-xs mb-1">Avg Latency</p>
                          <p className={`font-semibold ${stats.avgLatency > 500 ? 'text-[#fbbf24]' : 'text-white'}`}>
                            {Math.round(stats.avgLatency)}ms
                          </p>
                        </div>
                        <div>
                          <p className="text-[#6b7280] text-xs mb-1">Success</p>
                          <p className="font-semibold text-[#10b981]">
                            {stats.total - stats.errors}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </CardContent>
        </Card>

        {/* Rate Limit Information */}
        <Card className="bg-gradient-to-br from-[#fbbf24]/10 to-[#f59e0b]/10 border-[#fbbf24]/30 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-[#fbbf24] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Rate Limits</h3>
                <p className="text-sm text-[#a3a3a3] mb-3">
                  Your current plan includes generous rate limits. If you're hitting limits frequently, consider upgrading or optimizing your integration.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[#6b7280] mb-1">Requests throttled</p>
                    <p className="text-xl font-bold text-[#fbbf24]">
                      {usageData?.rateLimitedRequests || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] mb-1">Throttle rate</p>
                    <p className="text-xl font-bold text-white">
                      {usageData?.rateLimitRate || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[#6b7280] mb-1">Recommended action</p>
                    <p className="text-sm text-[#00d4ff]">
                      {parseFloat(usageData?.rateLimitRate || 0) > 5 
                        ? 'Implement caching or backoff'
                        : 'No action needed'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}