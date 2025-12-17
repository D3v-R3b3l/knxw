
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlayCircle, Copy, Check, Loader2, Zap, Gamepad2, AlertCircle, Code } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from "date-fns";

const API_EXAMPLES = {
  rest: {
    events: {
      method: 'POST',
      endpoint: '/api/v1/events',
      body: {
        user_id: 'demo_user_123',
        event_type: 'page_view',
        event_payload: {
          url: '/pricing',
          referrer: 'google.com',
          duration_seconds: 45
        },
        session_id: 'sess_demo',
        timestamp: new Date().toISOString()
      }
    },
    profiles: {
      method: 'POST',
      endpoint: '/api/v1/profiles',
      body: {
        user_id: 'demo_user_123'
      }
    },
    insights: {
      method: 'POST',
      endpoint: '/api/v1/insights',
      body: {
        user_id: 'demo_user_123',
        query_type: 'optimization'
      }
    },
    recommendations: {
      method: 'POST',
      endpoint: '/api/v1/recommendations',
      body: {
        user_id: 'demo_user_123',
        context: {
          current_page: '/dashboard',
          session_duration: 300
        }
      }
    }
  },
  gamedev: {
    events: {
      method: 'POST',
      endpoint: '/api/v1/gamedev/events',
      body: {
        player_id: 'player_demo_456',
        event_type: 'level_complete',
        session_id: 'game_sess_123',
        event_payload: {
          level: 5,
          time_seconds: 180,
          deaths: 2,
          score: 8500
        },
        timestamp: new Date().toISOString()
      }
    },
    motivation: {
      method: 'POST',
      endpoint: '/api/v1/gamedev/motivation',
      body: {
        player_id: 'player_demo_456'
      }
    },
    difficulty: {
      method: 'POST',
      endpoint: '/api/v1/gamedev/difficulty',
      body: {
        player_id: 'player_demo_456',
        current_difficulty: 0.6,
        recent_performance: {
          deaths: 5,
          completions: 3,
          avg_time_seconds: 240
        }
      }
    },
    reward: {
      method: 'POST',
      endpoint: '/api/v1/gamedev/reward',
      body: {
        player_id: 'player_demo_456',
        inventory: ['sword', 'shield'],
        session_stats: {
          playtime_minutes: 45,
          levels_completed: 3,
          achievements_unlocked: 2
        }
      }
    },
    churn: {
      method: 'POST',
      endpoint: '/api/v1/gamedev/churn',
      body: {
        player_id: 'player_demo_456',
        days_since_install: 14,
        session_history: {
          total_sessions: 8,
          avg_session_minutes: 25,
          days_since_last_session: 3
        }
      }
    }
  }
};

// Add sample code snippets for common use cases
const CODE_SNIPPETS = {
  javascript: {
    'Real-Time Personalization': `// Initialize knXw SDK
import { KnxwClient } from '@knxw/sdk';
const knxw = new KnxwClient({ apiKey: 'YOUR_API_KEY' });

// Get user profile and personalize UI
async function personalizeExperience(userId) {
  const profile = await knxw.getProfile(userId);
  
  // Adapt UI based on cognitive style
  if (profile.cognitive_style === 'analytical') {
    showDataDrivenDashboard();
  } else if (profile.cognitive_style === 'visual') {
    showInfographicDashboard();
  }
  
  // Personalize CTA based on risk profile
  if (profile.risk_profile === 'conservative') {
    updateCTA('Learn More', 'View Case Studies');
  } else {
    updateCTA('Start Free Trial', 'Get Started Now');
  }
}`,
    'Churn Prevention': `// Monitor churn risk and intervene
async function monitorChurnRisk(userId) {
  const profile = await knxw.getProfile(userId);
  const insights = await knxw.getInsights(userId);
  
  // Check for churn signals
  const churnRisk = insights.find(i => 
    i.insight_type === 'risk_assessment'
  );
  
  if (churnRisk && churnRisk.confidence_score > 0.7) {
    // Trigger personalized intervention
    const intervention = getPersonalizedIntervention(
      profile.motivation_stack[0],
      profile.cognitive_style
    );
    
    await sendIntervention(userId, intervention);
  }
}`,
    'Content Recommendations': `// Get AI-powered content recommendations
async function getPersonalizedContent(userId) {
  const recommendations = await knxw.getRecommendations(userId);
  
  // Display recommendations in UI
  recommendations.forEach(rec => {
    displayContentCard({
      title: rec.content_title,
      url: rec.content_url,
      matchScore: rec.confidence_score,
      reasoning: rec.psychographic_match.match_reasoning
    });
  });
  
  // Track when user clicks recommendation
  knxw.track('recommendation_click', {
    recommendation_id: rec.content_id,
    content_type: rec.content_type
  });
}`
  },
  python: {
    'Batch Profile Analysis': `from knxw import KnxwClient
import pandas as pd

client = KnxwClient(api_key='YOUR_API_KEY')

# Get profiles for multiple users
user_ids = df['user_id'].tolist()
profiles = client.batch_get_profiles(user_ids)

# Convert to DataFrame for analysis
profile_df = pd.DataFrame([{
    'user_id': p['user_id'],
    'cognitive_style': p['cognitive_style'],
    'risk_profile': p['risk_profile'],
    'primary_motivation': p['motivations']['primary'],
    'openness': p['personality']['openness'],
    'engagement_score': p['emotions']['energy']
} for p in profiles])

# Segment users by psychographic profile
segments = profile_df.groupby(['cognitive_style', 'risk_profile']).size()
print(segments)`,
    'Automated Reporting': `from knxw import KnxwClient
from datetime import datetime, timedelta

client = KnxwClient(api_key='YOUR_API_KEY')

# Generate weekly psychographic report
def generate_weekly_report():
    # Get all active users
    profiles = client.get_all_profiles(
        updated_since=(datetime.now() - timedelta(days=7))
    )
    
    # Calculate key metrics
    report = {
        'total_users': len(profiles),
        'avg_engagement': sum(p.get('engagement_score', 0) 
                             for p in profiles) / len(profiles),
        'churn_risk_high': len([p for p in profiles 
                               if p.get('churn_risk', 0) > 0.7]),
        'top_motivations': get_top_motivations(profiles),
        'personality_distribution': get_personality_dist(profiles)
    }
    
    # Send report via email
    send_email_report(report)
    
    return report`
  },
  go: {
    'Microservice Integration': `package main

import (
    "github.com/knxw/knxw-go"
    "log"
)

type UserService struct {
    knxw *knxw.Client
}

func NewUserService(apiKey string) *UserService {
    return &UserService{
        knxw: knxw.NewClient(apiKey),
    }
}

// Personalize API response based on user psychology
func (s *UserService) GetDashboard(userID string) (*Dashboard, error) {
    profile, err := s.knxw.GetProfile(userID)
    if err != nil {
        return nil, err
    }
    
    dashboard := &Dashboard{}
    
    // Adapt dashboard based on cognitive style
    switch profile.CognitiveStyle {
    case "analytical":
        dashboard.Widgets = s.getAnalyticalWidgets()
        dashboard.DataVizType = "tables"
    case "visual":
        dashboard.Widgets = s.getVisualWidgets()
        dashboard.DataVizType = "charts"
    case "systematic":
        dashboard.Widgets = s.getSystematicWidgets()
        dashboard.DataVizType = "workflows"
    }
    
    return dashboard, nil
}`,
    'Event Streaming': `package main

import (
    "github.com/knxw/knxw-go"
    "time"
)

// Stream events to knXw with buffering
func streamUserEvents(apiKey string, eventChan <-chan knxw.Event) {
    client := knxw.NewClient(apiKey)
    buffer := make([]knxw.Event, 0, 100)
    ticker := time.NewTicker(5 * time.Second)
    
    for {
        select {
        case event := <-eventChan:
            buffer = append(buffer, event)
            
            // Flush buffer when full
            if len(buffer) >= 100 {
                client.BatchTrack(buffer)
                buffer = buffer[:0]
            }
            
        case <-ticker.C:
            // Flush buffer periodically
            if len(buffer) > 0 {
                client.BatchTrack(buffer)
                buffer = buffer[:0]
            }
        }
    }
}`
  }
};

export default function DeveloperPlaygroundPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('events');
  const [selectedTab, setSelectedTab] = useState('rest');
  const [selectedSnippet, setSelectedSnippet] = useState('Real-Time Personalization');
  const [snippetLang, setSnippetLang] = useState('javascript');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [clientApp, setClientApp] = useState(null);
  const [loadingKey, setLoadingKey] = useState(true);

  const loadApiKey = useCallback(async () => {
    setLoadingKey(true);
    try {
      const user = await base44.auth.me();
      
      // Try to get the user's client apps
      const apps = await base44.entities.ClientApp.filter(
        { owner_id: user.id, status: 'active' }, 
        '-created_date', 
        1
      );
      
      if (apps && apps.length > 0) {
        const app = apps[0];
        setClientApp(app);
        // Use the app's API key directly
        setApiKey({ 
          key_preview: app.api_key.substring(0, 12),
          full_key: app.api_key 
        });
      } else {
        console.log('No active client apps found');
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    } finally {
      setLoadingKey(false);
    }
  }, []);

  useEffect(() => {
    loadApiKey();
  }, [loadApiKey]);

  useEffect(() => {
    const example = API_EXAMPLES[selectedTab]?.[selectedEndpoint];
    if (example) {
      setRequestBody(JSON.stringify(example.body, null, 2));
    }
  }, [selectedEndpoint, selectedTab]);

  useEffect(() => {
    // When the language changes, try to reset selectedSnippet to a valid option for that language
    if (CODE_SNIPPETS[snippetLang]) {
      const firstSnippetKey = Object.keys(CODE_SNIPPETS[snippetLang])[0];
      if (firstSnippetKey && !CODE_SNIPPETS[snippetLang][selectedSnippet]) {
        setSelectedSnippet(firstSnippetKey);
      } else if (!selectedSnippet && firstSnippetKey) {
        setSelectedSnippet(firstSnippetKey);
      }
    } else {
      setSelectedSnippet(''); // No snippets for this language
    }
  }, [snippetLang, selectedSnippet]);


  const handleExecute = async () => {
    if (!apiKey) {
      setResponse({
        error: 'No API key found. Please create a Client Application first in the "My Apps" page.',
        status: 401
      });
      return;
    }

    setIsLoading(true);
    setResponse(null);

    try {
      const example = API_EXAMPLES[selectedTab][selectedEndpoint];
      const parsedBody = JSON.parse(requestBody);

      const startTime = performance.now();
      const res = await fetch(`${window.location.origin}/functions${example.endpoint}`, {
        method: example.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.full_key}`
        },
        body: JSON.stringify(parsedBody)
      });

      const latency = Math.round(performance.now() - startTime);
      const responseData = await res.json();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        latency,
        headers: Object.fromEntries(res.headers.entries()),
        body: responseData
      });
    } catch (error) {
      setResponse({
        error: error.message,
        status: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateCurlCommand = () => {
    const example = API_EXAMPLES[selectedTab][selectedEndpoint];
    return `curl -X ${example.method} ${window.location.origin}/functions${example.endpoint} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '${requestBody.replace(/\n/g, ' ')}'`;
  };

  if (loadingKey) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff] mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Loading API credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-3 px-2 py-6 md:p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
              <PlayCircle className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                API Playground
              </h1>
              <p className="text-[#a3a3a3] text-lg">
                Test knXw APIs interactively
              </p>
            </div>
          </div>
        </div>

        {!apiKey && !loadingKey && (
          <Card className="bg-[#ef4444]/10 border-[#ef4444]/30 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-[#ef4444] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-2">No API Key Found</h3>
                  <p className="text-[#a3a3a3] mb-4">
                    You need to create a Client Application first to get an API key.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/MyApps'}
                    className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                    Go to My Apps
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-[#111111] border border-[#262626]">
            <TabsTrigger value="rest" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <Zap className="w-4 h-4 mr-2" />
              REST API
            </TabsTrigger>
            <TabsTrigger value="gamedev" className="data-[state=active]:bg-[#ec4899] data-[state=active]:text-white">
              <Gamepad2 className="w-4 h-4 mr-2" />
              GameDev SDK
            </TabsTrigger>
            <TabsTrigger value="snippets" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white">
              <Code className="w-4 h-4 mr-2" />
              Code Examples
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rest" className="space-y-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">REST API Endpoints</CardTitle>
                <CardDescription className="text-[#a3a3a3]">Test knXw's core REST API endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#a3a3a3]">Endpoint</Label>
                    <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#262626]">
                        <SelectItem value="events">POST /api/v1/events</SelectItem>
                        <SelectItem value="profiles">POST /api/v1/profiles</SelectItem>
                        <SelectItem value="insights">POST /api/v1/insights</SelectItem>
                        <SelectItem value="recommendations">POST /api/v1/recommendations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[#a3a3a3]">API Key Status</Label>
                    <div className="flex items-center gap-2 h-10">
                      {apiKey ? (
                        <>
                          <Badge className="bg-[#10b981]/20 text-[#10b981]">
                            <Check className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                          <span className="text-sm text-[#a3a3a3] font-mono">
                            {apiKey.key_preview}...
                          </span>
                        </>
                      ) : (
                        <Badge className="bg-[#ef4444]/20 text-[#ef4444]">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          No key found
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-[#a3a3a3]">Request Body</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(requestBody)}
                      className="text-[#00d4ff] hover:text-[#0ea5e9] hover:bg-[#1a1a1a]">
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="bg-[#1a1a1a] border-[#262626] text-white font-mono text-sm min-h-[300px]"
                    placeholder="Enter request body JSON..."
                  />
                </div>

                <Button
                  onClick={handleExecute}
                  disabled={isLoading || !apiKey}
                  className="w-full bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Execute Request
                    </>
                  )}
                </Button>

                {response && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[#a3a3a3]">Response</Label>
                      <div className="flex items-center gap-3">
                        {response.latency && (
                          <Badge variant="outline" className="border-[#262626] text-[#a3a3a3]">
                            {response.latency}ms
                          </Badge>
                        )}
                        <Badge
                          className={
                            response.status >= 200 && response.status < 300
                              ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30'
                              : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
                          }>
                          {response.status} {response.statusText}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
                      <pre className="text-sm text-white font-mono overflow-x-auto">
                        {JSON.stringify(response.body || { error: response.error }, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <Label className="text-[#a3a3a3] mb-2 block">cURL Command</Label>
                  <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 relative group">
                    <pre className="text-sm text-[#a3a3a3] font-mono overflow-x-auto">
                      {generateCurlCommand()}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(generateCurlCommand())}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gamedev" className="space-y-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Gamepad2 className="w-5 h-5 text-[#ec4899]" />
                  GameDev API Endpoints
                </CardTitle>
                <CardDescription className="text-[#a3a3a3]">Test knXw's specialized game developer endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#a3a3a3]">Endpoint</Label>
                    <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#262626]">
                        <SelectItem value="events">POST /api/v1/gamedev/events</SelectItem>
                        <SelectItem value="motivation">POST /api/v1/gamedev/motivation</SelectItem>
                        <SelectItem value="difficulty">POST /api/v1/gamedev/difficulty</SelectItem>
                        <SelectItem value="reward">POST /api/v1/gamedev/reward</SelectItem>
                        <SelectItem value="churn">POST /api/v1/gamedev/churn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[#a3a3a3]">API Key Status</Label>
                    <div className="flex items-center gap-2 h-10">
                      {apiKey ? (
                        <>
                          <Badge className="bg-[#10b981]/20 text-[#10b981]">
                            <Check className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                          <span className="text-sm text-[#a3a3a3] font-mono">
                            {apiKey.key_preview}...
                          </span>
                        </>
                      ) : (
                        <Badge className="bg-[#ef4444]/20 text-[#ef4444]">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          No key found
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-[#a3a3a3]">Request Body</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(requestBody)}
                      className="text-[#ec4899] hover:text-[#db2777] hover:bg-[#1a1a1a]">
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="bg-[#1a1a1a] border-[#262626] text-white font-mono text-sm min-h-[300px]"
                    placeholder="Enter request body JSON..."
                  />
                </div>

                <Button
                  onClick={handleExecute}
                  disabled={isLoading || !apiKey}
                  className="w-full bg-[#ec4899] hover:bg-[#db2777] text-white font-semibold">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Execute Request
                    </>
                  )}
                </Button>

                {response && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[#a3a3a3]">Response</Label>
                      <div className="flex items-center gap-3">
                        {response.latency && (
                          <Badge variant="outline" className="border-[#262626] text-[#a3a3a3]">
                            {response.latency}ms
                          </Badge>
                        )}
                        <Badge
                          className={
                            response.status >= 200 && response.status < 300
                              ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30'
                              : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
                          }>
                          {response.status} {response.statusText}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
                      <pre className="text-sm text-white font-mono overflow-x-auto">
                        {JSON.stringify(response.body || { error: response.error }, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <Label className="text-[#a3a3a3] mb-2 block">cURL Command</Label>
                  <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 relative group">
                    <pre className="text-sm text-[#a3a3a3] font-mono overflow-x-auto">
                      {generateCurlCommand()}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(generateCurlCommand())}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW: Code Snippets Tab */}
          <TabsContent value="snippets" className="space-y-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white">SDK Code Examples</CardTitle>
                <CardDescription className="text-[#a3a3a3]">
                  Production-ready code snippets for common use cases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#a3a3a3]">Language</Label>
                    <Select value={snippetLang} onValueChange={setSnippetLang}>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#262626]">
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[#a3a3a3]">Use Case</Label>
                    <Select value={selectedSnippet} onValueChange={setSelectedSnippet}>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#262626]">
                        {Object.keys(CODE_SNIPPETS[snippetLang] || {}).map(key => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-[#a3a3a3]">Code Example</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(CODE_SNIPPETS[snippetLang]?.[selectedSnippet] || '')}
                      className="text-[#8b5cf6] hover:text-[#7c3aed] hover:bg-[#1a1a1a]">
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
                    <pre className="text-sm text-[#10b981] font-mono overflow-x-auto">
                      {CODE_SNIPPETS[snippetLang]?.[selectedSnippet] || 'No snippet available'}
                    </pre>
                  </div>
                </div>

                <div className="bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-[#00d4ff] mb-2">💡 Integration Tip</h4>
                  <p className="text-xs text-[#a3a3a3]">
                    All SDKs support the same core functionality: event tracking, profile retrieval, insights querying, and recommendations. 
                    Choose the language that best fits your backend infrastructure.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
