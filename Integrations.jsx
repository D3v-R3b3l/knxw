
import React, { useState, useEffect } from 'react';
import { ClientApp, HubSpotSync, HubSpotIntegrationConfig } from '@/api/entities';
import { syncHubSpot } from '@/api/functions';
import { setupHubSpotIntegration } from '@/api/functions/setupHubspotIntegration';
import { azureBlobExport } from "@/api/functions";
import { azureEventHubsBridge } from "@/api/functions/azureEventHubsBridge";
import { awsS3Export } from "@/api/functions";
import { awsEventBridge } from "@/api/functions";
import { awsSESNotification } from "@/api/functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Zap, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Users,
  RefreshCw,
  Clock,
  TrendingUp,
  Mail,
  Cloud,
  Server,
  Send,
  Package,
  Database,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';
import { SubscriptionGate, useSubscription } from '../components/billing/SubscriptionGate';

export default function IntegrationsPage() {
  const [clientApps, setClientApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [hubspotToken, setHubspotToken] = useState('');
  const [syncHistory, setSyncHistory] = useState([]);
  const [isSetupLoading, setIsSetupLoading] = useState(false);
  const [isSyncLoading, setIsSyncLoading] = useState(false);
  const [hubspotSetupComplete, setHubspotSetupComplete] = useState(false); // Renamed from setupComplete
  const [syncStats, setSyncStats] = useState(null);

  // Azure states
  const [azureContainer, setAzureContainer] = useState("knxw-demo");
  const [azureBlobPath, setAzureBlobPath] = useState("exports/sample.json");
  const [azureBlobResult, setAzureBlobResult] = useState(null);
  const [azureBlobLoading, setAzureBlobLoading] = useState(false);

  const [azureTopic, setAzureTopic] = useState("knxw.events");
  const [azureEventResult, setAzureEventResult] = useState(null);
  const [azureEventLoading, setAzureEventLoading] = useState(false);

  // AWS states
  const [awsBucket, setAwsBucket] = useState("knxw-analytics-exports");
  const [awsObjectKey, setAwsObjectKey] = useState("exports/analytics-sample.json");
  const [awsS3Result, setAwsS3Result] = useState(null);
  const [awsS3Loading, setAwsS3Loading] = useState(false);

  const [awsEventBusName, setAwsEventBusName] = useState("default");
  const [awsEventBridgeResult, setAwsEventBridgeResult] = useState(null);
  const [awsEventBridgeLoading, setAwsEventBridgeLoading] = useState(false);

  const [awsToEmail, setAwsToEmail] = useState("");
  const [awsSESResult, setAwsSESResult] = useState(null);
  const [awsSESLoading, setAwsSESLoading] = useState(false);

  const { subscription, checkFeatureAccess, planKey } = useSubscription();

  const loadClientApps = React.useCallback(async () => {
    try {
      const apps = await ClientApp.list('-created_date');
      setClientApps(apps);
      if (apps.length > 0 && !selectedApp) {
        setSelectedApp(apps[0]);
      }
    } catch (error) {
      console.error('Error loading client apps:', error);
    }
  }, [selectedApp]);

  const loadSyncHistory = React.useCallback(async () => {
    if (!selectedApp) return;
    try {
      const history = await HubSpotSync.filter(
        { client_app_id: selectedApp.id }, 
        '-synced_at', 
        50
      );
      setSyncHistory(history);
      
      const totalSyncs = history.length;
      const successfulSyncs = history.filter(s => s.sync_status === 'success').length;
      const lastSync = history.length > 0 ? history[0].synced_at : null;
      
      setSyncStats({
        total_syncs: totalSyncs,
        successful_syncs: successfulSyncs,
        success_rate: totalSyncs > 0 ? Math.round((successfulSyncs / totalSyncs) * 100) : 0,
        last_sync: lastSync
      });
    } catch (error) {
      console.error('Error loading sync history:', error);
    }
  }, [selectedApp]);

  // Add function to check HubSpot setup status
  const checkHubSpotSetup = React.useCallback(async () => {
    if (!selectedApp) return;
    try {
      // Check if HubSpot integration is already configured
      const configs = await HubSpotIntegrationConfig.filter({ client_app_id: selectedApp.id });
      setHubspotSetupComplete(configs.length > 0 && configs[0].setup_completed);
    } catch (error) {
      console.error('Error checking HubSpot setup:', error);
      setHubspotSetupComplete(false);
    }
  }, [selectedApp]);

  useEffect(() => {
    loadClientApps();
  }, [loadClientApps]);

  useEffect(() => {
    if (selectedApp) {
      checkHubSpotSetup();
      loadSyncHistory();
    }
  }, [selectedApp, loadSyncHistory, checkHubSpotSetup]); // Added checkHubSpotSetup here

  const handleSetupHubSpot = async () => {
    if (!hubspotToken.trim()) {
      alert('Please enter your HubSpot access token');
      return;
    }

    setIsSetupLoading(true);
    try {
      const { data } = await setupHubSpotIntegration({
        client_app_id: selectedApp.id,
        hubspot_access_token: hubspotToken,
        action: 'setup_properties'
      });

      if (data.status === 'success') {
        setHubspotSetupComplete(true);
        setHubspotToken(''); // Clear the token from frontend
        alert('HubSpot integration setup complete! Access token stored securely.');
      } else {
        alert('Setup failed: ' + data.message);
      }
    } catch (error) {
      console.error('Setup failed:', error);
      alert('Setup failed: ' + (error.response?.data?.message || error.message));
    }
    setIsSetupLoading(false);
  };

  const handleManualSync = async () => {
    setIsSyncLoading(true);
    try {
      const { data } = await syncHubSpot({
        action: 'batch_sync',
        client_app_id: selectedApp.id,
        // Note: No longer passing the token here - it's retrieved securely on the backend
      });

      await loadSyncHistory();
      alert(`Batch sync completed: ${data.synced_count} profiles synced, ${data.error_count} errors`);
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed: ' + (error.response?.data?.message || error.message));
    }
    setIsSyncLoading(false);
  };

  const handleAzureBlobTest = async () => {
    if (!selectedApp) return;
    setAzureBlobLoading(true);
    setAzureBlobResult(null);
    try {
      const { data } = await azureBlobExport({
        client_app_id: selectedApp.id,
        container_name: azureContainer,
        blob_path: azureBlobPath,
        data: {
          sample: true,
          app: selectedApp.name,
          ts: new Date().toISOString()
        }
      });
      setAzureBlobResult({ ok: true, data });
    } catch (e) {
      setAzureBlobResult({ ok: false, error: e?.response?.data || e?.message || "Failed" });
    } finally {
      setAzureBlobLoading(false);
    }
  };

  const handleAzureEventTest = async () => {
    if (!selectedApp) return;
    setAzureEventLoading(true);
    setAzureEventResult(null);
    try {
      const { data } = await azureEventHubsBridge({
        client_app_id: selectedApp.id,
        topic: azureTopic,
        messages: [
          { type: "demo_event", event_type: "page_view", path: "/", ts: new Date().toISOString() },
          { type: "demo_event", event_type: "click", element: "#cta", ts: new Date().toISOString() }
        ]
      });
      setAzureEventResult({ ok: true, data });
    } catch (e) {
      setAzureEventResult({ ok: false, error: e?.response?.data || e?.message || "Failed" });
    } finally {
      setAzureEventLoading(false);
    }
  };

  // AWS handlers
  const handleAwsS3Test = async () => {
    if (!selectedApp) return;
    setAwsS3Loading(true);
    setAwsS3Result(null);
    try {
      const { data } = await awsS3Export({
        client_app_id: selectedApp.id,
        bucket_name: awsBucket,
        object_key: awsObjectKey,
        data: {
          export_type: 'psychographic_analytics',
          app: selectedApp.name,
          timestamp: new Date().toISOString(),
          sample_insights: [
            { type: 'behavioral_pattern', confidence: 0.87, description: 'High engagement with analytical content' },
            { type: 'emotional_trigger', confidence: 0.92, description: 'Responds well to achievement-oriented messaging' }
          ]
        }
      });
      setAwsS3Result({ ok: true, data });
    } catch (e) {
      setAwsS3Result({ ok: false, error: e?.response?.data || e?.message || "Failed" });
    } finally {
      setAwsS3Loading(false);
    }
  };

  const handleAwsEventBridgeTest = async () => {
    if (!selectedApp) return;
    setAwsEventBridgeLoading(true);
    setAwsEventBridgeResult(null);
    try {
      const { data } = await awsEventBridge({
        client_app_id: selectedApp.id,
        event_bus_name: awsEventBusName,
        source: 'knxw.analytics',
        events: [
          {
            type: 'psychographic_profile_updated',
            user_id: 'demo_user_456',
            changes: ['risk_profile', 'emotional_state'],
            confidence: 0.91,
            timestamp: new Date().toISOString()
          },
          {
            type: 'engagement_opportunity',
            insight_type: 'high_conversion_potential',
            priority: 'high',
            recommended_action: 'show_premium_upgrade_modal',
            timestamp: new Date().toISOString()
          }
        ]
      });
      setAwsEventBridgeResult({ ok: true, data });
    } catch (e) {
      setAwsEventBridgeResult({ ok: false, error: e?.response?.data || e?.message || "Failed" });
    } finally {
      setAwsEventBridgeLoading(false);
    }
  };

  const handleAwsSESTest = async () => {
    if (!selectedApp) return;
    setAwsSESLoading(true);
    setAwsSESResult(null);
    try {
      const { data } = await awsSESNotification({
        client_app_id: selectedApp.id,
        to_email: awsToEmail,
        subject: `knXw Alert: High-Priority Insights for ${selectedApp.name}`,
        message_type: 'insight_alert',
        insight_data: {
          type: 'engagement_optimization_opportunity',
          affected_users: 127,
          confidence: 0.89,
          recommended_actions: [
            'Deploy personalized modal to high-openness users',
            'A/B test achievement-based messaging for goal-oriented segment',
            'Schedule follow-up analysis in 7 days'
          ]
        }
      });
      setAwsSESResult({ ok: true, data });
    } catch (e) {
      setAwsSESResult({ ok: false, error: e?.response?.data || e?.message || "Failed" });
    } finally {
      setAwsSESLoading(false);
    }
  };

  const getSyncStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">Success</Badge>;
      case 'failed':
        return <Badge className="bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30">Failed</Badge>;
      case 'partial':
        return <Badge className="bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30">Partial</Badge>;
      default:
        return <Badge className="bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8" data-tour="integrations-overview">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#ec4899] to-[#be185d]">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Integrations
            </h1>
          </div>
          <p className="text-[#a3a3a3] text-lg">
            Connect knXw psychographic intelligence with your existing tools
          </p>
        </div>

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
          <Tabs defaultValue="hubspot" className="space-y-6">
            <TabsList className="bg-[#111111] border border-[#262626] flex flex-wrap">
              <TabsTrigger value="hubspot" className="data-[state=active]:bg-[#ec4899] data-[state=active]:text-white">
                <Mail className="w-4 h-4 mr-2" />
                HubSpot CRM
              </TabsTrigger>
              <TabsTrigger value="azure" className="data-[state=active]:bg-[#2563eb] data-[state=active]:text-white">
                <Cloud className="w-4 h-4 mr-2" />
                Microsoft Azure
              </TabsTrigger>
              <TabsTrigger value="aws" className="data-[state=active]:bg-[#ff9500] data-[state=active]:text-white">
                <Server className="w-4 h-4 mr-2" />
                Amazon AWS
              </TabsTrigger>
              <TabsTrigger value="coming-soon" className="data-[state=active]:bg-[#ec4899] data-[state=active]:text-white" disabled>
                More Coming Soon
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hubspot" className="space-y-6">
              {/* HubSpot Integration Card */}
              <Card className="bg-[#111111] border-[#262626]" data-tour="integrations-hubspot">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#ff7a59] to-[#ff5722] rounded-xl flex items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">HubSpot CRM Integration</CardTitle>
                        <p className="text-[#a3a3a3] mt-1">
                          Sync psychographic profiles directly into HubSpot contact records
                        </p>
                      </div>
                    </div>
                    {hubspotSetupComplete && (
                      <CheckCircle className="w-8 h-8 text-[#10b981]" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Configuration Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Configuration</h4>
                    {!hubspotSetupComplete ? (
                      <div>
                        <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                          HubSpot Access Token
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="password"
                            placeholder="Enter your HubSpot private app token"
                            value={hubspotToken}
                            onChange={(e) => setHubspotToken(e.target.value)}
                            className="flex-1 bg-[#0a0a0a] border-[#262626] text-white"
                          />
                          <Button
                            onClick={handleSetupHubSpot}
                            disabled={isSetupLoading || !hubspotToken.trim()}
                            className="bg-[#ff7a59] hover:bg-[#ff5722] text-white"
                          >
                            {isSetupLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Setting up...
                              </>
                            ) : (
                              <>
                                <Settings className="w-4 h-4 mr-2" />
                                Setup Integration
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-[#a3a3a3] mt-1">
                          Your access token will be encrypted and stored securely on our servers.{' '}
                          <a 
                            href="https://developers.hubspot.com/docs/api/private-apps" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#00d4ff] hover:underline"
                          >
                            Learn how to create a private app <ExternalLink className="w-3 h-3 inline ml-1" />
                          </a>
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                        <div className="flex items-center gap-2 text-[#10b981]">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">HubSpot Integration Configured</span>
                        </div>
                        <p className="text-sm text-[#a3a3a3] mt-1">
                          Your HubSpot access token is securely stored and encrypted.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* What Gets Synced */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Psychographic Data Synced to HubSpot</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded-lg">
                        <h5 className="font-medium text-white mb-2">Personality Traits</h5>
                        <ul className="text-sm text-[#a3a3a3] space-y-1">
                          <li>• Openness to Experience (0-100)</li>
                          <li>• Conscientiousness (0-100)</li>
                          <li>• Extraversion (0-100)</li>
                          <li>• Agreeableness (0-100)</li>
                          <li>• Neuroticism (0-100)</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded-lg">
                        <h5 className="font-medium text-white mb-2">Behavioral Insights</h5>
                        <ul className="text-sm text-[#a3a3a3] space-y-1">
                          <li>• Risk Profile (Conservative/Moderate/Aggressive)</li>
                          <li>• Cognitive Style (Analytical/Intuitive/etc.)</li>
                          <li>• Current Emotional Mood</li>
                          <li>• Primary Motivations</li>
                          <li>• Preferred Content Type</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Sync Controls */}
                  {hubspotSetupComplete && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white">Sync Operations</h4>
                        <Button
                          onClick={handleManualSync}
                          disabled={isSyncLoading}
                          className="bg-[#10b981] hover:bg-[#059669] text-white"
                        >
                          {isSyncLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Manual Batch Sync
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {syncStats && (
                        <div className="grid md:grid-cols-4 gap-4">
                          <div className="p-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-center">
                            <div className="text-2xl font-bold text-[#00d4ff]">{syncStats.total_syncs}</div>
                            <div className="text-xs text-[#a3a3a3]">Total Syncs</div>
                          </div>
                          <div className="p-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-center">
                            <div className="text-2xl font-bold text-[#10b981]">{syncStats.successful_syncs}</div>
                            <div className="text-xs text-[#a3a3a3]">Successful</div>
                          </div>
                          <div className="p-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-center">
                            <div className="text-2xl font-bold text-[#fbbf24]">{syncStats.success_rate}%</div>
                            <div className="text-xs text-[#a3a3a3]">Success Rate</div>
                          </div>
                          <div className="p-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-center">
                            <div className="text-sm font-bold text-white">
                              {syncStats.last_sync ? format(new Date(syncStats.last_sync), 'MMM d') : 'Never'}
                            </div>
                            <div className="text-xs text-[#a3a3a3]">Last Sync</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sync History */}
              {syncHistory.length > 0 && hubspotSetupComplete && (
                <Card className="bg-[#111111] border-[#262626]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Clock className="w-5 h-5" />
                      Sync History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {syncHistory.map((sync) => (
                        <div key={sync.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#262626] rounded-lg">
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-[#a3a3a3]" />
                            <div>
                              <div className="text-sm font-medium text-white">
                                {sync.email}
                              </div>
                              <div className="text-xs text-[#a3a3a3]">
                                {format(new Date(sync.synced_at), 'MMM d, yyyy HH:mm')}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getSyncStatusBadge(sync.sync_status)}
                            {sync.hubspot_contact_id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(`https://app.hubspot.com/contacts/${sync.hubspot_contact_id}`, '_blank')}
                                className="text-[#a3a3a3] hover:text-white"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="azure" className="space-y-6">
              <SubscriptionGate 
                feature="eventbridge_events" 
                currentPlan={planKey} 
                requiredPlan="growth"
              >
                <Card className="bg-[#111111] border-[#262626]" data-tour="integrations-azure">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] rounded-xl flex items-center justify-center">
                        <Cloud className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">Azure Blob Storage Export</CardTitle>
                        <p className="text-[#a3a3a3] mt-1">
                          Export sample analytics to Azure Blob Storage to validate connectivity and IAM.
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Container Name</label>
                        <Input
                          value={azureContainer}
                          onChange={(e) => setAzureContainer(e.target.value)}
                          className="bg-[#0a0a0a] border-[#262626] text-white"
                          placeholder="knxw-demo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Blob Path</label>
                        <Input
                          value={azureBlobPath}
                          onChange={(e) => setAzureBlobPath(e.target.value)}
                          className="bg-[#0a0a0a] border-[#262626] text-white"
                          placeholder="exports/sample.json"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={handleAzureBlobTest}
                        disabled={azureBlobLoading}
                        className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                      >
                        {azureBlobLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Server className="w-4 h-4 mr-2" />}
                        Test Export
                      </Button>
                      {azureBlobResult && (
                        <span className={`text-sm ${azureBlobResult.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                          {azureBlobResult.ok ? `OK → ${azureBlobResult.data?.container_name}/${azureBlobResult.data?.blob_path}` : `Error: ${typeof azureBlobResult.error === 'string' ? azureBlobResult.error : (azureBlobResult.error?.error || 'Failed')}`}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#a3a3a3]">
                      Requires secret AZURE_STORAGE_CONNECTION_STRING configured on your server.
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#262626]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#059669] to-[#047857] rounded-xl flex items-center justify-center">
                        <Send className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">Azure Event Hubs Streaming</CardTitle>
                        <p className="text-[#a3a3a3] mt-1">
                          Send demo events to Event Hubs to wire knXw into your Azure data plane.
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Event Hub Name / Topic</label>
                        <Input
                          value={azureTopic}
                          onChange={(e) => setAzureTopic(e.target.value)}
                          className="bg-[#0a0a0a] border-[#262626] text-white"
                          placeholder="knxw.events"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={handleAzureEventTest}
                        disabled={azureEventLoading}
                        className="bg-[#059669] hover:bg-[#047857] text-white"
                      >
                        {azureEventLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        Send Demo Events
                      </Button>
                      {azureEventResult && (
                        <span className={`text-sm ${azureEventResult.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                          {azureEventResult.ok
                            ? `OK → sent ${azureEventResult.data?.sent}${azureEventResult.data?.simulated ? ' (simulated)' : ''}`
                            : `Error: ${typeof azureEventResult.error === 'string' ? azureEventResult.error : (azureEventResult.error?.error || 'Failed')}`}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#a3a3a3]">
                      Requires secrets AZURE_EVENT_HUBS_CONNECTION_STRING and AZURE_EVENT_HUB_NAME configured on your server.
                    </div>
                  </CardContent>
                </Card>
              </SubscriptionGate>
            </TabsContent>

            <TabsContent value="aws" className="space-y-6">
              <SubscriptionGate 
                feature="eventbridge_events" 
                currentPlan={planKey} 
                requiredPlan="growth"
              >
                <Card className="bg-[#111111] border-[#262626]" data-tour="integrations-aws">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#ff9500] to-[#e67e00] rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">AWS S3 Data Export</CardTitle>
                        <p className="text-[#a3a3a3] mt-1">
                          Export psychographic analytics to Amazon S3 for data lake integration and analysis.
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#a3a3a3] mb-2">S3 Bucket Name</label>
                        <Input
                          value={awsBucket}
                          onChange={(e) => setAwsBucket(e.target.value)}
                          className="bg-[#0a0a0a] border-[#262626] text-white"
                          placeholder="knxw-analytics-exports"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Object Key</label>
                        <Input
                          value={awsObjectKey}
                          onChange={(e) => setAwsObjectKey(e.target.value)}
                          className="bg-[#0a0a0a] border-[#262626] text-white"
                          placeholder="exports/analytics-sample.json"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={handleAwsS3Test}
                        disabled={awsS3Loading}
                        className="bg-[#ff9500] hover:bg-[#e67e00] text-white"
                      >
                        {awsS3Loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Package className="w-4 h-4 mr-2" />}
                        Test S3 Export
                      </Button>
                      {awsS3Result && (
                        <span className={`text-sm ${awsS3Result.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                          {awsS3Result.ok ? `✓ Exported to s3://${awsS3Result.data?.bucket_name}/${awsS3Result.data?.object_key}` : `✗ Error: ${typeof awsS3Result.error === 'string' ? awsS3Result.error : (awsS3Result.error?.error || 'Failed')}`}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#a3a3a3]">
                      Requires AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_DEFAULT_REGION configured on your server.
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#262626]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#059669] to-[#047857] rounded-xl flex items-center justify-center">
                        <Send className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">AWS EventBridge Integration</CardTitle>
                        <p className="text-[#a3a3a3] mt-1">
                          Stream psychographic events to EventBridge for real-time processing and orchestration.
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Event Bus Name</label>
                        <Input
                          value={awsEventBusName}
                          onChange={(e) => setAwsEventBusName(e.target.value)}
                          className="bg-[#0a0a0a] border-[#262626] text-white"
                          placeholder="default"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={handleAwsEventBridgeTest}
                        disabled={awsEventBridgeLoading}
                        className="bg-[#059669] hover:bg-[#047857] text-white"
                      >
                        {awsEventBridgeLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        Send Demo Events
                      </Button>
                      {awsEventBridgeResult && (
                        <span className={`text-sm ${awsEventBridgeResult.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                          {awsEventBridgeResult.ok
                            ? `✓ Sent ${awsEventBridgeResult.data?.events_sent}/${awsEventBridgeResult.data?.total_events} events to ${awsEventBridgeResult.data?.event_bus_name}`
                            : `✗ Error: ${typeof awsEventBridgeResult.error === 'string' ? awsEventBridgeResult.error : (awsEventBridgeResult.error?.error || 'Failed')}`}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#a3a3a3]">
                      Events include psychographic profile updates and intelligent insights with full metadata.
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#262626]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-xl flex items-center justify-center">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">AWS SES Email Notifications</CardTitle>
                        <p className="text-[#a3a3a3] mt-1">
                          Send intelligent alerts and reports via Amazon Simple Email Service.
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#a3a3a3] mb-2">Recipient Email</label>
                        <Input
                          value={awsToEmail}
                          onChange={(e) => setAwsToEmail(e.target.value)}
                          className="bg-[#0a0a0a] border-[#262626] text-white"
                          placeholder="alerts@your-company.com"
                          type="email"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={handleAwsSESTest}
                        disabled={awsSESLoading || !awsToEmail.trim()}
                        className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                      >
                        {awsSESLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />}
                        Send Demo Alert
                      </Button>
                      {awsSESResult && (
                        <span className={`text-sm ${awsSESResult.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                          {awsSESResult.ok
                            ? `✓ Email sent! Message ID: ${awsSESResult.data?.message_id?.substring(0, 8)}...`
                            : `✗ Error: ${typeof awsSESResult.error === 'string' ? awsSESResult.error : (awsSESResult.error?.error || 'Failed')}`}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#a3a3a3]">
                      Requires AWS SES configuration with verified sending domain and AWS_SES_FROM_EMAIL variable.
                    </div>
                  </CardContent>
                </Card>
              </SubscriptionGate>
            </TabsContent>

            <TabsContent value="coming-soon">
              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 text-[#a3a3a3] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    More Integrations Coming Soon
                  </h3>
                  <p className="text-[#a3a3a3] max-w-md mx-auto">
                    We're working on integrations with Salesforce, Intercom, Segment, and more popular platforms.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Applications Found</h3>
              <p className="text-[#a3a3a3]">
                Create a client application first in the Settings page to start using integrations.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
