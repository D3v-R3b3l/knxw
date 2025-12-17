import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, TrendingUp, Clock, DollarSign, Target, Brain, 
  RefreshCw, CheckCircle, AlertCircle, ChevronRight 
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { safeFormatDate } from '../components/utils/datetime';

export default function LlmEvaluationPage() {
  const [selectedDataset, setSelectedDataset] = useState('all');
  const [expandedRun, setExpandedRun] = useState(null);

  const { data: evalRecords = [], isLoading, refetch } = useQuery({
    queryKey: ['llm-eval-records'],
    queryFn: async () => {
      const records = await base44.entities.LLMEvalRecord.list('-created_at', 50);
      return records;
    },
  });

  // Filter by dataset
  const filteredRecords = selectedDataset === 'all' 
    ? evalRecords 
    : evalRecords.filter(r => r.dataset === selectedDataset);

  // Get unique datasets
  const datasets = [...new Set(evalRecords.map(r => r.dataset))];

  // Calculate aggregate stats
  const aggregateStats = filteredRecords.length > 0 ? {
    avgAccuracy: (filteredRecords.reduce((sum, r) => sum + (r.metrics?.accuracy || 0), 0) / filteredRecords.length).toFixed(2),
    avgPrecision: (filteredRecords.reduce((sum, r) => sum + (r.metrics?.precision || 0), 0) / filteredRecords.length).toFixed(2),
    avgRecall: (filteredRecords.reduce((sum, r) => sum + (r.metrics?.recall || 0), 0) / filteredRecords.length).toFixed(2),
    avgF1: (filteredRecords.reduce((sum, r) => sum + (r.metrics?.f1_score || 0), 0) / filteredRecords.length).toFixed(2),
    avgLatency: (filteredRecords.reduce((sum, r) => sum + (r.metrics?.latency_ms || 0), 0) / filteredRecords.length).toFixed(0),
    totalCost: filteredRecords.reduce((sum, r) => sum + (r.metrics?.cost_usd || 0), 0).toFixed(2),
  } : null;

  // Prepare chart data (last 10 runs)
  const chartData = filteredRecords.slice(0, 10).reverse().map(r => ({
    name: safeFormatDate(r.created_at, 'MMM d'),
    accuracy: ((r.metrics?.accuracy || 0) * 100).toFixed(1),
    precision: ((r.metrics?.precision || 0) * 100).toFixed(1),
    recall: ((r.metrics?.recall || 0) * 100).toFixed(1),
    f1: ((r.metrics?.f1_score || 0) * 100).toFixed(1),
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-[#00d4ff]" />
                LLM Evaluation Dashboard
              </h1>
              <p className="text-[#a3a3a3]">
                Real validation results from our psychographic AI models
              </p>
            </div>
            
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Dataset Filter */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#a3a3a3]">Filter by Dataset:</span>
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger className="w-64 bg-[#111111] border-[#262626] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Datasets</SelectItem>
                {datasets.map(ds => (
                  <SelectItem key={ds} value={ds}>{ds}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-12 text-center">
              <Brain className="w-16 h-16 text-[#262626] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Evaluation Runs Yet</h3>
              <p className="text-[#a3a3a3]">
                Evaluation records will appear here once model validation runs are completed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Aggregate Stats */}
            {aggregateStats && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                <Card className="bg-[#111111] border-[#262626]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#a3a3a3]">Avg Accuracy</span>
                      <Target className="w-4 h-4 text-[#10b981]" />
                    </div>
                    <p className="text-2xl font-bold text-[#10b981]">
                      {(aggregateStats.avgAccuracy * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#262626]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#a3a3a3]">Avg Precision</span>
                      <CheckCircle className="w-4 h-4 text-[#00d4ff]" />
                    </div>
                    <p className="text-2xl font-bold text-[#00d4ff]">
                      {(aggregateStats.avgPrecision * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#262626]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#a3a3a3]">Avg Recall</span>
                      <TrendingUp className="w-4 h-4 text-[#8b5cf6]" />
                    </div>
                    <p className="text-2xl font-bold text-[#8b5cf6]">
                      {(aggregateStats.avgRecall * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#262626]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#a3a3a3]">Avg F1 Score</span>
                      <Brain className="w-4 h-4 text-[#fbbf24]" />
                    </div>
                    <p className="text-2xl font-bold text-[#fbbf24]">
                      {(aggregateStats.avgF1 * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#262626]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#a3a3a3]">Avg Latency</span>
                      <Clock className="w-4 h-4 text-[#a3a3a3]" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {aggregateStats.avgLatency}<span className="text-sm text-[#a3a3a3]">ms</span>
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#262626]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#a3a3a3]">Total Cost</span>
                      <DollarSign className="w-4 h-4 text-[#10b981]" />
                    </div>
                    <p className="text-2xl font-bold text-[#10b981]">
                      ${aggregateStats.totalCost}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Performance Trend Chart */}
            <Card className="bg-[#111111] border-[#262626] mb-8">
              <CardHeader>
                <CardTitle className="text-white">Performance Trend (Last 10 Runs)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="name" stroke="#a3a3a3" />
                    <YAxis stroke="#a3a3a3" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111111',
                        border: '1px solid #262626',
                        borderRadius: '8px',
                        color: '#ffffff',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Accuracy (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="precision"
                      stroke="#00d4ff"
                      strokeWidth={2}
                      name="Precision (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="recall"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Recall (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="f1"
                      stroke="#fbbf24"
                      strokeWidth={2}
                      name="F1 Score (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Evaluation Runs List */}
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">Evaluation Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRecords.map(record => {
                    const isExpanded = expandedRun === record.id;
                    return (
                      <div
                        key={record.id}
                        className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 hover:border-[#00d4ff]/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-white font-semibold">{record.run_id}</h4>
                              <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30 text-xs">
                                {record.dataset}
                              </Badge>
                              {record.model_version && (
                                <Badge variant="outline" className="text-xs">
                                  v{record.model_version}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm">
                              <span className="text-[#a3a3a3]">
                                {safeFormatDate(record.created_at)}
                              </span>
                              <span className="text-[#10b981]">
                                Accuracy: {((record.metrics?.accuracy || 0) * 100).toFixed(1)}%
                              </span>
                              <span className="text-[#00d4ff]">
                                F1: {((record.metrics?.f1_score || 0) * 100).toFixed(1)}%
                              </span>
                              {record.dataset_size && (
                                <span className="text-[#a3a3a3]">
                                  {record.dataset_size} samples
                                </span>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedRun(isExpanded ? null : record.id)}
                            className="text-[#00d4ff]"
                          >
                            <ChevronRight
                              className={`w-5 h-5 transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`}
                            />
                          </Button>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-[#262626] space-y-4">
                            {/* Summary */}
                            <div>
                              <h5 className="text-white font-semibold text-sm mb-2">Summary</h5>
                              <p className="text-[#a3a3a3] text-sm">{record.summary}</p>
                            </div>

                            {/* Detailed Metrics */}
                            <div>
                              <h5 className="text-white font-semibold text-sm mb-2">Detailed Metrics</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-[#111111] rounded p-3">
                                  <p className="text-xs text-[#a3a3a3]">Accuracy</p>
                                  <p className="text-lg font-bold text-[#10b981]">
                                    {((record.metrics?.accuracy || 0) * 100).toFixed(2)}%
                                  </p>
                                </div>
                                <div className="bg-[#111111] rounded p-3">
                                  <p className="text-xs text-[#a3a3a3]">Precision</p>
                                  <p className="text-lg font-bold text-[#00d4ff]">
                                    {((record.metrics?.precision || 0) * 100).toFixed(2)}%
                                  </p>
                                </div>
                                <div className="bg-[#111111] rounded p-3">
                                  <p className="text-xs text-[#a3a3a3]">Recall</p>
                                  <p className="text-lg font-bold text-[#8b5cf6]">
                                    {((record.metrics?.recall || 0) * 100).toFixed(2)}%
                                  </p>
                                </div>
                                <div className="bg-[#111111] rounded p-3">
                                  <p className="text-xs text-[#a3a3a3]">F1 Score</p>
                                  <p className="text-lg font-bold text-[#fbbf24]">
                                    {((record.metrics?.f1_score || 0) * 100).toFixed(2)}%
                                  </p>
                                </div>
                                {record.metrics?.latency_ms && (
                                  <div className="bg-[#111111] rounded p-3">
                                    <p className="text-xs text-[#a3a3a3]">Latency (avg)</p>
                                    <p className="text-lg font-bold text-white">
                                      {record.metrics.latency_ms.toFixed(0)}ms
                                    </p>
                                  </div>
                                )}
                                {record.metrics?.cost_usd && (
                                  <div className="bg-[#111111] rounded p-3">
                                    <p className="text-xs text-[#a3a3a3]">Cost</p>
                                    <p className="text-lg font-bold text-[#10b981]">
                                      ${record.metrics.cost_usd.toFixed(4)}
                                    </p>
                                  </div>
                                )}
                                {record.evaluation_duration_ms && (
                                  <div className="bg-[#111111] rounded p-3">
                                    <p className="text-xs text-[#a3a3a3]">Duration</p>
                                    <p className="text-lg font-bold text-white">
                                      {(record.evaluation_duration_ms / 1000).toFixed(1)}s
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Metadata */}
                            <div>
                              <h5 className="text-white font-semibold text-sm mb-2">Metadata</h5>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-[#a3a3a3]">Run ID:</span>
                                  <code className="text-[#00d4ff] ml-2">{record.run_id}</code>
                                </div>
                                {record.model_version && (
                                  <div>
                                    <span className="text-[#a3a3a3]">Model Version:</span>
                                    <span className="text-white ml-2">{record.model_version}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-[#a3a3a3]">Created By:</span>
                                  <span className="text-white ml-2">{record.created_by}</span>
                                </div>
                                <div>
                                  <span className="text-[#a3a3a3]">Created At:</span>
                                  <span className="text-white ml-2">{safeFormatDate(record.created_at, 'PPpp')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}