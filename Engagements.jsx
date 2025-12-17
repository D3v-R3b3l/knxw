import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Zap, Plus, Play, Pause, BarChart, MessageSquare, Settings, Target, Clock, User as UserIcon, AlertTriangle, CheckCircle2, ArrowRight, Sparkles, FlaskConical } from 'lucide-react';

import EngagementRuleBuilder from '../components/engagements/EngagementRuleBuilder';
import EngagementTemplateBuilder from '../components/engagements/EngagementTemplateBuilder';
import EngagementAnalytics from '../components/engagements/EngagementAnalytics';
import AIEngagementAssistant from '../components/engagements/AIEngagementAssistant';
import AIABTestSuggestions from '../components/engagements/AIABTestSuggestions';
import PageHeader from '../components/ui/PageHeader';

export default function EngagementsPage() {
  const [rules, setRules] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [clientApps, setClientApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [roleChecked, setRoleChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showABSuggestions, setShowABSuggestions] = useState(false);
  const [selectedContentForAB, setSelectedContentForAB] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        // Engagements management is admin-only
        setIsAdmin(me?.role === 'admin');
      } catch (e) {
        setIsAdmin(false);
        console.error('Failed to fetch user role:', e);
      } finally {
        setRoleChecked(true);
      }
    })();
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const appsData = await base44.entities.ClientApp.list('-created_date');
      
      setClientApps(appsData);
      
      if (appsData.length > 0 && !selectedApp) {
        setSelectedApp(appsData[0]);
      }
      
      if (selectedApp) {
        const [rulesData, templatesData] = await Promise.all([
          base44.entities.EngagementRule.filter({ client_app_id: selectedApp.id }, '-created_date'),
          base44.entities.EngagementTemplate.filter({ client_app_id: selectedApp.id }, '-created_date')
        ]);
        
        setRules(rulesData);
        setTemplates(templatesData);
      } else if (appsData.length === 0) {
        setRules([]);
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error loading engagement data:', error);
    }
    setIsLoading(false);
  }, [selectedApp]);

  useEffect(() => {
    if (isAdmin && roleChecked) { // Only load data if admin and role check is complete
      loadData();
    }
  }, [selectedApp, isAdmin, roleChecked, loadData]); // Add loadData to dependencies

  const handleToggleRuleStatus = async (rule) => {
    const newStatus = rule.status === 'active' ? 'inactive' : 'active';
    try {
      await base44.entities.EngagementRule.update(rule.id, { status: newStatus });
      loadData();
    } catch (error) {
      console.error('Error updating rule status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30';
      case 'inactive': return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
      case 'testing': return 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30';
      default: return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30';
      case 'high': return 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30';
      case 'medium': return 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30';
      case 'low': return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
      default: return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
    }
  };

  const getEngagementIcon = (type) => {
    switch (type) {
      case 'checkin': return MessageSquare;
      case 'tooltip': return Target;
      case 'modal': return Settings;
      case 'notification': return Zap;
      default: return MessageSquare;
    }
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
      <div className="min-h-[40vh] flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center p-6 bg-[#111111] border border-[#262626] rounded-xl">
          <AlertTriangle className="w-6 h-6 text-[#fbbf24] mx-auto mb-2" />
          <h2 className="text-white font-semibold mb-1">Access restricted</h2>
          <p className="text-[#a3a3a3] text-sm">You need admin privileges to configure Engagements.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeader
          title="Adaptive Engagements"
          description="Psychology-driven user engagement automation"
          icon={Zap}
          docSection="engagements"
          actions={
            <Button
              onClick={() => setShowRuleBuilder(true)}
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          }
        />

        {/* App Selector */}
        {clientApps.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Select Application</label>
            <select
              value={selectedApp?.id || ''}
              onChange={(e) => {
                const app = clientApps.find(a => a.id === e.target.value);
                setSelectedApp(app);
              }}
              className="w-full md:w-80 p-3 bg-[#111111] border border-[#262626] rounded-lg text-white"
            >
              {clientApps.map(app => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
          </div>
        )}

        {selectedApp ? (
          <Tabs defaultValue="templates" className="space-y-6">
            <TabsList className="bg-[#111111] border border-[#262626] flex-wrap">
              <TabsTrigger value="templates" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a0a0a]">
                <MessageSquare className="w-4 h-4 mr-2" />
                Templates ({templates.length})
              </TabsTrigger>
              <TabsTrigger value="rules" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a0a0a]">
                <Target className="w-4 h-4 mr-2" />
                Rules ({rules.length})
              </TabsTrigger>
              <TabsTrigger value="ai-generator" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generator
              </TabsTrigger>
              <TabsTrigger value="ab-testing" className="data-[state=active]:bg-[#10b981] data-[state=active]:text-white">
                <FlaskConical className="w-4 h-4 mr-2" />
                A/B Testing
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-[#fbbf24] data-[state=active]:text-[#0a0a0a]">
                <BarChart className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              {/* Templates Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Engagement Templates</h2>
                  <p className="text-sm text-[#a3a3a3]">Design the content and appearance of your engagements <span className="text-[#fbbf24]">(Required first step)</span></p>
                </div>
                <Dialog open={showTemplateBuilder} onOpenChange={setShowTemplateBuilder}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a0a0a]">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#111111] border-[#262626] text-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-white">
                        {editingTemplate ? 'Edit Engagement Template' : 'Create New Engagement Template'}
                      </DialogTitle>
                    </DialogHeader>
                    <EngagementTemplateBuilder
                      template={editingTemplate}
                      clientApp={selectedApp}
                      onSave={() => {
                        setShowTemplateBuilder(false);
                        setEditingTemplate(null);
                        loadData();
                      }}
                      onCancel={() => {
                        setShowTemplateBuilder(false);
                        setEditingTemplate(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Templates List */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="bg-[#111111] border-[#262626] animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-[#262626] rounded mb-3" />
                        <div className="h-20 bg-[#262626] rounded mb-3" />
                        <div className="h-3 bg-[#262626] rounded" />
                      </CardContent>
                    </Card>
                  ))
                ) : templates.length === 0 ? (
                  <Card className="bg-[#111111] border-[#262626] md:col-span-2 lg:col-span-3">
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Create your first template</h3>
                      <p className="text-[#a3a3a3] mb-4">
                        Templates define how your engagements look and behave. You'll need at least one template before creating engagement rules.
                      </p>
                      <Button
                        onClick={() => setShowTemplateBuilder(true)}
                        className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a0a0a]"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Template
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  templates.map(template => {
                    const TemplateIcon = getEngagementIcon(template.type);
                    return (
                      <Card key={template.id} className="bg-[#111111] border-[#262626] card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <TemplateIcon className="w-4 h-4 text-[#fbbf24]" />
                              <h3 className="font-semibold text-white">{template.name}</h3>
                            </div>
                            <Badge className="bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30 capitalize">
                              {template.type}
                            </Badge>
                          </div>

                          <div className="mb-4">
                            <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#262626] min-h-[80px]">
                              <p className="text-sm font-medium text-white mb-1">
                                {template.content?.title || 'No title'}
                              </p>
                              <p className="text-xs text-[#a3a3a3] line-clamp-3">
                                {template.content?.message || 'No message content'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {template.personalization?.use_psychographic_data && (
                                <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30 text-xs">
                                  <UserIcon className="w-3 h-3 mr-1" />
                                  AI Personalized
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTemplate(template);
                                setShowTemplateBuilder(true);
                              }}
                              className="border-[#262626] hover:border-[#fbbf24]/50"
                            >
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              {templates.length > 0 && (
                <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                    <p className="text-sm text-white">
                      Great! You have {templates.length} template{templates.length !== 1 ? 's' : ''}. Now you can create engagement rules that use these templates.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rules" className="space-y-6">
              {/* Rules Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Engagement Rules</h2>
                  <p className="text-sm text-[#a3a3a3]">Define when and how to engage with your users using your templates</p>
                </div>
                <Dialog open={showRuleBuilder} onOpenChange={setShowRuleBuilder}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a0a0a]"
                      disabled={templates.length === 0}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#111111] border-[#262626] text-white">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-white">
                        {editingRule ? 'Edit Engagement Rule' : 'Create New Engagement Rule'}
                      </DialogTitle>
                    </DialogHeader>
                    <EngagementRuleBuilder
                      rule={editingRule}
                      clientApp={selectedApp}
                      templates={templates}
                      onSave={() => {
                        setShowRuleBuilder(false);
                        setEditingRule(null);
                        loadData();
                      }}
                      onCancel={() => {
                        setShowRuleBuilder(false);
                        setEditingRule(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {templates.length === 0 && (
                <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/20 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-[#fbbf24]" />
                    <p className="text-sm text-white">
                      Create at least one template first, then return here to build engagement rules.
                    </p>
                  </div>
                </div>
              )}

              {/* Rules List */}
              <div className="grid gap-4">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="bg-[#111111] border-[#262626] animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-[#262626] rounded mb-4" />
                        <div className="h-3 bg-[#262626] rounded mb-2" />
                        <div className="h-3 bg-[#262626] rounded w-3/4" />
                      </CardContent>
                    </Card>
                  ))
                ) : rules.length === 0 && templates.length > 0 ? (
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardContent className="p-8 text-center">
                      <Target className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Create your first engagement rule</h3>
                      <p className="text-[#a3a3a3] mb-4">
                        Now that you have templates, create rules to automatically trigger personalized experiences
                      </p>
                      <Button
                        onClick={() => setShowRuleBuilder(true)}
                        className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a0a0a]"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Rule
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  rules.map(rule => {
                    const EngagementIcon = getEngagementIcon(rule.engagement_action?.type);
                    return (
                      <Card key={rule.id} className="bg-[#111111] border-[#262626] card-hover">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-[#1a1a1a]">
                                <EngagementIcon className="w-5 h-5 text-[#fbbf24]" />
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-lg">{rule.name}</h3>
                                <p className="text-sm text-[#a3a3a3]">{rule.description || 'No description'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(rule.status)}>
                                {rule.status}
                              </Badge>
                              <Badge className={getPriorityColor(rule.engagement_action?.priority)}>
                                {rule.engagement_action?.priority || 'medium'}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-xs font-medium text-[#a3a3a3] mb-1">Engagement Type</p>
                              <p className="text-sm text-white capitalize">
                                {rule.engagement_action?.type || 'Unknown'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-[#a3a3a3] mb-1">Conditions</p>
                              <p className="text-sm text-white">
                                {[
                                  rule.trigger_conditions?.psychographic_conditions?.length > 0 && 'Psychographic',
                                  rule.trigger_conditions?.behavioral_conditions?.length > 0 && 'Behavioral',
                                  rule.trigger_conditions?.timing_conditions && 'Timing'
                                ].filter(Boolean).join(', ') || 'None'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-[#a3a3a3] mb-1">Performance</p>
                              <div className="flex items-center gap-3 text-sm">
                                <span className="text-[#00d4ff]">
                                  {rule.analytics?.triggered_count || 0} triggers
                                </span>
                                <span className="text-[#10b981]">
                                  {rule.analytics?.conversion_count || 0} conversions
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#a3a3a3]" />
                              <span className="text-xs text-[#a3a3a3]">
                                {rule.analytics?.last_triggered 
                                  ? `Last triggered ${new Date(rule.analytics.last_triggered).toLocaleDateString()}`
                                  : 'Never triggered'
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingRule(rule);
                                  setShowRuleBuilder(true);
                                }}
                                className="border-[#262626] hover:border-[#fbbf24]/50"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleToggleRuleStatus(rule)}
                                className={rule.status === 'active' 
                                  ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white' 
                                  : 'bg-[#10b981] hover:bg-[#059669] text-white'
                                }
                              >
                                {rule.status === 'active' ? (
                                  <>
                                    <Pause className="w-3 h-3 mr-1" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3 mr-1" />
                                    Activate
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="ai-generator" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">AI Content Generator</h2>
                <p className="text-sm text-[#a3a3a3]">Generate compelling engagement content with AI assistance</p>
              </div>
              <AIEngagementAssistant 
                onSelectContent={(content) => {
                  // Pre-fill template builder with AI-generated content
                  setEditingTemplate({
                    type: content.channel === 'email' ? 'notification' : content.channel === 'push' ? 'notification' : 'checkin',
                    content: {
                      title: content.title,
                      message: content.message,
                      buttons: content.cta ? [{ text: content.cta, action: 'dismiss' }] : []
                    }
                  });
                  setShowTemplateBuilder(true);
                }}
              />
            </TabsContent>

            <TabsContent value="ab-testing" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">AI A/B Test Suggestions</h2>
                <p className="text-sm text-[#a3a3a3]">Get AI-powered recommendations for optimizing your engagement copy</p>
              </div>
              
              {templates.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm text-[#a3a3a3] mb-2 block">Select a template to analyze</label>
                  <div className="flex flex-wrap gap-2">
                    {templates.map(t => (
                      <Button
                        key={t.id}
                        variant={selectedContentForAB?.id === t.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedContentForAB(t)}
                        className={selectedContentForAB?.id === t.id 
                          ? "bg-[#10b981] text-white" 
                          : "border-[#262626] text-[#a3a3a3]"
                        }
                      >
                        {t.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <AIABTestSuggestions 
                currentContent={selectedContentForAB 
                  ? `Title: ${selectedContentForAB.content?.title || ''}\nBody: ${selectedContentForAB.content?.message || ''}`
                  : null
                }
                onCreateTest={(testData) => {
                  // Could integrate with ABTestingStudio page
                  console.log('Create A/B test:', testData);
                  alert(`A/B Test "${testData.name}" created! Navigate to A/B Testing Studio to configure.`);
                }}
              />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Engagement Analytics</h2>
                <p className="text-sm text-[#a3a3a3]">Monitor performance and optimize your engagement strategies</p>
              </div>
              <EngagementAnalytics clientApp={selectedApp} />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-8 text-center">
              <Zap className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Applications Found</h3>
              <p className="text-[#a3a3a3]">
                Create a client application first in the Settings page to start using Adaptive Engagements.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}