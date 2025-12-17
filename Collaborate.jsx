
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { 
  Users, 
  MessageSquare, 
  Loader2, 
  Sparkles,
  UserPlus,
  Brain,
  Send,
  FileText
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '../components/ui/PageHeader';

export default function CollaboratePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [taskSuggestions, setTaskSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCollaborationData();
  }, []);

  const loadCollaborationData = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      // In real implementation, load actual team members
      // For now using demo data structure
      setTeamMembers([
        { email: user.email, role: 'owner', full_name: user.full_name }
      ]);
    } catch (error) {
      console.error('Failed to load collaboration data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTaskSuggestions = async () => {
    setIsGenerating(true);

    try {
      const profiles = await base44.entities.UserPsychographicProfile.filter({ is_demo: false }, '-last_analyzed', 50);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze team collaboration opportunities based on psychographic profiles.

Team member profiles:
${JSON.stringify(teamMembers.map(m => ({
  email: m.email,
  role: m.role
})), null, 2)}

Recent user profiles analyzed:
${JSON.stringify(profiles.slice(0, 10).map(p => ({
  cognitive_style: p.cognitive_style,
  risk_profile: p.risk_profile,
  motivations: p.motivation_stack_v2?.slice(0, 2)
})), null, 2)}

Generate smart collaboration suggestions:

1. **Task Assignments**: Which team members are best suited for which tasks based on their psychological profiles
2. **Discussion Summaries**: Key insights that would benefit from team discussion
3. **Collaboration Patterns**: Optimal pairing of team members for different project types
4. **Document Co-editing**: Which documents/analyses would benefit from collaborative review

Provide actionable recommendations.`,
        response_json_schema: {
          type: "object",
          properties: {
            task_assignments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task_name: { type: "string" },
                  recommended_assignee: { type: "string" },
                  psychographic_match: { type: "string" },
                  estimated_success_rate: { type: "number" }
                }
              }
            },
            discussion_topics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  priority: { type: "string" },
                  relevant_team_members: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            collaboration_insights: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setTaskSuggestions(response);
      
      toast({
        title: 'Suggestions Generated',
        description: 'AI has analyzed your team and generated collaboration recommendations'
      });
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate suggestions',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeader
          title="Team Collaboration"
          description="AI-powered team coordination and task assignment"
          icon={Users}
          docSection="collaboration"
          actions={
            <Button
              onClick={generateTaskSuggestions}
              disabled={isGenerating}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Suggestions
                </>
              )}
            </Button>
          }
        />

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#e5e5e5] mb-1">Team Members</p>
                  <p className="text-3xl font-bold text-white">{teamMembers.length}</p>
                </div>
                <Users className="w-8 h-8 text-[#00d4ff]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#e5e5e5] mb-1">Active Tasks</p>
                  <p className="text-3xl font-bold text-white">{taskSuggestions.task_assignments?.length || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-[#10b981]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#e5e5e5] mb-1">Discussions</p>
                  <p className="text-3xl font-bold text-white">{taskSuggestions.discussion_topics?.length || 0}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-[#8b5cf6]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {taskSuggestions.task_assignments?.length > 0 && (
          <div className="space-y-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#8b5cf6]" />
                  AI-Recommended Task Assignments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {taskSuggestions.task_assignments.map((task, idx) => (
                  <div key={idx} className="bg-[#0a0a0a] rounded-lg p-4 border border-[#262626]">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-semibold">{task.task_name}</h4>
                      <Badge className="bg-[#10b981] text-white font-bold border-none">
                        {Math.round(task.estimated_success_rate * 100)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-[#a3a3a3] mb-2">
                      <strong className="text-white">Recommended:</strong> {task.recommended_assignee}
                    </p>
                    <p className="text-sm text-[#00d4ff]">{task.psychographic_match}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {taskSuggestions.discussion_topics?.length > 0 && (
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#00d4ff]" />
                    Priority Discussion Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {taskSuggestions.discussion_topics.map((topic, idx) => (
                    <div key={idx} className="bg-[#0a0a0a] rounded-lg p-4 border border-[#262626]">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={
                          topic.priority === 'high' 
                            ? 'bg-[#ef4444] text-white font-bold border-none'
                            : topic.priority === 'medium'
                            ? 'bg-[#fbbf24] text-[#0a0a0a] font-bold border-none'
                            : 'bg-[#3b82f6] text-white font-bold border-none'
                        }>
                          {topic.priority} priority
                        </Badge>
                        <h4 className="text-white font-semibold">{topic.topic}</h4>
                      </div>
                      <p className="text-sm text-[#a3a3a3]">
                        Relevant team: {topic.relevant_team_members.join(', ')}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {taskSuggestions.collaboration_insights?.length > 0 && (
              <Card className="bg-[#8b5cf6]/10 border-[#8b5cf6]/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#fbbf24]" />
                    Collaboration Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {taskSuggestions.collaboration_insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[#e5e5e5]">
                        <div className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full mt-2 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
