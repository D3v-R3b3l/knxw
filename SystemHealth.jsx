
import React, { useState, useEffect } from 'react';
import { User, OrgUser, TenantWorkspace, MetricsHour } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, HeartPulse, BarChart, AlertTriangle, ShieldOff } from 'lucide-react';
import AnimatedLine from '@/components/charts/AnimatedLine';

// Mock chart data for initial render
const mockData = (name) => Array.from({ length: 12 }, (_, i) => ({
  time: `${String(i * 2).padStart(2, '0')}:00`,
  [name]: Math.floor(Math.random() * (i + 1) * 100)
}));

export default function SystemHealth() {
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('all');
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const currentUser = await User.me();
        const orgUsers = await OrgUser.filter({ user_email: currentUser.email });
        if (orgUsers.length > 0) {
          const orgId = orgUsers[0].org_id;
          const userWorkspaces = await TenantWorkspace.filter({ org_id: orgId });
          setWorkspaces(userWorkspaces);
          await loadMetrics(orgId, 'all');
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const loadMetrics = async (orgId, workspaceId) => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const filter = {
      org_id: orgId,
      timestamp: { '$gte': twentyFourHoursAgo }
    };
    if (workspaceId !== 'all') {
      filter.workspace_id = workspaceId;
    }
    const rawMetrics = await MetricsHour.filter(filter);
    setMetrics(rawMetrics);
  };

  const handleWorkspaceChange = async (workspaceId) => {
    setSelectedWorkspaceId(workspaceId);
    setLoading(true);
    try {
      const currentUser = await User.me();
      const orgUsers = await OrgUser.filter({ user_email: currentUser.email });
      if (orgUsers.length > 0) {
        await loadMetrics(orgUsers[0].org_id, workspaceId);
      }
    } catch (error) {
      console.error("Failed to load metrics for workspace:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDataForChart = (metricName) => {
    const data = metrics
      .filter(m => m.metric_name === metricName)
      .map(m => ({
        time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        [metricName]: m.value
      }))
      .sort((a, b) => new Date(`1970-01-01T${a.time}:00Z`) - new Date(`1970-01-01T${b.time}:00Z`));
      
    return data.length > 0 ? data : mockData(metricName);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669]">
              <HeartPulse className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">System Health</h1>
              <p className="text-[#a3a3a3]">24-hour performance and reliability metrics.</p>
            </div>
          </div>
          <div className="w-64">
            <Select value={selectedWorkspaceId} onValueChange={handleWorkspaceChange}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                <SelectValue placeholder="Select workspace..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workspaces</SelectItem>
                {workspaces.map(ws => (
                  <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-[#00d4ff]" />
                  <span className="text-white">API Requests</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <AnimatedLine data={formatDataForChart('requests')} dataKey="requests" color="#00d4ff" height={300} />
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#fbbf24]" />
                  <span className="text-white">Errors</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <AnimatedLine data={formatDataForChart('errors')} dataKey="errors" color="#fbbf24" height={300} />
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShieldOff className="w-5 h-5 text-[#ef4444]" />
                  <span className="text-white">API Failures</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <AnimatedLine data={formatDataForChart('auth_failures')} dataKey="auth_failures" color="#ef4444" height={300} />
              </CardContent>
            </Card>
            
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-[#10b981]" />
                  <span className="text-white">P95 Latency (ms)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <AnimatedLine data={formatDataForChart('latency_p95_ms')} dataKey="latency_p95_ms" color="#10b981" height={300} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
