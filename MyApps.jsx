
import React, { useState, useEffect } from "react";
import { ClientApp } from "@/api/entities";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, Copy, Check, Trash2, Loader2, Plus, Globe, ExternalLink, Code, Brain, Shield } from "lucide-react";
import { format } from "date-fns";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";

// Normalize domain for display
function normalizeDisplayDomain(domain) {
  if (!domain) return '';
  
  let normalized = domain.trim().toLowerCase();
  normalized = normalized.replace(/^https?:\/\//, '');
  normalized = normalized.replace(/\/+$/, '');
  
  if (normalized.startsWith('localhost') || normalized.startsWith('127.0.0.1')) {
    return 'localhost';
  }
  
  return normalized;
}

// Normalize domain to prevent duplicates
function normalizeDomain(domain) {
  if (!domain) return null;
  
  let normalized = domain.trim().toLowerCase();
  normalized = normalized.replace(/\/+$/, '');
  
  if (normalized.includes('localhost') || normalized.includes('127.0.0.1')) {
    normalized = normalized.replace(/:\d+$/, '');
    if (normalized.startsWith('http://localhost') || normalized.startsWith('localhost')) {
      return 'http://localhost';
    }
    if (normalized.startsWith('http://127.0.0.1') || normalized.startsWith('127.0.0.1')) {
      return 'http://localhost';
    }
    if (normalized.startsWith('https://localhost')) {
      return 'http://localhost';
    }
  }
  
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }
  
  return normalized;
}

export default function MyAppsPage() {
  const [user, setUser] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [newAppDomains, setNewAppDomains] = useState("");
  const [editingApp, setEditingApp] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDomains, setEditDomains] = useState("");
  const [creationError, setCreationError] = useState("");
  const [creationSuccess, setCreationSuccess] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);
  const [deletingAppId, setDeletingAppId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // If admin, show all apps. Otherwise, show only owned apps.
      let userApps;
      if (currentUser.role === 'admin') {
        userApps = await ClientApp.list('-created_date', 100);
      } else {
        userApps = await ClientApp.filter({ owner_id: currentUser.id }, '-created_date');
      }
      
      setApps(userApps || []);
    } catch (err) {
      console.error("Failed to load client apps:", err);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleCreateApp = async (e) => {
    e.preventDefault();
    setCreationError("");
    setCreationSuccess("");
    if (!newAppName.trim()) {
      setCreationError("Application name is required.");
      return;
    }
    setIsCreating(true);
    try {
      const domains = newAppDomains.split(',').map(d => normalizeDomain(d)).filter(Boolean);
      const uniqueDomains = [...new Set(domains)];
      
      const { data, status } = await base44.functions.invoke('createClientApp', { 
        name: newAppName.trim(), 
        authorized_domains: uniqueDomains 
      });
      
      if (status === 201 || status === 200) {
        setCreationSuccess("Application created successfully.");
        setNewAppName("");
        setNewAppDomains("");
        await loadApps();
        toast({
          title: "Success",
          description: "Application created successfully"
        });
      } else {
        const errorMsg = data?.error || "Failed to create application.";
        setCreationError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.details || err?.response?.data?.error || err?.message || "Unexpected error while creating application.";
      setCreationError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    }
    setIsCreating(false);
  };

  const handleEditApp = (app) => {
    setEditingApp(app.id);
    setEditName(app.name);
    setEditDomains((app.authorized_domains || []).join(', '));
  };

  const handleSaveEdit = async (appId) => {
    try {
      const domains = editDomains.split(',').map(d => normalizeDomain(d)).filter(Boolean);
      const uniqueDomains = [...new Set(domains)];
      
      await ClientApp.update(appId, {
        name: editName.trim(),
        authorized_domains: uniqueDomains
      });
      setEditingApp(null);
      setEditName("");
      setEditDomains("");
      await loadApps();
      toast({
        title: "Success",
        description: "Application updated successfully"
      });
    } catch (err) {
      console.error("Failed to update app:", err);
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingApp(null);
    setEditName("");
    setEditDomains("");
  };

  const handleDeleteClick = (app) => {
    setAppToDelete(app);
    setShowDeleteDialog(true);
  };

  const confirmDeleteApp = async () => {
    if (!appToDelete) return;
    
    setDeletingAppId(appToDelete.id);
    setShowDeleteDialog(false);
    
    try {
      await ClientApp.delete(appToDelete.id);
      
      toast({
        title: "Success",
        description: `Application "${appToDelete.name}" deleted successfully`
      });
      
      await loadApps();
      
      // Broadcast deletion event so Dashboard can refresh
      window.dispatchEvent(new CustomEvent('knxw-app-deleted', {
        detail: { app_id: appToDelete.id }
      }));
    } catch (err) {
      console.error("Failed to delete app:", err);
      toast({
        title: "Error",
        description: "Failed to delete application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingAppId(null);
      setAppToDelete(null);
    }
  };

  const copyToClipboard = (text, appId) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(appId);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({
      title: "Copied",
      description: "API key copied to clipboard"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] flex-shrink-0">
              <Server className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight break-words">
                My Applications
              </h1>
              {user?.role === 'admin' && (
                <Badge className="bg-[#8b5cf6] text-white border-none mt-2 inline-flex">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin View
                </Badge>
              )}
            </div>
          </div>
          <p className="text-[#a3a3a3] text-base md:text-lg leading-relaxed">
            {user?.role === 'admin' 
              ? 'Viewing all applications in the system. You can manage any application.'
              : 'Manage your applications, API keys, and authorized domains.'}
          </p>
        </div>

        {/* Create App Card */}
        <div className="space-y-6">
          <Card className="bg-[#111111] border-[#262626]" data-tour="create-app">
            <CardHeader>
              <CardTitle className="text-white">Create New Application</CardTitle>
              <CardDescription className="text-[#a3a3a3]">Create a new project to get a unique API Key and start tracking psychographic insights.</CardDescription>
            </CardHeader>
            <CardContent>
              {creationError && (
                <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
                  {creationError}
                </div>
              )}
              {creationSuccess && (
                <div className="mb-4 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm">
                  {creationSuccess}
                </div>
              )}
              <form onSubmit={handleCreateApp} className="space-y-4">
                <Input
                  placeholder="Application Name (e.g., My Production Site)"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="bg-[#1a1a1a] border-[#262626] text-white"
                  required
                />

                <Input
                  placeholder="Authorized Domains (e.g., https://app.com, http://localhost:3000)"
                  value={newAppDomains}
                  onChange={(e) => setNewAppDomains(e.target.value)}
                  className="bg-[#1a1a1a] border-[#262626] text-white"
                />

                <p className="text-xs text-[#a3a3a3]">
                  Tip: You can enter comma-separated values. We'll normalize localhost URLs automatically.
                </p>
                <Button type="submit" disabled={isCreating || !newAppName.trim()} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {isCreating ? "Creating..." : "Create Application"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Apps List */}
          <div className="space-y-4">
            {apps.map((app) => (
              <Card key={app.id} className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0 w-full">
                      {editingApp === app.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-[#1a1a1a] border-[#262626] text-lg font-semibold text-white"
                            placeholder="Application name"
                          />

                          <Input
                            value={editDomains}
                            onChange={(e) => setEditDomains(e.target.value)}
                            className="bg-[#1a1a1a] border-[#262626] text-white"
                            placeholder="Authorized domains (comma-separated)"
                          />

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(app.id)}
                              className="bg-[#10b981] hover:bg-[#059669] text-white"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="border-[#262626] text-[#a3a3a3] hover:bg-[#262626] hover:text-white"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <CardTitle className="text-lg text-white break-words">{app.name}</CardTitle>
                            {app.is_demo && (
                              <Badge className="bg-[#fbbf24] text-[#0a0a0a] border-none text-xs font-semibold">
                                Demo
                              </Badge>
                            )}
                            {user?.role === 'admin' && app.owner_id !== user?.id && (
                              <Badge className="bg-[#6b7280] text-white border-none text-xs">
                                Other Owner
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge className={`${app.status === 'active' ? 'bg-[#10b981] text-white' : 'bg-[#6b7280] text-white'} border-none`}>
                              {app.status}
                            </Badge>
                            <Badge className="bg-[#00d4ff] text-[#0a0a0a] border-none text-xs font-semibold">
                              Created {format(new Date(app.created_date), 'MMM d, yyyy')}
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                    {editingApp !== app.id && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditApp(app)}
                          className="text-[#a3a3a3] hover:bg-[#262626] hover:text-white"
                          title="Edit application"
                        >
                          <Code className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClick(app)}
                          disabled={deletingAppId === app.id}
                          className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          title="Delete application"
                        >
                          {deletingAppId === app.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                {editingApp !== app.id && (
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#a3a3a3] mb-2 block">API Key</label>
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={app.api_key}
                          className="font-mono text-xs bg-[#0a0a0a] border-[#262626] text-[#e5e5e5] flex-1 min-w-0"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(app.api_key, app.id)}
                          className="border-[#262626] hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/10 flex-shrink-0"
                          title="Copy API key"
                        >
                          {copiedKey === app.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#a3a3a3] mb-2 block">Authorized Domains</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(app.authorized_domains || []).map((domain, idx) => (
                          <Badge key={idx} className="bg-[#262626] text-[#e5e5e5] border border-[#404040] flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            <span className="break-all">{normalizeDisplayDomain(domain)}</span>
                          </Badge>
                        ))}
                        {(!app.authorized_domains || app.authorized_domains.length === 0) && (
                          <p className="text-xs text-amber-400 flex items-center gap-2 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span>No domains configured. Event capture will be restricted.</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
            {apps.length === 0 && (
              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#262626] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-[#a3a3a3]" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">No Applications Created</h3>
                  <p className="text-[#a3a3a3] mb-4">Create your first application to start capturing psychographic insights.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Application"
        description={`Are you sure you want to permanently delete "${appToDelete?.name}"? This action cannot be undone and will immediately stop all event tracking for this application.${appToDelete?.is_demo ? ' This will also remove all associated demo data.' : ''}`}
        confirmText="Delete Application"
        cancelText="Keep Application"
        onConfirm={confirmDeleteApp}
        variant="destructive"
      />
      </div>
    </div>
  );
}
