
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  Activity,
  Users,
  Terminal,
  FileText,
  Settings,
  Download,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import { SecurityProvider, useSecurity } from '../components/security/SecurityProvider';
import ThreatDetectionPanel from '../components/security/ThreatDetectionPanel';
import { AccessLog, AuditLog, SystemEvent, Alert } from '@/api/entities';
import { format } from 'date-fns';
import AnimatedLine from '../components/charts/AnimatedLine';
import AnimatedBar from '../components/charts/AnimatedBar';

function SecurityDashboardContent() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [systemEvents, setSystemEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [securityMetrics, setSecurityMetrics] = useState(null);

  const { threatLevel, securityEvents, sessionValid } = useSecurity();

  // Memoize pure functions that are dependencies for other memoized functions
  const checkAuditGaps = useCallback((audits) => {
    // Simple gap detection - look for periods > 1 hour without audit entries
    let gaps = 0;
    for (let i = 1; i < audits.length; i++) {
      const timeDiff = new Date(audits[i-1].timestamp) - new Date(audits[i].timestamp);
      if (timeDiff > 3600000) { // 1 hour
        gaps++;
      }
    }
    return gaps;
  }, []);

  const calculateSecurityScore = useCallback(({ failedLogins, suspiciousIPs, criticalAlerts, auditGaps }) => {
    let score = 100;
    
    // Deduct points for security issues
    score -= Math.min(failedLogins * 2, 30); // Max 30 points for failed logins
    score -= Math.min(suspiciousIPs * 5, 25); // Max 25 points for suspicious IPs
    score -= criticalAlerts * 10; // 10 points per critical alert
    score -= auditGaps * 5; // 5 points per audit gap

    return Math.max(score, 0);
  }, []);

  const calculateSecurityMetrics = useCallback((audits, accesses, events, alerts) => {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Failed login attempts in last 24 hours
    const failedLogins = accesses.filter(log => 
      !log.success && 
      log.action === 'POST' && 
      log.resource?.includes('login') &&
      new Date(log.timestamp) > last24Hours
    ).length;

    // Suspicious activity patterns
    const suspiciousIPs = new Set();
    accesses.forEach(log => {
      if (!log.success && log.ip_address) {
        suspiciousIPs.add(log.ip_address);
      }
    });

    // Active security alerts
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length;
    const highAlerts = alerts.filter(alert => alert.severity === 'high').length;

    // Audit trail completeness (should have consistent logging)
    const auditGaps = checkAuditGaps(audits);

    return {
      failedLogins,
      suspiciousIPs: suspiciousIPs.size,
      criticalAlerts,
      highAlerts,
      totalAlerts: alerts.length,
      auditGaps,
      securityScore: calculateSecurityScore({
        failedLogins,
        suspiciousIPs: suspiciousIPs.size,
        criticalAlerts,
        auditGaps
      })
    };
  }, [checkAuditGaps, calculateSecurityScore]);

  // Memoize loadSecurityData as it's used in useEffect dependencies
  const loadSecurityData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [auditData, accessData, eventsData, alertsData] = await Promise.all([
        AuditLog.list('-timestamp', 100).catch(() => []),
        AccessLog.list('-timestamp', 100).catch(() => []),
        SystemEvent.filter({ event_type: 'error' }, '-timestamp', 50).catch(() => []),
        Alert.filter({ status: 'active' }, '-created_date', 20).catch(() => [])
      ]);

      setAuditLogs(auditData);
      setAccessLogs(accessData);
      setSystemEvents(eventsData);
      setAlerts(alertsData);

      // Calculate security metrics
      const metrics = calculateSecurityMetrics(auditData, accessData, eventsData, alertsData);
      setSecurityMetrics(metrics);

    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setAuditLogs, setAccessLogs, setSystemEvents, setAlerts, setIsLoading, setSecurityMetrics, calculateSecurityMetrics]);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadSecurityData]); // Now loadSecurityData is a stable dependency

  const getSecurityScoreColor = useCallback((score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  }, []); // Pure function, no dependencies needed

  const exportSecurityReport = useCallback(async () => {
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        threatLevel,
        metrics: securityMetrics,
        recentEvents: securityEvents.slice(-50),
        auditSummary: {
          totalRecords: auditLogs.length,
          recentActions: auditLogs.slice(-20)
        },
        accessSummary: {
          totalRecords: accessLogs.length,
          failedAttempts: accessLogs.filter(log => !log.success).length
        }
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knxw-security-report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export security report:', error);
    }
  }, [threatLevel, securityMetrics, securityEvents, auditLogs, accessLogs]);

  // Generate chart data for security trends
  const securityTrendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayEvents = securityEvents.filter(event => 
        event.timestamp.startsWith(date)
      ).length;
      
      return {
        date: format(new Date(date), 'MMM d'),
        events: dayEvents,
        alerts: Math.floor(Math.random() * 5), // Mock data
        incidents: Math.floor(Math.random() * 3) // Mock data
      };
    });
  }, [securityEvents]);

  if (isLoading && !securityMetrics) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#ef4444] to-[#dc2626]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Enterprise Security Dashboard</h1>
              <p className="text-[#a3a3a3]">Real-time security monitoring and threat detection</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={exportSecurityReport}
              variant="outline"
              className="border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            
            <Button
              onClick={loadSecurityData}
              variant="outline"
              className="border-[#262626] text-[#a3a3a3] hover:bg-[#1a1a1a]"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Security Score & Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-[#111111] border-[#262626] lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-[#00d4ff]" />
                Security Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getSecurityScoreColor(securityMetrics?.securityScore || 0)}`}>
                  {securityMetrics?.securityScore || 0}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-[#a3a3a3] mb-1">Overall Security Health</div>
                  <div className="w-full bg-[#262626] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${securityMetrics?.securityScore || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                <span className="text-sm text-[#a3a3a3]">Critical Alerts</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {securityMetrics?.criticalAlerts || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-[#fbbf24]" />
                <span className="text-sm text-[#a3a3a3]">Failed Logins</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {securityMetrics?.failedLogins || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-[#10b981]" />
                <span className="text-sm text-[#a3a3a3]">Suspicious IPs</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {securityMetrics?.suspiciousIPs || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Trends Chart */}
        <Card className="bg-[#111111] border-[#262626] mb-8">
          <CardHeader>
            <CardTitle className="text-white">Security Events Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <AnimatedLine
                data={securityTrendData}
                lines={[
                  { key: 'events', name: 'Security Events', color: '#00d4ff' },
                  { key: 'alerts', name: 'Alerts', color: '#fbbf24' },
                  { key: 'incidents', name: 'Incidents', color: '#ef4444' }
                ]}
                xAxisKey="date"
                height={250}
              />
            </div>
          </CardContent>
        </Card>

        {/* Detailed Security Panels */}
        <Tabs defaultValue="threats" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-[#111111] border border-[#262626]">
            <TabsTrigger 
              value="threats" 
              className="data-[state=active]:bg-[#00d4ff]/20 data-[state=active]:text-[#00d4ff]"
            >
              <Shield className="w-4 h-4 mr-2" />
              Threats
            </TabsTrigger>
            <TabsTrigger 
              value="audit" 
              className="data-[state=active]:bg-[#00d4ff]/20 data-[state=active]:text-[#00d4ff]"
            >
              <FileText className="w-4 h-4 mr-2" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger 
              value="access" 
              className="data-[state=active]:bg-[#00d4ff]/20 data-[state=active]:text-[#00d4ff]"
            >
              <Eye className="w-4 h-4 mr-2" />
              Access Logs
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="data-[state=active]:bg-[#00d4ff]/20 data-[state=active]:text-[#00d4ff]"
            >
              <Activity className="w-4 h-4 mr-2" />
              System Events
            </TabsTrigger>
            <TabsTrigger 
              value="alerts" 
              className="data-[state=active]:bg-[#00d4ff]/20 data-[state=active]:text-[#00d4ff]"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="threats" className="mt-6">
            <ThreatDetectionPanel />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-8 text-[#6b7280]">
                      <FileText className="w-12 h-12 text-[#6b7280] mx-auto mb-4 opacity-50" />
                      <p>No audit logs available</p>
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                        <Terminal className="w-4 h-4 text-[#00d4ff] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white text-sm">
                              {log.action} on {log.table_name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {log.user_id}
                            </Badge>
                          </div>
                          <div className="text-xs text-[#a3a3a3]">
                            {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="mt-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Access Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {accessLogs.length === 0 ? (
                    <div className="text-center py-8 text-[#6b7280]">
                      <Eye className="w-12 h-12 text-[#6b7280] mx-auto mb-4 opacity-50" />
                      <p>No access logs available</p>
                    </div>
                  ) : (
                    accessLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          log.success ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white text-sm">
                              {log.action} {log.resource}
                            </span>
                            <Badge 
                              variant={log.success ? "default" : "destructive"} 
                              className="text-xs"
                            >
                              {log.response_code}
                            </Badge>
                          </div>
                          <div className="text-xs text-[#a3a3a3]">
                            {log.ip_address} • {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">System Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {systemEvents.length === 0 ? (
                    <div className="text-center py-8 text-[#6b7280]">
                      <Activity className="w-12 h-12 text-[#6b7280] mx-auto mb-4 opacity-50" />
                      <p>No system events available</p>
                    </div>
                  ) : (
                    systemEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                        <Activity className="w-4 h-4 text-[#fbbf24] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white text-sm">
                              {event.event_type}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                event.severity === 'critical' ? 'border-red-400 text-red-400' :
                                event.severity === 'error' ? 'border-orange-400 text-orange-400' :
                                'border-yellow-400 text-yellow-400'
                              }`}
                            >
                              {event.severity}
                            </Badge>
                          </div>
                          <div className="text-xs text-[#a3a3a3]">
                            {event.actor_id} • {format(new Date(event.timestamp), 'MMM d, HH:mm:ss')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Active Security Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-[#6b7280]">
                      <AlertTriangle className="w-12 h-12 text-[#6b7280] mx-auto mb-4 opacity-50" />
                      <p>No active alerts</p>
                      <p className="text-sm mt-2">All systems operating normally</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-lg border ${
                        alert.severity === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                        alert.severity === 'high' ? 'bg-orange-500/5 border-orange-500/20' :
                        'bg-yellow-500/5 border-yellow-500/20'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`w-4 h-4 ${
                              alert.severity === 'critical' ? 'text-red-400' :
                              alert.severity === 'high' ? 'text-orange-400' :
                              'text-yellow-400'
                            }`} />
                            <span className="font-medium text-white">
                              {alert.title}
                            </span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              alert.severity === 'critical' ? 'border-red-400 text-red-400' :
                              alert.severity === 'high' ? 'border-orange-400 text-orange-400' :
                              'border-yellow-400 text-yellow-400'
                            }`}
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-[#a3a3a3] mb-2">
                          {alert.message}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#6b7280]">
                            {format(new Date(alert.created_date), 'MMM d, HH:mm')}
                          </span>
                          {alert.metric_value && alert.threshold && (
                            <span className="text-xs text-[#a3a3a3]">
                              {alert.metric_value} &gt; {alert.threshold}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function EnterpriseSecurityDashboard() {
  return (
    <SecurityProvider>
      <SecurityDashboardContent />
    </SecurityProvider>
  );
}
