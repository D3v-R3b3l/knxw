
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Brain, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Lightbulb,
  Target,
  Heart,
  Zap,
  Filter,
  Plus,
  FileText,
  BarChart3,
  Eye,
  Calendar,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FeedbackAnalysis } from '@/api/entities';
import { User as UserEntity } from '@/api/entities';
import { analyzeFeedback } from '@/api/functions';
import { useToast } from '@/components/ui/use-toast';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case 'very_positive': return 'text-green-400';
    case 'positive': return 'text-green-300';
    case 'neutral': return 'text-gray-400';
    case 'negative': return 'text-orange-400';
    case 'very_negative': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

const getSentimentIcon = (sentiment) => {
  switch (sentiment) {
    case 'very_positive': return '😊';
    case 'positive': return '🙂';
    case 'neutral': return '😐';
    case 'negative': return '😕';
    case 'very_negative': return '😞';
    default: return '❓';
  }
};

const FeedbackCard = ({ analysis }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/30 transition-all">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {getSentimentIcon(analysis.sentiment_analysis.overall_sentiment)}
                </div>
                <div>
                  <Badge className={`${getPriorityColor(analysis.actionable_insights.priority_level)} text-xs`}>
                    {analysis.actionable_insights.priority_level} priority
                  </Badge>
                  <p className="text-xs text-[#6b7280] mt-1">
                    {analysis.feedback_source} • {new Date(analysis.analyzed_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-[#8b5cf6] border-[#8b5cf6]/30">
                {(analysis.analysis_confidence * 100).toFixed(0)}% confidence
              </Badge>
            </div>

            {/* Feedback Text */}
            <div className="bg-[#0a0a0a] p-3 rounded-lg border border-[#262626]">
              <p className="text-sm text-white leading-relaxed">
                "{analysis.original_text}"
              </p>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <h5 className="text-xs font-medium text-[#6b7280] mb-1">DOMINANT EMOTIONS</h5>
                <div className="flex flex-wrap gap-1">
                  {analysis.psychographic_analysis.detected_emotions?.slice(0, 3).map((emotion, idx) => (
                    <Badge key={idx} variant="outline" className="text-[#ec4899] border-[#ec4899]/30 text-xs">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-[#6b7280] mb-1">MOTIVATIONS</h5>
                <div className="flex flex-wrap gap-1">
                  {analysis.psychographic_analysis.motivation_indicators?.slice(0, 2).map((motivation, idx) => (
                    <Badge key={idx} variant="outline" className="text-[#fbbf24] border-[#fbbf24]/30 text-xs">
                      {motivation}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-[#6b7280] mb-1">COGNITIVE STYLE</h5>
                <Badge variant="outline" className="text-[#00d4ff] border-[#00d4ff]/30 text-xs">
                  {analysis.psychographic_analysis.cognitive_style_signals}
                </Badge>
              </div>
            </div>

            {/* Expand/Collapse */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-[#00d4ff] hover:text-white transition-colors flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              {expanded ? 'Hide Details' : 'View Full Analysis'}
            </button>

            {/* Detailed Analysis */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-[#262626]"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-[#ec4899]" />
                        Psychological Needs
                      </h5>
                      <div className="space-y-1">
                        {analysis.psychographic_analysis.psychological_needs?.map((need, idx) => (
                          <p key={idx} className="text-xs text-[#a3a3a3]">• {need}</p>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#00d4ff]" />
                        Communication Style
                      </h5>
                      <p className="text-xs text-[#a3a3a3]">
                        {analysis.psychographic_analysis.communication_style}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-[#fbbf24]" />
                      Recommended Response Strategy
                    </h5>
                    <p className="text-sm text-[#a3a3a3] bg-[#1a1a1a] p-3 rounded-lg">
                      {analysis.actionable_insights.recommended_response_style}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#10b981]" />
                      Suggested Solutions
                    </h5>
                    <div className="space-y-1">
                      {analysis.actionable_insights.suggested_solutions?.map((solution, idx) => (
                        <p key={idx} className="text-xs text-[#a3a3a3]">• {solution}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#8b5cf6]" />
                      Segment Implications
                    </h5>
                    <p className="text-xs text-[#a3a3a3]">
                      {analysis.actionable_insights.segment_implications}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function FeedbackInsightsPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [user, setUser] = useState(null);
  
  // New feedback form
  const [newFeedback, setNewFeedback] = useState({
    text: '',
    user_id: '',
    source: 'survey',
    rating: ''
  });
  
  // Filters
  const [filters, setFilters] = useState({
    priority: 'all',
    sentiment: 'all',
    source: 'all'
  });

  const { toast } = useToast();

  const loadAnalyses = React.useCallback(async () => {
    try {
      const analysisData = await FeedbackAnalysis.list('-analyzed_at', 50);
      setAnalyses(analysisData);
    } catch (error) {
      console.error('Failed to load feedback analyses:', error);
      toast({
        title: "Error",
        description: "Failed to load feedback analyses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]); // Added toast as a dependency for useCallback

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await UserEntity.me();
        setUser(currentUser);
        
        // Check if user has Growth tier access
        if (!['growth', 'pro', 'enterprise'].includes(currentUser.current_plan_key)) {
          toast({
            title: "Upgrade Required",
            description: "Feedback Analysis requires Growth tier or higher.",
            variant: "destructive",
          });
          return;
        }
        
        await loadAnalyses();
      } catch (error) {
        console.error('Failed to load user:', error);
        setLoading(false);
      }
    };
    
    loadUser();
  }, [loadAnalyses, toast]); // Added loadAnalyses and toast as dependencies

  const handleAnalyzeNew = async () => {
    if (!user || !['growth', 'pro', 'enterprise'].includes(user.current_plan_key)) {
      toast({
        title: "Upgrade Required",
        description: "Feedback Analysis requires Growth tier or higher.",
        variant: "destructive",
      });
      return;
    }

    if (!newFeedback.text.trim() || !newFeedback.user_id.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both feedback text and user ID.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const metadata = {};
      if (newFeedback.rating) {
        metadata.rating = parseInt(newFeedback.rating);
      }

      const result = await analyzeFeedback({
        feedback_text: newFeedback.text,
        user_id: newFeedback.user_id,
        source: newFeedback.source,
        metadata
      });

      if (result.success) {
        toast({
          title: "Analysis Complete",
          description: `Feedback analyzed with ${result.insights_summary.priority} priority.`,
        });
        
        // Reset form
        setNewFeedback({
          text: '',
          user_id: '',
          source: 'survey',
          rating: ''
        });
        
        await loadAnalyses();
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze feedback.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getFilteredAnalyses = () => {
    return analyses.filter(analysis => {
      if (filters.priority !== 'all' && analysis.actionable_insights.priority_level !== filters.priority) {
        return false;
      }
      if (filters.sentiment !== 'all' && analysis.sentiment_analysis.overall_sentiment !== filters.sentiment) {
        return false;
      }
      if (filters.source !== 'all' && analysis.feedback_source !== filters.source) {
        return false;
      }
      return true;
    });
  };

  const getInsightsSummary = () => {
    const filteredAnalyses = getFilteredAnalyses();
    
    const priorityBreakdown = filteredAnalyses.reduce((acc, analysis) => {
      acc[analysis.actionable_insights.priority_level] = (acc[analysis.actionable_insights.priority_level] || 0) + 1;
      return acc;
    }, {});

    const sentimentBreakdown = filteredAnalyses.reduce((acc, analysis) => {
      acc[analysis.sentiment_analysis.overall_sentiment] = (acc[analysis.sentiment_analysis.overall_sentiment] || 0) + 1;
      return acc;
    }, {});

    return {
      total: filteredAnalyses.length,
      priorityBreakdown,
      sentimentBreakdown
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-8 h-8 text-[#00d4ff] animate-pulse mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Loading feedback insights...</p>
        </div>
      </div>
    );
  }

  if (user && !['growth', 'pro', 'enterprise'].includes(user.current_plan_key)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <Crown className="w-16 h-16 text-[#fbbf24] mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Feedback Analysis</h1>
            <p className="text-xl text-[#a3a3a3] mb-8 max-w-2xl mx-auto">
              Unlock psychographic analysis of user feedback to understand the deeper motivations and emotions behind customer input.
            </p>
            <Button 
              className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] text-black font-semibold px-8 py-3"
            >
              Upgrade to Growth
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const summary = getInsightsSummary();
  const filteredAnalyses = getFilteredAnalyses();

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#00d4ff]/20 to-[#0ea5e9]/20 rounded-xl">
              <MessageSquare className="w-8 h-8 text-[#00d4ff]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Feedback Insights</h1>
              <p className="text-[#a3a3a3]">Psychographic analysis of user feedback and sentiment</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="analyze">Analyze New</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#00d4ff]" />
                  Analyze New Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      User ID
                    </label>
                    <Input
                      value={newFeedback.user_id}
                      onChange={(e) => setNewFeedback({...newFeedback, user_id: e.target.value})}
                      placeholder="user_12345"
                      className="bg-[#1a1a1a] border-[#262626] text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Feedback Source
                    </label>
                    <Select 
                      value={newFeedback.source} 
                      onValueChange={(value) => setNewFeedback({...newFeedback, source: value})}
                    >
                      <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="survey">Survey</SelectItem>
                        <SelectItem value="support_ticket">Support Ticket</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="imported_text">Imported Text</SelectItem>
                        <SelectItem value="chat">Chat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Rating (Optional)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newFeedback.rating}
                    onChange={(e) => setNewFeedback({...newFeedback, rating: e.target.value})}
                    placeholder="1-10"
                    className="bg-[#1a1a1a] border-[#262626] text-white w-32"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Feedback Text
                  </label>
                  <Textarea
                    value={newFeedback.text}
                    onChange={(e) => setNewFeedback({...newFeedback, text: e.target.value})}
                    placeholder="The user experience was frustrating because..."
                    className="bg-[#1a1a1a] border-[#262626] text-white min-h-[120px]"
                  />
                </div>

                <Button
                  onClick={handleAnalyzeNew}
                  disabled={analyzing}
                  className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] text-black font-semibold"
                >
                  {analyzing ? (
                    <>
                      <Brain className="w-4 h-4 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze Feedback
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#6b7280]">Total Feedback</p>
                      <p className="text-2xl font-bold text-white">{summary.total}</p>
                    </div>
                    <FileText className="w-8 h-8 text-[#00d4ff]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#6b7280]">Critical</p>
                      <p className="text-2xl font-bold text-red-400">{summary.priorityBreakdown.critical || 0}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#6b7280]">Positive</p>
                      <p className="text-2xl font-bold text-green-400">
                        {(summary.sentimentBreakdown.positive || 0) + (summary.sentimentBreakdown.very_positive || 0)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#6b7280]">Negative</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {(summary.sentimentBreakdown.negative || 0) + (summary.sentimentBreakdown.very_negative || 0)}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Filters */}
            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#6b7280]" />
                    <span className="text-sm font-medium text-white">Filters:</span>
                  </div>
                  
                  <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                    <SelectTrigger className="w-32 bg-[#1a1a1a] border-[#262626] text-white">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.sentiment} onValueChange={(value) => setFilters({...filters, sentiment: value})}>
                    <SelectTrigger className="w-36 bg-[#1a1a1a] border-[#262626] text-white">
                      <SelectValue placeholder="Sentiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sentiment</SelectItem>
                      <SelectItem value="very_positive">Very Positive</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="very_negative">Very Negative</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.source} onValueChange={(value) => setFilters({...filters, source: value})}>
                    <SelectTrigger className="w-32 bg-[#1a1a1a] border-[#262626] text-white">
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="survey">Survey</SelectItem>
                      <SelectItem value="support_ticket">Support</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="text-sm text-[#6b7280]">
                    Showing {filteredAnalyses.length} of {analyses.length} feedback items
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback List */}
            {filteredAnalyses.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-[#6b7280] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Feedback Analysis Yet</h3>
                <p className="text-[#a3a3a3] mb-4">Analyze your first piece of user feedback to get psychographic insights.</p>
                <Button
                  onClick={() => document.querySelector('[value="analyze"]').click()}
                  className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] text-black"
                >
                  Analyze Feedback
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAnalyses.map((analysis) => (
                  <FeedbackCard key={analysis.id} analysis={analysis} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
