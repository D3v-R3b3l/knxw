import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Send, Download, Play, Square, Loader2, Sparkles, 
  Target, Activity, TrendingUp, AlertCircle, CheckCircle,
  MessageSquare, Eye, Lightbulb, Zap, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AssistantPage() {
  const [sessionId, setSessionId] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [latestSnapshot, setLatestSnapshot] = useState(null);
  const [sessionStats, setSessionStats] = useState({ total_turns: 0, questions_asked: 0 });
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSession = async () => {
    try {
      const response = await fetch('/functions/api/v1/assistant/sessionStart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'demo' })
      });

      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.session_id);
        setSessionActive(true);
        setMessages([{
          role: 'assistant',
          content: "Hello! I'm your knXw Psychographic Assistant. I'm here to understand your preferences, working style, and motivations. As we chat, watch the sidebar on the right to see my understanding of you evolve in real-time. What's on your mind today?",
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch('/functions/api/v1/assistant/sessionEnd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });

      const data = await response.json();
      
      if (data.success) {
        setSessionActive(false);
        setSessionStats({
          total_turns: data.total_turns,
          questions_asked: data.questions_asked
        });
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const exportSession = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/functions/api/v1/assistant/sessionExport?session_id=${sessionId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knxw-assistant-${sessionId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error exporting session:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !sessionActive || isProcessing) return;

    const userMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsProcessing(true);

    try {
      const response = await fetch('/functions/api/v1/assistant/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: currentMessage
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message.content,
          timestamp: data.message.timestamp,
          processing_time: data.processing_time_ms
        }]);
        setLatestSnapshot(data.snapshot);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Error: Failed to process message. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Custom scrollbar styles */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        ::-webkit-scrollbar-thumb {
          background: #00d4ff;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #00b4d8;
        }
      `}</style>

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-[#1a1a1a]">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] via-[#c026d3] to-[#fbbf24]">
                  knXw Psychographic Assistant
                </h1>
                <p className="text-xs sm:text-sm text-[#a3a3a3]">
                  Watch AI learn about you in real-time
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!sessionActive ? (
                <Button
                  onClick={startSession}
                  className="bg-[#00d4ff] hover:bg-[#00b4d8] text-black font-bold flex-1 sm:flex-none"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Demo
                </Button>
              ) : (
                <>
                  <Button
                    onClick={endSession}
                    variant="outline"
                    className="border-red-500/50 text-red-500 hover:bg-red-500/10 flex-1 sm:flex-none"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    End
                  </Button>
                  <Button
                    onClick={exportSession}
                    variant="outline"
                    className="border-[#00d4ff]/50 text-[#00d4ff] hover:bg-[#00d4ff]/10 flex-1 sm:flex-none"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Two Column Layout (Mobile First) */}
      <div className="fixed top-[88px] sm:top-[80px] bottom-0 left-0 right-0 flex flex-col lg:flex-row">
        
        {/* Chat Window (Left/Main) */}
        <div className="flex-1 flex flex-col border-r border-[#1a1a1a] min-h-0">
          {/* Messages Container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4"
          >
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-[#00d4ff]" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3",
                    msg.role === 'user' 
                      ? "bg-[#00d4ff] text-black"
                      : msg.role === 'system'
                      ? "bg-red-500/10 border border-red-500/30 text-red-400"
                      : "bg-[#1a1a1a] text-white"
                  )}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    {msg.processing_time && (
                      <p className="text-xs text-[#a3a3a3] mt-2">
                        {msg.processing_time}ms
                      </p>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 items-center"
              >
                <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/20 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-[#00d4ff] animate-spin" />
                </div>
                <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-[#1a1a1a] p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
            <div className="flex gap-3 items-end">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={sessionActive ? "Type your message..." : "Start a session to begin chatting"}
                disabled={!sessionActive || isProcessing}
                className="flex-1 bg-[#1a1a1a] border-[#262626] text-white placeholder:text-[#6b7280] focus:border-[#00d4ff] resize-none"
                rows={1}
              />
              <Button
                onClick={sendMessage}
                disabled={!sessionActive || isProcessing || !currentMessage.trim()}
                className="bg-[#00d4ff] hover:bg-[#00b4d8] text-black px-4 py-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Psychographic Sidebar (Right) - Hidden on mobile by default, toggleable */}
        <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col bg-[#0a0a0a] border-l border-[#1a1a1a] overflow-y-auto">
          <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#1a1a1a] p-4 z-10">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-[#00d4ff]" />
              <h2 className="text-lg font-bold text-white">Live Profile Analysis</h2>
            </div>
            <p className="text-xs text-[#a3a3a3]">
              Watch the AI's understanding evolve in real-time
            </p>
          </div>

          <div className="p-4 space-y-4">
            {!latestSnapshot ? (
              <div className="text-center py-12">
                <Brain className="w-12 h-12 text-[#00d4ff]/30 mx-auto mb-4" />
                <p className="text-sm text-[#a3a3a3]">
                  Start chatting to see psychographic insights
                </p>
              </div>
            ) : (
              <>
                {/* Overall Confidence */}
                <Card className="bg-[#111111] border-[#262626]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-[#a3a3a3]">Overall Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Progress 
                          value={latestSnapshot.overall_confidence * 100} 
                          className="h-2"
                        />
                      </div>
                      <span className="text-2xl font-bold text-[#00d4ff]">
                        {Math.round(latestSnapshot.overall_confidence * 100)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Motivations */}
                {latestSnapshot.motivation_stack?.length > 0 && (
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#fbbf24]" />
                        <CardTitle className="text-sm text-white">Top Motivations</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {latestSnapshot.motivation_stack.slice(0, 3).map((mot, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-white capitalize">{mot.label}</span>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(mot.confidence * 100)}% confident
                            </Badge>
                          </div>
                          <Progress value={mot.weight * 100} className="h-1.5" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Emotional State */}
                {latestSnapshot.emotional_state?.mood && (
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#ec4899]" />
                        <CardTitle className="text-sm text-white">Emotional State</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-white capitalize">
                          {latestSnapshot.emotional_state.mood}
                        </span>
                        <Badge className="bg-[#ec4899]/20 text-[#ec4899]">
                          {Math.round(latestSnapshot.emotional_state.confidence * 100)}%
                        </Badge>
                      </div>
                      {latestSnapshot.emotional_state.energy_level && (
                        <p className="text-xs text-[#a3a3a3] mt-2">
                          Energy: {latestSnapshot.emotional_state.energy_level}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Cognitive Style */}
                {latestSnapshot.cognitive_style?.style && (
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-[#8b5cf6]" />
                        <CardTitle className="text-sm text-white">Cognitive Style</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-white capitalize">
                          {latestSnapshot.cognitive_style.style}
                        </span>
                        <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6]">
                          {Math.round(latestSnapshot.cognitive_style.confidence * 100)}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Risk Profile */}
                {latestSnapshot.risk_profile?.profile && (
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#10b981]" />
                        <CardTitle className="text-sm text-white">Risk Profile</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-white capitalize">
                          {latestSnapshot.risk_profile.profile}
                        </span>
                        <Badge className="bg-[#10b981]/20 text-[#10b981]">
                          {Math.round(latestSnapshot.risk_profile.confidence * 100)}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Reasoning Stream */}
                {latestSnapshot.reasoning?.length > 0 && (
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-[#fbbf24]" />
                        <CardTitle className="text-sm text-white">AI Reasoning</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
                      {latestSnapshot.reasoning.map((r, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="flex items-start gap-2 mb-1">
                            <CheckCircle className="w-3 h-3 text-[#00d4ff] mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-[#00d4ff] font-semibold">{r.trait}:</span>
                              <span className="text-white ml-1">{r.inference}</span>
                            </div>
                          </div>
                          <p className="text-[#6b7280] ml-5 italic">"{r.evidence}"</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Uncertainty Map */}
                {latestSnapshot.uncertainty_map?.lowest_confidence_trait && (
                  <Card className="bg-[#ff9500]/10 border-[#ff9500]/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#ff9500]" />
                        <CardTitle className="text-sm text-white">Uncertainty</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-white">
                        <span className="text-[#ff9500] font-semibold">Least Confident:</span>{' '}
                        {latestSnapshot.uncertainty_map.lowest_confidence_trait} (
                        {Math.round(latestSnapshot.uncertainty_map.lowest_confidence_score * 100)}%)
                      </p>
                      {latestSnapshot.uncertainty_map.suggested_question && (
                        <p className="text-xs text-[#a3a3a3] italic">
                          Next question: "{latestSnapshot.uncertainty_map.suggested_question}"
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Recommended Actions */}
                {latestSnapshot.recommended_actions?.length > 0 && (
                  <Card className="bg-[#111111] border-[#262626]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#fbbf24]" />
                        <CardTitle className="text-sm text-white">Personalization Suggestions</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {latestSnapshot.recommended_actions.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] mt-1.5 flex-shrink-0" />
                          <span className="text-[#e5e5e5]">{action}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Profile Toggle (Optional - for future enhancement) */}
      <div className="lg:hidden fixed bottom-20 right-4 z-50">
        <Button
          className="w-12 h-12 rounded-full bg-[#00d4ff] hover:bg-[#00b4d8] text-black shadow-2xl"
          title="View Profile Analysis"
        >
          <BarChart3 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}