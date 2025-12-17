import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield, AlertTriangle, AlertCircle, CheckCircle, XCircle, Eye, Filter,
  Search, TrendingUp, Users, Activity, Bell, FileText, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeFormatDate } from '../components/utils/datetime';
import { useToast } from '@/components/ui/use-toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export default function ComplianceDashboardPage() {
  const [user, setUser] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending_review');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDecision, setReviewDecision] = useState('confirmed');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  // Fetch alerts
  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['behavioral-alerts', filterStatus, filterSeverity],
    queryFn: async () => {
      let filter = {};
      
      if (filterStatus !== 'all') {
        filter.status = filterStatus;
      }
      
      if (filterSeverity !== 'all') {
        filter.severity = filterSeverity;
      }
      
      return await base44.entities.BehavioralIntegrityAlert.filter(
        filter,
        '-created_date',
        100
      );
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch dark pattern detections
  const { data: darkPatterns = [] } = useQuery({
    queryKey: ['dark-patterns'],
    queryFn: async () => {
      return await base44.entities.DarkPatternDetection.filter(
        { status: 'detected' },
        '-manipulation_score',
        20
      );
    }
  });

  // Fetch compliance rules
  const { data: rules = [] } = useQuery({
    queryKey: ['compliance-rules'],
    queryFn: async () => {
      return await base44.entities.ComplianceRule.filter({ enabled: true }, '-created_date', 50);
    }
  });

  // Review alert mutation
  const reviewAlertMutation = useMutation({
    mutationFn: async ({ alertId, decision, notes, intervention }) => {
      const updateData = {
        status: decision === 'dismissed' ? 'dismissed' : decision === 'false_positive' ? 'dismissed' : 'confirmed',
        reviewed_by: user.email,
        reviewed_at: new Date().toISOString(),
        review_notes: notes,
        false_positive: decision === 'false_positive'
      };

      if (intervention) {
        updateData.intervention_applied = {
          action_type: intervention,
          applied_at: new Date().toISOString(),
          applied_by: user.email,
          details: notes
        };
        updateData.status = 'intervention_applied';
      }

      return await base44.entities.BehavioralIntegrityAlert.update(alertId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behavioral-alerts'] });
      toast({ title: 'Alert reviewed successfully' });
      setShowReviewDialog(false);
      setSelectedAlert(null);
      setReviewNotes('');
    },
    onError: (error) => {
      toast({ title: 'Failed to review alert', description: error.message, variant: 'destructive' });
    }
  });

  // Calculate stats
  const stats = {
    pending: alerts.filter(a => a.status === 'pending_review').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    falsePositiveRate: alerts.length > 0
      ? (alerts.filter(a => a.false_positive).length / alerts.length * 100).toFixed(1)
      : 0
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      critical: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[severity] || colors.medium;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending_review: AlertCircle,
      confirmed: AlertTriangle,
      dismissed: XCircle,
      intervention_applied: CheckCircle
    };
    return icons[status] || AlertCircle;
  };

  const filteredAlerts = alerts.filter(alert => {
    if (!searchTerm) return true;
    return (
      alert.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alert_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#111111] flex items-center justify-center">
        <Card className="bg-[#111111] border-[#262626] p-8">
          <Shield className="w-12 h-12 text-[#00d4ff] mx-auto mb-4" />
          <p className="text-white text-center">Loading compliance dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#111111] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8 text-[#00d4ff]" />
                Dynamic Compliance & Ethical AI Guardian
              </h1>
              <p className="text-[#a3a3a3]">
                Proactive behavioral integrity monitoring with psychographic-informed detection
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              className="bg-[#00d4ff] hover:bg-[#00b4d8] text-black"
            >
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#a3a3a3] text-sm">Pending Review</p>
                    <p className="text-3xl font-bold text-white">{stats.pending}</p>
                  </div>
                  <Bell className="w-8 h-8 text-[#fbbf24]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#a3a3a3] text-sm">Critical Alerts</p>
                    <p className="text-3xl font-bold text-red-400">{stats.critical}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#a3a3a3] text-sm">High Priority</p>
                    <p className="text-3xl font-bold text-orange-400">{stats.high}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#a3a3a3] text-sm">False Positive Rate</p>
                    <p className="text-3xl font-bold text-[#10b981]">{stats.falsePositiveRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-[#10b981]" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-[#111111] border-[#262626] mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                <Input
                  placeholder="Search by user ID or alert type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#0a0a0a] border-[#262626] text-white"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                  <SelectItem value="intervention_applied">Intervention Applied</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredAlerts.map((alert) => {
              const StatusIcon = getStatusIcon(alert.status);
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/30 transition-all cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                            <StatusIcon className="w-6 h-6" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-white font-semibold">{alert.alert_type.replace(/_/g, ' ').toUpperCase()}</h3>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">
                                {(alert.confidence_score * 100).toFixed(0)}% confidence
                              </Badge>
                            </div>
                            
                            <p className="text-[#a3a3a3] text-sm mb-2">
                              <strong className="text-white">User:</strong> {alert.user_id}
                            </p>
                            
                            {alert.detection_reasoning && (
                              <div className="space-y-2">
                                <p className="text-[#a3a3a3] text-sm">
                                  <strong className="text-white">Intent Assessment:</strong>{' '}
                                  <span className={
                                    alert.detection_reasoning.intent_assessment === 'malicious' ? 'text-red-400' :
                                    alert.detection_reasoning.intent_assessment === 'confused' ? 'text-yellow-400' :
                                    'text-[#00d4ff]'
                                  }>
                                    {alert.detection_reasoning.intent_assessment}
                                  </span>
                                </p>
                                
                                {alert.detection_reasoning.behavioral_evidence && (
                                  <div>
                                    <p className="text-white text-sm font-semibold mb-1">Behavioral Evidence:</p>
                                    <ul className="list-disc list-inside text-[#a3a3a3] text-xs space-y-1">
                                      {alert.detection_reasoning.behavioral_evidence.slice(0, 3).map((evidence, idx) => (
                                        <li key={idx}>{evidence}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-[#a3a3a3] text-xs">
                            {safeFormatDate(alert.created_date, 'MMM d, h:mm a')}
                          </p>
                          
                          {alert.status === 'pending_review' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedAlert(alert);
                                setShowReviewDialog(true);
                              }}
                              className="bg-[#00d4ff] hover:bg-[#00b4d8] text-black"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          )}
                          
                          {alert.reviewed_by && (
                            <p className="text-[#10b981] text-xs">
                              Reviewed by {alert.reviewed_by.split('@')[0]}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {alert.recommended_interventions && alert.recommended_interventions.length > 0 && (
                        <div className="border-t border-[#262626] pt-4 mt-4">
                          <p className="text-white text-sm font-semibold mb-2">Recommended Interventions:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {alert.recommended_interventions.slice(0, 4).map((intervention, idx) => (
                              <div key={idx} className="bg-[#0a0a0a] border border-[#262626] rounded p-2">
                                <p className="text-[#00d4ff] text-xs font-semibold mb-1">
                                  {intervention.action_type?.replace(/_/g, ' ')}
                                </p>
                                <p className="text-[#a3a3a3] text-xs line-clamp-2">
                                  {intervention.rationale}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Dark Patterns Section */}
        {darkPatterns.length > 0 && (
          <Card className="bg-[#111111] border-[#262626] mt-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#fbbf24]" />
                Detected Dark Patterns ({darkPatterns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {darkPatterns.slice(0, 5).map((pattern) => (
                  <div key={pattern.id} className="bg-[#0a0a0a] border border-[#fbbf24]/30 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30">
                            {pattern.pattern_type.replace(/_/g, ' ')}
                          </Badge>
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            {(pattern.manipulation_score * 100).toFixed(0)}% manipulation
                          </Badge>
                        </div>
                        
                        <p className="text-white text-sm mb-1">
                          <strong>Element:</strong> {pattern.detected_in_element}
                        </p>
                        
                        <p className="text-[#a3a3a3] text-sm mb-2">
                          <strong className="text-white">Affected users:</strong> {pattern.affected_users_count}
                        </p>
                        
                        {pattern.recommended_fix && (
                          <p className="text-[#00d4ff] text-sm">
                            <strong>Recommended fix:</strong> {pattern.recommended_fix}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24]/10"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Dialog */}
        {showReviewDialog && selectedAlert && (
          <ConfirmationDialog
            open={showReviewDialog}
            onClose={() => {
              setShowReviewDialog(false);
              setSelectedAlert(null);
              setReviewNotes('');
            }}
            title="Review Behavioral Integrity Alert"
            message={
              <div className="space-y-4">
                <div>
                  <p className="text-white font-semibold mb-2">Alert Details:</p>
                  <div className="bg-[#0a0a0a] border border-[#262626] rounded p-3 space-y-2">
                    <p className="text-[#a3a3a3] text-sm">
                      <strong className="text-white">Type:</strong> {selectedAlert.alert_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[#a3a3a3] text-sm">
                      <strong className="text-white">User:</strong> {selectedAlert.user_id}
                    </p>
                    <p className="text-[#a3a3a3] text-sm">
                      <strong className="text-white">Severity:</strong> {selectedAlert.severity}
                    </p>
                    <p className="text-[#a3a3a3] text-sm">
                      <strong className="text-white">Confidence:</strong> {(selectedAlert.confidence_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm font-semibold mb-2 block">Review Decision:</label>
                  <Select value={reviewDecision} onValueChange={setReviewDecision}>
                    <SelectTrigger className="bg-[#0a0a0a] border-[#262626] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirm - Legitimate Concern</SelectItem>
                      <SelectItem value="dismissed">Dismiss - Not a Violation</SelectItem>
                      <SelectItem value="false_positive">False Positive</SelectItem>
                      <SelectItem value="warning">Apply Warning</SelectItem>
                      <SelectItem value="restriction">Apply Restriction</SelectItem>
                      <SelectItem value="escalate">Escalate for Further Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm font-semibold mb-2 block">Review Notes:</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Document your decision and any actions taken..."
                    className="bg-[#0a0a0a] border-[#262626] text-white min-h-[100px]"
                  />
                </div>
              </div>
            }
            confirmText="Submit Review"
            onConfirm={() => {
              reviewAlertMutation.mutate({
                alertId: selectedAlert.id,
                decision: reviewDecision,
                notes: reviewNotes,
                intervention: ['warning', 'restriction'].includes(reviewDecision) ? reviewDecision : null
              });
            }}
            confirmButtonClass="bg-[#00d4ff] hover:bg-[#00b4d8] text-black"
          />
        )}
      </div>
    </div>
  );
}