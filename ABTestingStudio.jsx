
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TestTube,
  Plus,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Loader2,
  Settings,
  Eye,
  Trash2,
  Copy,
  Brain,
  FlaskConical // Added FlaskConical icon here
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import PredictiveABTesting from '../components/testing/PredictiveABTesting';
import { CollaborationProvider } from '../components/collaboration/CollaborationProvider';
import PresenceIndicator from '../components/collaboration/PresenceIndicator';
import PageHeader from '../components/ui/PageHeader'; // New import

export default function ABTestingStudioPage() { // Changed component name
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false); // Used for new Create Test flow
  const { toast } = useToast();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      const testsList = await base44.entities.ABTest.list('-created_date', 50);
      setTests(testsList);
    } catch (error) {
      console.error('Failed to load A/B tests:', error);
      toast({
        title: 'Load Failed',
        description: 'Could not load A/B tests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-[#6b7280] text-white border-none',
      running: 'bg-[#10b981] text-white border-none',
      paused: 'bg-[#fbbf24] text-[#0a0a0a] border-none font-semibold',
      completed: 'bg-[#00d4ff] text-[#0a0a0a] border-none font-semibold',
      archived: 'bg-[#404040] text-[#a3a3a3] border-none'
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return Play;
      case 'paused': return Pause;
      case 'completed': return CheckCircle;
      default: return AlertCircle;
    }
  };

  // This function is no longer called by the main "Create Test" button,
  // but is kept as per instructions to preserve existing functionality.
  const handleCreateTest = () => {
    window.location.href = createPageUrl('ABTesting');
  };

  const handleViewTest = (test) => {
    window.location.href = `${createPageUrl('ABTesting')}?testId=${test.id}`;
  };

  const handleDuplicateTest = async (test) => {
    try {
      const newTest = {
        ...test,
        name: `${test.name} (Copy)`,
        status: 'draft',
        started_at: null,
        ended_at: null,
        winner_variant_id: null,
        results_summary: {}
      };

      delete newTest.id;
      delete newTest.created_date;
      delete newTest.updated_date;
      delete newTest.created_by;

      await base44.entities.ABTest.create(newTest);

      toast({
        title: 'Test Duplicated',
        description: `Created a copy of "${test.name}"`
      });

      loadTests();
    } catch (error) {
      console.error('Failed to duplicate test:', error);
      toast({
        title: 'Duplication Failed',
        description: 'Could not duplicate test',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTest = async (test) => {
    if (!confirm(`Delete "${test.name}"? This cannot be undone.`)) return;

    try {
      await base44.entities.ABTest.update(test.id, { status: 'archived' });
      toast({
        title: 'Test Deleted',
        description: `"${test.name}" has been archived`
      });
      loadTests();
    } catch (error) {
      console.error('Failed to delete test:', error);
      toast({
        title: 'Delete Failed',
        description: 'Could not delete test',
        variant: 'destructive'
      });
    }
  };

  const TestCard = ({ test }) => {
    const StatusIcon = getStatusIcon(test.status);
    const isRunning = test.status === 'running';
    const hasWinner = test.winner_variant_id;
    const [showPredictive, setShowPredictive] = useState(false);
    const [testVariants, setTestVariants] = useState([]); // State to hold variants for this test

    useEffect(() => {
      // Only load variants if the test is running and predictive analysis is potentially needed
      if (test.status === 'running') {
        const loadVariants = async () => {
          try {
            // Fetch variants specifically for this test
            const fetchedVariants = await base44.entities.ABTestVariant.list(
              null, // sort (no specific sort needed for filter)
              null, // limit
              `ab_test_id=${test.id}` // filter criteria to get variants for this test
            );
            setTestVariants(fetchedVariants);
          } catch (error) {
            console.error(`Failed to load variants for test ${test.id}:`, error);
            toast({
              title: 'Variant Load Failed',
              description: `Could not load variants for test ${test.name}`,
              variant: 'destructive'
            });
          }
        };
        loadVariants();
      } else {
        setTestVariants([]); // Clear variants if test is not running or its status changes
      }
    }, [test.id, test.status, toast]);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/30 transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-white text-base">{test.name}</CardTitle>
                  <Badge className={getStatusColor(test.status)}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {test.status}
                  </Badge>
                </div>
                {test.description && (
                  <p className="text-sm text-[#a3a3a3] line-clamp-2">{test.description}</p>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            {/* Test Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#262626]">
                <div className="text-xs text-[#6b7280] mb-1">Variants</div>
                <div className="text-lg font-bold text-white">
                  {test.traffic_allocation ? Math.round(test.traffic_allocation * 100) : 0}%
                </div>
                <div className="text-xs text-[#a3a3a3]">Traffic allocated</div>
              </div>

              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#262626]">
                <div className="text-xs text-[#6b7280] mb-1">Duration</div>
                <div className="text-lg font-bold text-white">
                  {test.started_at
                    ? Math.round((new Date() - new Date(test.started_at)) / (1000 * 60 * 60 * 24))
                    : 0}d
                </div>
                <div className="text-xs text-[#a3a3a3]">
                  {isRunning ? 'Running' : 'Completed'}
                </div>
              </div>
            </div>

            {/* Winner Badge */}
            {hasWinner && (
              <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#10b981]" />
                  <span className="text-sm font-semibold text-[#10b981]">Winner Determined</span>
                </div>
              </div>
            )}

            {test.status === 'running' && (
              <Button
                onClick={() => setShowPredictive(!showPredictive)}
                variant="outline"
                className="w-full border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6]/10"
              >
                <Brain className="w-4 h-4 mr-2" />
                {showPredictive ? 'Hide' : 'Show'} AI Predictive Analysis
              </Button>
            )}

            {showPredictive && test.status === 'running' && (
              <div className="pt-4 border-t border-[#262626]">
                <PredictiveABTesting
                  test={test}
                  variants={testVariants} // Pass the fetched variants
                  onUpdateTest={loadTests}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleViewTest(test)}
                className="flex-1 bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Results
              </Button>
              <Button
                onClick={() => handleDuplicateTest(test)}
                variant="outline"
                className="border-[#262626] text-[#a3a3a3] hover:bg-[#262626]"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => handleDeleteTest(test)}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Dates */}
            <div className="text-xs text-[#6b7280] pt-2 border-t border-[#262626]">
              {test.started_at ? (
                <>Started {format(new Date(test.started_at), 'MMM d, yyyy')}</>
              ) : (
                <>Created {format(new Date(test.created_date), 'MMM d, yyyy')}</>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const runningTests = tests.filter(t => t.status === 'running');
  const draftTests = tests.filter(t => t.status === 'draft');
  const completedTests = tests.filter(t => t.status === 'completed');

  return (
    <CollaborationProvider>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <PageHeader
            title="A/B Testing Studio"
            description="Psychographic-powered experimentation platform"
            icon={FlaskConical}
            docSection="ab-testing"
            actions={
              <Button
                onClick={() => setShowCreateForm(true)} // Adjusted to use existing state
                className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Test
              </Button>
            }
          />
          {/* Collaboration Presence, placed directly after PageHeader */}
          <div className="mt-3 mb-8"> {/* Added margin bottom for spacing */}
            <PresenceIndicator />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#a3a3a3] mb-1">Running Tests</p>
                    <p className="text-3xl font-bold text-[#10b981]">{runningTests.length}</p>
                  </div>
                  <div className="p-3 bg-[#10b981]/20 rounded-lg">
                    <Play className="w-6 h-6 text-[#10b981]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#a3a3a3] mb-1">Draft Tests</p>
                    <p className="text-3xl font-bold text-[#fbbf24]">{draftTests.length}</p>
                  </div>
                  <div className="p-3 bg-[#fbbf24]/20 rounded-lg">
                    <Settings className="w-6 h-6 text-[#fbbf24]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#a3a3a3] mb-1">Completed</p>
                    <p className="text-3xl font-bold text-[#00d4ff]">{completedTests.length}</p>
                  </div>
                  <div className="p-3 bg-[#00d4ff]/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-[#00d4ff]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tests Tabs */}
          <Tabs defaultValue="running" className="w-full">
            <TabsList className="bg-[#111111] border border-[#262626] mb-6">
              <TabsTrigger value="running" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                Running ({runningTests.length})
              </TabsTrigger>
              <TabsTrigger value="draft" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                Drafts ({draftTests.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                Completed ({completedTests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="running">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
                </div>
              ) : runningTests.length === 0 ? (
                <div className="text-center py-12">
                  <Play className="w-16 h-16 text-[#404040] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No running tests</h3>
                  <p className="text-[#a3a3a3] mb-6">Start your first A/B test to optimize engagement</p>
                  <Button
                    onClick={() => setShowCreateForm(true)} // Adjusted here too
                    className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Test
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {runningTests.map(test => <TestCard key={test.id} test={test} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="draft">
              {draftTests.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-[#404040] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No draft tests</h3>
                  <p className="text-[#a3a3a3]">All your tests are either running or completed</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {draftTests.map(test => <TestCard key={test.id} test={test} />)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedTests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-[#404040] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No completed tests</h3>
                  <p className="text-[#a3a3a3]">Completed tests will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedTests.map(test => <TestCard key={test.id} test={test} />)}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Start Guide */}
          <div className="mt-12 border-t border-[#262626] pt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Start Guide</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-[#00d4ff]/20 rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-[#00d4ff]" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">1. Define Hypothesis</h4>
                  <p className="text-sm text-[#a3a3a3]">
                    Create a test with clear variants targeting specific psychographic segments
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-[#10b981]/20 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-[#10b981]" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">2. Allocate Traffic</h4>
                  <p className="text-sm text-[#a3a3a3]">
                    Set traffic split and target specific user segments based on psychology
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-[#ec4899]/20 rounded-xl flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-[#ec4899]" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">3. Analyze Results</h4>
                  <p className="text-sm text-[#a3a3a3]">
                    Track conversion rates and statistical significance in real-time
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </CollaborationProvider>
  );
}
