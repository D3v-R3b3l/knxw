
import React, { useState, useEffect } from 'react';
import { Workspace } from '@/api/entities';
import { User } from '@/api/entities';
// Replace direct backend import with SDK
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Code, Loader2, Briefcase, Key, Globe, GitBranch } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { SubscriptionGate } from '@/components/billing/SubscriptionGate';

// Import the manager components
import WorkspaceManager from '../components/attribution/WorkspaceManager';
import SecretsManager from '../components/attribution/SecretsManager';
import DomainManager from '../components/attribution/DomainManager';

function SnippetDisplay({ snippet }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast({ title: "Copied to clipboard!", variant: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 bg-[#0a0a0a] border border-[#262626] rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <Label htmlFor="snippet-textarea" className="text-sm font-medium text-[#a3a3a3]">Your SDK Snippet</Label>
        <Button size="sm" variant="ghost" onClick={handleCopy} className="text-[#a3a3a3] hover:text-white">
          {copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4" />}
          <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
        </Button>
      </div>
      <Textarea
        id="snippet-textarea"
        readOnly
        value={snippet}
        className="h-48 bg-[#0a0a0a] border-none text-xs font-mono text-[#a3a3a3] focus-visible:ring-0"
      />
    </div>
  );
}

export default function AttributionSettings() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [origin, setOrigin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [generatedSnippet, setGeneratedSnippet] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    async function loadWorkspaces() {
      setIsLoadingWorkspaces(true);
      try {
        const user = await User.me();
        if (user.role === 'admin') {
          const ws = await Workspace.list();
          setWorkspaces(ws);
          if (ws.length > 0) {
            setSelectedWorkspaceId(ws[0].id);
          }
        }
      } catch (e) {
        toast({ title: "Error loading workspaces", description: e.message, variant: "destructive" });
      } finally {
        setIsLoadingWorkspaces(false);
      }
    }
    loadWorkspaces();
  }, [toast]);
  
  useEffect(() => {
    // When a workspace is selected, pre-fill the origin for snippet generation
    if (selectedWorkspaceId) {
        setOrigin(window.location.origin);
    }
  }, [selectedWorkspaceId]);

  const handleGenerateSnippet = async () => {
    if (!selectedWorkspaceId || !origin) {
      toast({ title: "Missing Information", description: "Please select a workspace and provide an origin.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setGeneratedSnippet('');
    try {
      // Invoke backend function via SDK
      const { data } = await base44.functions.invoke('getSdkSnippet', { workspace_id: selectedWorkspaceId, origin });
      if (data.snippet) {
        setGeneratedSnippet(data.snippet);
      } else {
        throw new Error(data.error || "Failed to generate snippet.");
      }
    } catch (e) {
      toast({ title: "Snippet Generation Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionGate 
      requiredPlan="growth" 
      feature="ROI Attribution & Ad Feedback"
      customMessage="Advanced attribution and ad platform integrations require the Growth plan or higher."
    >
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed]">
                <GitBranch className="w-6 h-6 text-[#0a0a0a]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                ROI Attribution & Ad Feedback
              </h1>
            </div>
            <p className="text-[#a3a3a3] text-lg">
              Configure workspaces, connect ad platforms, and get your tracking snippet.
            </p>
          </div>

          <div className="space-y-6">
              <Card className="bg-[#111111] border-[#262626]" data-tour="attribution-workspace-card">
                   <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white"><Briefcase className="w-5 h-5 text-[#00d4ff]"/>Workspaces</CardTitle>
                      <CardDescription>Select a workspace to manage, or create a new one.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {isLoadingWorkspaces ? (
                          <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin"/></div>
                      ) : (
                          <WorkspaceManager 
                              workspaces={workspaces}
                              setWorkspaces={setWorkspaces}
                              selectedWorkspace={selectedWorkspaceId}
                              onSelectWorkspace={setSelectedWorkspaceId}
                          />
                      )}
                  </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]" data-tour="attribution-secrets-card">
                   <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white"><Key className="w-5 h-5 text-[#00d4ff]"/>Ad Platform Secrets</CardTitle>
                      <CardDescription>Securely store your API credentials for Meta and Google for the selected workspace.</CardDescription>
                  </CardHeader>
                  <CardContent>
                       <SecretsManager workspaceId={selectedWorkspaceId} />
                  </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]" data-tour="attribution-domains-card">
                   <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white"><Globe className="w-5 h-5 text-[#00d4ff]"/>Authorized Domains</CardTitle>
                      <CardDescription>Specify which domains can send conversion data for the selected workspace.</CardDescription>
                  </CardHeader>
                  <CardContent>
                       <DomainManager workspaceId={selectedWorkspaceId} />
                  </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]" data-tour="attribution-sdk-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Code className="w-5 h-5 text-[#00d4ff]" />
                    Attribution SDK Snippet
                  </CardTitle>
                  <CardDescription className="text-[#a3a3a3]">
                    Generate a unique and secure tracking snippet for your website.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="workspace-select" className="text-sm font-medium text-[#a3a3a3]">Workspace</Label>
                    <Select onValueChange={setSelectedWorkspaceId} value={selectedWorkspaceId || ''}>
                      <SelectTrigger id="workspace-select" className="w-full bg-[#1a1a1a] border-[#262626] text-white">
                        <SelectValue placeholder="Select a workspace to generate snippet..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-[#262626]">
                        {workspaces.map(ws => (
                          <SelectItem key={ws.id} value={ws.id} className="text-white hover:bg-[#262626] focus:bg-[#262626]">
                            {ws.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="origin-input" className="text-sm font-medium text-[#a3a3a3]">Authorized Origin For Snippet</Label>
                    <Input
                      id="origin-input"
                      type="text"
                      placeholder="e.g., https://www.your-website.com"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="bg-[#1a1a1a] border-[#262626] text-white"
                    />
                    <p className="text-xs text-[#6b7280] mt-1">
                      The exact website origin (including https://) where the snippet will be installed.
                    </p>
                  </div>
                  <Button onClick={handleGenerateSnippet} disabled={isLoading || !selectedWorkspaceId}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Snippet
                  </Button>

                  {generatedSnippet && <SnippetDisplay snippet={generatedSnippet} />}
                </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </SubscriptionGate>
  );
}
