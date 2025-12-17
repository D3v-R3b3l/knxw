import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from '@/api/base44Client';
import {
  Database,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Users,
  Activity,
  Brain,
  Server,
  Loader2,
  Sparkles } from
'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function DemoDataPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const { toast } = useToast();

  const scenarios = [
  {
    id: 'enterprise_saas',
    name: 'Enterprise SaaS',
    description: 'B2B software users with analytical cognitive styles, conservative risk profiles, and achievement/security motivations',
    icon: Server,
    color: 'from-[#00d4ff] to-[#0ea5e9]',
    userCount: 50
  },
  {
    id: 'consumer_app',
    name: 'Consumer App',
    description: 'B2C users with diverse cognitive styles, mixed risk profiles, and social/learning motivations',
    icon: Users,
    color: 'from-[#ec4899] to-[#db2777]',
    userCount: 75
  },
  {
    id: 'mixed',
    name: 'Mixed Audience',
    description: 'Balanced distribution across all psychographic dimensions for comprehensive testing',
    icon: Brain,
    color: 'from-[#8b5cf6] to-[#7c3aed]',
    userCount: 100
  }];


  const handleSeedData = async (scenario) => {
    setIsSeeding(true);
    setLastResult(null);

    try {
      const response = await base44.functions.invoke('seedRealisticDemoData', {
        scenario: scenario.id,
        userCount: scenario.userCount,
        clearExisting: true
      });

      if (response.data?.success) {
        setLastResult(response.data);
        toast({
          title: "Demo Data Seeded",
          description: `Successfully created ${response.data.counts.profiles} profiles, ${response.data.counts.events} events, and ${response.data.counts.insights} insights.`,
          variant: "success"
        });

        // Dispatch event to refresh dashboard
        window.dispatchEvent(new CustomEvent('knxw-demo-data-seeded', {
          detail: { scenario: scenario.id, counts: response.data.counts }
        }));
      } else {
        throw new Error(response.data?.error || 'Seeding failed');
      }
    } catch (error) {
      console.error('Seeding error:', error);
      toast({
        title: "Seeding Failed",
        description: error.message || 'Failed to seed demo data',
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    setShowClearDialog(false);
    setIsClearing(true);

    try {
      const response = await base44.functions.invoke('cleanupDemoData', {
        confirm: true,
        dry_run: false
      });

      if (response.data?.success) {
        toast({
          title: "Demo Data Cleared",
          description: `Removed ${response.data.total_records_deleted} demo records.`,
          variant: "success"
        });

        setLastResult(null);

        // Dispatch event to refresh dashboard
        window.dispatchEvent(new CustomEvent('knxw-demo-data-cleared'));
      } else {
        throw new Error(response.data?.error || 'Cleanup failed');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Cleanup Failed",
        description: error.message || 'Failed to clear demo data',
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#fbbf24] to-[#f59e0b]">
              <Sparkles className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <h1 className="text-4xl font-bold">Demo Data Studio</h1>
          </div>
          <p className="text-lg text-[#a3a3a3] max-w-3xl">
            Seed realistic, psychographically-diverse demo data to test knXw's intelligence infrastructure. 
            All data is marked as demo and can be cleared at any time.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8 p-4 bg-[#111111] border border-[#262626] rounded-xl">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-[#00d4ff]" />
            <div>
              <div className="text-sm font-semibold">Demo Data Management</div>
              <div className="text-xs text-[#a3a3a3]">Seed or clear demo data for testing</div>
            </div>
          </div>
          <Button
            onClick={() => setShowClearDialog(true)}
            disabled={isClearing}
            variant="outline"
            className="border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 whitespace-nowrap">

            {isClearing ?
            <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Clearing...</span>
                <span className="sm:hidden">Clearing</span>
              </> :

            <>
                <Trash2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Clear All Demo Data</span>
                <span className="sm:hidden">Clear Data</span>
              </>
            }
          </Button>
        </div>

        {/* Scenario Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {scenarios.map((scenario) => {
            const IconComponent = scenario.icon;
            return (
              <Card key={scenario.id} className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${scenario.color} flex items-center justify-center mb-4`}>
                    <IconComponent className="w-6 h-6 text-[#0a0a0a]" />
                  </div>
                  <CardTitle className="text-white">{scenario.name}</CardTitle>
                  <CardDescription className="text-[#a3a3a3]">
                    {scenario.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#a3a3a3]">Users:</span>
                      <Badge variant="outline" className="text-slate-50 px-2.5 py-0.5 text-xs font-semibold rounded-full inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">{scenario.userCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#a3a3a3]">Events per user:</span>
                      <Badge variant="outline" className="text-slate-50 px-2.5 py-0.5 text-xs font-semibold rounded-full inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">10-30</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#a3a3a3]">Insights per user:</span>
                      <Badge variant="outline" className="text-slate-50 px-2.5 py-0.5 text-xs font-semibold rounded-full inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">3</Badge>
                    </div>
                    <Button
                      onClick={() => handleSeedData(scenario)}
                      disabled={isSeeding}
                      className="w-full bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] mt-4 whitespace-nowrap overflow-hidden">

                      {isSeeding ?
                      <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
                          <span className="truncate">Seeding...</span>
                        </> :

                      <>
                          <RefreshCw className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">Seed {scenario.name}</span>
                        </>
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>);

          })}
        </div>

        {/* Last Result */}
        {lastResult &&
        <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#10b981]" />
                Last Seeding Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[#00d4ff]" />
                    <span className="text-xs text-[#a3a3a3]">Profiles</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{lastResult.counts.profiles}</div>
                </div>
                <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-[#10b981]" />
                    <span className="text-xs text-[#a3a3a3]">Events</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{lastResult.counts.events}</div>
                </div>
                <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-[#ec4899]" />
                    <span className="text-xs text-[#a3a3a3]">Insights</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{lastResult.counts.insights}</div>
                </div>
                <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-[#fbbf24]" />
                    <span className="text-xs text-[#a3a3a3]">Demo App</span>
                  </div>
                  <div className="text-xs font-mono text-white truncate">{lastResult.demo_app?.id || 'N/A'}</div>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20">
                <div className="text-sm text-[#10b981]">
                  ✓ Scenario: <span className="font-semibold">{lastResult.scenario}</span>
                </div>
                <div className="text-xs text-[#10b981]/80 mt-1">
                  {lastResult.message}
                </div>
              </div>
            </CardContent>
          </Card>
        }

        {/* Info Card */}
        <Card className="bg-[#111111] border-[#262626] mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#fbbf24]" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#a3a3a3]">
            <p>
              • All seeded data is marked with <code className="text-[#00d4ff] bg-[#00d4ff]/10 px-1 py-0.5 rounded">is_demo: true</code> for easy identification and cleanup.
            </p>
            <p>
              • Seeding operations are rate-limited and batched to prevent API throttling. Large scenarios may take 30-60 seconds.
            </p>
            <p>
              • Each seed operation clears existing demo data first to prevent duplicates.
            </p>
            <p>
              • Demo data appears in all analytics views (Dashboard, Profiles, Events, Insights) alongside real data.
            </p>
            <p>
              • Use the "Clear All Demo Data" button to remove all demo records before connecting real data sources.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Custom Clear Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="bg-[#111111] border-[#262626] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-6 h-6 text-[#ef4444]" />
              Clear Demo Data
            </DialogTitle>
            <DialogDescription className="text-[#a3a3a3] text-base">
              Are you sure you want to clear <strong className="text-white">all demo data</strong>? This action cannot be undone and will remove all profiles, events, and insights marked as demo data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(false)}
              className="border-[#262626] hover:bg-[#1a1a1a]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClearData}
              className="bg-[#ef4444] hover:bg-[#dc2626] text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

}