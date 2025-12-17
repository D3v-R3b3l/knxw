import React, { useState, useEffect, useCallback } from 'react';
import { abTestManager } from '@/api/functions';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
    Plus, Play, Pause, BarChart, TrendingUp, Users, Beaker,
    Crown, AlertTriangle, CheckCircle, Clock, Target
} from 'lucide-react';
import { format } from 'date-fns';
import ABTestBuilder from '../components/testing/ABTestBuilder';
import ABTestResults from '../components/testing/ABTestResults';

export default function ABTestingPage() {
    const [tests, setTests] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [clientApps, setClientApps] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);
    const [showBuilder, setShowBuilder] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [editingTest, setEditingTest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const appsData = await base44.entities.ClientApp.list('-created_date');
            setClientApps(appsData);
            
            if (appsData.length > 0 && (!selectedApp || !appsData.some(app => app.id === selectedApp.id))) {
                setSelectedApp(appsData[0]);
            } else if (appsData.length === 0) {
                setSelectedApp(null);
            }
            
            if (selectedApp) {
                const [testsData, templatesData] = await Promise.all([
                    base44.entities.ABTest.filter({ client_app_id: selectedApp.id }, '-created_date'),
                    base44.entities.EngagementTemplate.filter({ client_app_id: selectedApp.id }, '-created_date')
                ]);
                
                setTests(testsData);
                setTemplates(templatesData);
            } else {
                setTests([]);
                setTemplates([]);
            }
        } catch (error) {
            console.error('Error loading A/B testing data:', error);
        }
        setIsLoading(false);
    }, [selectedApp]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreateTest = async (testData) => {
        try {
            const user = await base44.auth.me();
            const test = await base44.entities.ABTest.create({
                ...testData,
                client_app_id: selectedApp.id,
                owner_id: user.id
            });

            for (const variantData of testData.variants) {
                await base44.entities.ABTestVariant.create({
                    ...variantData,
                    ab_test_id: test.id
                });
            }

            setShowBuilder(false);
            setEditingTest(null);
            loadData();
        } catch (error) {
            console.error('Error creating A/B test:', error);
            toast.error('Error creating test: ' + error.message);
        }
    };

    const handleStartTest = async (test) => {
        if (window.confirm('Are you sure you want to start this test? Users will begin entering the test immediately.')) {
            try {
                await base44.entities.ABTest.update(test.id, {
                    status: 'running',
                    started_at: new Date().toISOString()
                });
                loadData();
            } catch (error) {
                console.error('Error starting test:', error);
                toast.error('Error starting test: ' + error.message);
            }
        }
    };

    const handleStopTest = async (test) => {
        try {
            const { data } = await abTestManager({
                action: 'stop_test',
                ab_test_id: test.id
            });
            
            if (data.stopped) {
                loadData();
                setShowResults(false);
            }
        } catch (error) {
            console.error('Error stopping test:', error);
            toast.error('Error stopping test: ' + error.message);
        }
    };

    const handlePromoteWinner = async (testId, variantId) => {
        if (!window.confirm('Are you sure you want to promote this variant as the winner? This will end the test.')) {
          return;
        }
    
        try {
          const { data } = await base44.functions.invoke('promoteABTestWinner', {
            test_id: testId,
            winner_variant_id: variantId
          });
    
          toast.success(data.message || 'Winner promoted successfully!');
          loadData();
          setShowResults(false); 
        } catch (error) {
          console.error('Error promoting winner:', error);
          toast.error('Failed to promote winner: ' + (error.message || 'Unknown error'));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
            case 'running': return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30';
            case 'paused': return 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30';
            case 'completed': return 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30';
            default: return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'draft': return Clock;
            case 'running': return Play;
            case 'paused': return Pause;
            case 'completed': return CheckCircle;
            default: return AlertTriangle;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                <div className="mb-8" data-tour="ab-testing">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
                            <Beaker className="w-6 h-6 text-[#0a0a0a]" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            A/B Testing Lab
                        </h1>
                    </div>
                    <p className="text-[#a3a3a3] text-lg">
                        Design, run, and analyze psychographically-informed experiments
                    </p>
                </div>

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
                    <Tabs defaultValue="active" className="space-y-6">
                        <TabsList className="bg-[#111111] border border-[#262626]">
                            <TabsTrigger value="active" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                                <Play className="w-4 h-4 mr-2" />
                                Active Tests ({tests.filter(t => t.status === 'running').length})
                            </TabsTrigger>
                            <TabsTrigger value="all" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                                <BarChart className="w-4 h-4 mr-2" />
                                All Tests ({tests.length})
                            </TabsTrigger>
                            <TabsTrigger value="results" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Results & Analytics
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="active" className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Running Tests</h2>
                                <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                                            <Plus className="w-4 h-4 mr-2" />
                                            New A/B Test
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[#111111] border-[#262626] text-white">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-bold text-white">
                                                {editingTest ? 'Edit A/B Test' : 'Create New A/B Test'}
                                            </DialogTitle>
                                        </DialogHeader>
                                        <ABTestBuilder
                                            test={editingTest}
                                            templates={templates}
                                            onSave={handleCreateTest}
                                            onCancel={() => {
                                                setShowBuilder(false);
                                                setEditingTest(null);
                                            }}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="grid gap-4">
                                {tests.filter(t => t.status === 'running').map(test => (
                                    <TestCard 
                                        key={test.id} 
                                        test={test} 
                                        onStart={handleStartTest}
                                        onViewResults={(test) => {
                                            setSelectedTest(test);
                                            setShowResults(true);
                                        }}
                                        onEdit={(test) => {
                                            setEditingTest(test);
                                            setShowBuilder(true);
                                        }}
                                    />
                                ))}
                                {tests.filter(t => t.status === 'running').length === 0 && (
                                    <Card className="bg-[#111111] border-[#262626]">
                                        <CardContent className="p-8 text-center">
                                            <Play className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-white mb-2">No Active Tests</h3>
                                            <p className="text-[#a3a3a3] mb-4">
                                                Create and start your first A/B test to begin experimenting with psychographic insights.
                                            </p>
                                            <Button
                                                onClick={() => setShowBuilder(true)}
                                                className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Your First Test
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="all" className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">All Tests</h2>
                                <Button
                                    onClick={() => setShowBuilder(true)}
                                    className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    New A/B Test
                                </Button>
                            </div>

                            <div className="grid gap-4">
                                {isLoading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <Card key={i} className="bg-[#111111] border-[#262626] animate-pulse">
                                            <CardContent className="p-6">
                                                <div className="h-4 bg-[#262626] rounded mb-4" />
                                                <div className="h-20 bg-[#262626] rounded" />
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : tests.length === 0 ? (
                                    <Card className="bg-[#111111] border-[#262626]">
                                        <CardContent className="p-8 text-center">
                                            <Beaker className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-white mb-2">No Tests Created</h3>
                                            <p className="text-[#a3a3a3] mb-4">
                                                Start experimenting by creating your first A/B test.
                                            </p>
                                            <Button
                                                onClick={() => setShowBuilder(true)}
                                                className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create A/B Test
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    tests.map(test => (
                                        <TestCard 
                                            key={test.id} 
                                            test={test} 
                                            onStart={handleStartTest}
                                            onViewResults={(test) => {
                                                setSelectedTest(test);
                                                setShowResults(true);
                                            }}
                                            onEdit={(test) => {
                                                setEditingTest(test);
                                                setShowBuilder(true);
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="results" className="space-y-6">
                            <h2 className="text-xl font-bold text-white">Test Results & Analytics</h2>
                            
                            <div className="grid md:grid-cols-4 gap-4">
                                <Card className="bg-[#111111] border-[#262626]">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-[#00d4ff]/20">
                                                <Beaker className="w-5 h-5 text-[#00d4ff]" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">{tests.length}</div>
                                                <div className="text-sm text-[#a3a3a3]">Total Tests</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="bg-[#111111] border-[#262626]">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-[#10b981]/20">
                                                <Play className="w-5 h-5 text-[#10b981]" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">
                                                    {tests.filter(t => t.status === 'running').length}
                                                </div>
                                                <div className="text-sm text-[#a3a3a3]">Active</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-[#111111] border-[#262626]">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-[#fbbf24]/20">
                                                <CheckCircle className="w-5 h-5 text-[#fbbf24]" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">
                                                    {tests.filter(t => t.status === 'completed').length}
                                                </div>
                                                <div className="text-sm text-[#a3a3a3]">Completed</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-[#111111] border-[#262626]">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-[#ec4899]/20">
                                                <Crown className="w-5 h-5 text-[#ec4899]" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">
                                                    {tests.filter(t => t.winner_variant_id).length}
                                                </div>
                                                <div className="text-sm text-[#a3a3a3]">With Winners</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                {tests.filter(t => ['completed', 'running'].includes(t.status)).map(test => (
                                    <Card key={test.id} className="bg-[#111111] border-[#262626] cursor-pointer hover:border-[#00d4ff]/30 transition-all"
                                          onClick={() => {
                                              setSelectedTest(test);
                                              setShowResults(true);
                                          }}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <CardTitle className="text-white">{test.name}</CardTitle>
                                                    <Badge className={getStatusColor(test.status)}>
                                                        {React.createElement(getStatusIcon(test.status), { className: "w-3 h-3 mr-1" })}
                                                        {test.status}
                                                    </Badge>
                                                </div>
                                                <Button size="sm" className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                                                    <BarChart className="w-4 h-4 mr-2" />
                                                    View Results
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-[#a3a3a3] text-sm mb-3">{test.description}</p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-[#a3a3a3]">
                                                    Type: <span className="text-white">{test.test_type?.replace('_', ' ')}</span>
                                                </span>
                                                {test.started_at && (
                                                    <span className="text-[#a3a3a3]">
                                                        Started: <span className="text-white">{format(new Date(test.started_at), 'MMM d, yyyy')}</span>
                                                    </span>
                                                )}
                                                {test.results_summary?.total_participants && (
                                                    <span className="text-[#a3a3a3]">
                                                        Participants: <span className="text-[#00d4ff]">{test.results_summary.total_participants}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <Card className="bg-[#111111] border-[#262626]">
                        <CardContent className="p-8 text-center">
                            <AlertTriangle className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No Applications Found</h3>
                            <p className="text-[#a3a3a3]">
                                Create a client application first in the Settings page to start A/B testing.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Dialog open={showResults} onOpenChange={setShowResults}>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#111111] border-[#262626] text-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                <BarChart className="w-6 h-6" />
                                {selectedTest?.name} - Results
                            </DialogTitle>
                        </DialogHeader>
                        {selectedTest && (
                            <ABTestResults
                                test={selectedTest}
                                onStopTest={() => handleStopTest(selectedTest)}
                                onPromoteWinner={(variantId) => handlePromoteWinner(selectedTest.id, variantId)}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

function TestCard({ test, onStart, onViewResults, onEdit }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
            case 'running': return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30';
            case 'paused': return 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30';
            case 'completed': return 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30';
            default: return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'draft': return Clock;
            case 'running': return Play;
            case 'paused': return Pause;
            case 'completed': return CheckCircle;
            default: return AlertTriangle;
        }
    };

    return (
        <Card className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/30 transition-all">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CardTitle className="text-white">{test.name}</CardTitle>
                        <Badge className={getStatusColor(test.status)}>
                            {React.createElement(getStatusIcon(test.status), { className: "w-3 h-3 mr-1" })}
                            {test.status}
                        </Badge>
                        {test.winner_variant_id && (
                            <Badge className="bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30">
                                <Crown className="w-3 h-3 mr-1" />
                                Winner
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {test.status === 'draft' && (
                            <Button
                                size="sm"
                                onClick={() => onStart(test)}
                                className="bg-[#10b981] hover:bg-[#059669] text-white"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Start Test
                            </Button>
                        )}
                        {(['running', 'completed'].includes(test.status)) && (
                            <Button
                                size="sm"
                                onClick={() => onViewResults(test)}
                                className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                            >
                                <BarChart className="w-4 h-4 mr-2" />
                                View Results
                            </Button>
                        )}
                        {test.status === 'draft' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEdit(test)}
                                className="border-[#262626] hover:bg-[#1a1a1a]"
                            >
                                Edit
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-[#a3a3a3] text-sm mb-4">{test.description}</p>
                <div className="grid md:grid-cols-4 gap-4">
                    <div>
                        <div className="text-sm text-[#a3a3a3]">Type</div>
                        <div className="text-white font-medium capitalize">
                            {test.test_type?.replace('_', ' ')}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-[#a3a3a3]">Traffic</div>
                        <div className="text-white font-medium">
                            {Math.round((test.traffic_allocation || 1) * 100)}%
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-[#a3a3a3]">Created</div>
                        <div className="text-white font-medium">
                            {format(new Date(test.created_date), 'MMM d')}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-[#a3a3a3]">Participants</div>
                        <div className="text-[#00d4ff] font-medium">
                            {test.results_summary?.total_participants || 0}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}