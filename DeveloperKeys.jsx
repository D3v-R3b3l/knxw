import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Key, Copy, Check, Plus, Trash2, Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { User } from '@/api/entities';
import { toast } from 'sonner';

export default function DeveloperKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [org, setOrg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const [copiedKeys, setCopiedKeys] = useState(new Set());
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      
      // Get or create org
      let orgs = await base44.entities.Org.filter({ created_by: user.email }, '-created_date', 1);
      let currentOrg = orgs[0];
      
      if (!currentOrg) {
        // Create default org
        currentOrg = await base44.entities.Org.create({
          name: `${user.full_name}'s Organization`,
          status: 'active'
        });
      }
      
      setOrg(currentOrg);
      
      // Load API keys for this org
      const keys = await base44.entities.ApiKey.filter({ tenant_id: currentOrg.id }, '-created_date', 50);
      setApiKeys(keys);
      
    } catch (error) {
      console.error('Failed to load API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const generateApiKey = () => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return 'knxw_' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const hashKey = async (key) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    setIsCreating(true);
    try {
      const fullKey = generateApiKey();
      const keyHash = await hashKey(fullKey);
      const keyPrefix = fullKey.substring(0, 12);

      const createdKey = await base44.entities.ApiKey.create({
        tenant_id: org.id,
        name: newKeyName.trim(),
        key_hash: keyHash,
        key_prefix: keyPrefix,
        rate_limit_rpm: 100,
        rate_limit_burst: 200,
        scopes: ['events:write', 'profiles:read', 'insights:read', 'recommendations:read'],
        status: 'active'
      });

      setNewlyCreatedKey({ ...createdKey, full_key: fullKey });
      setApiKeys(prev => [createdKey, ...prev]);
      setNewKeyName('');
      setShowCreateForm(false);
      
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Failed to create API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await base44.entities.ApiKey.update(keyId, { status: 'revoked' });
      setApiKeys(prev => prev.map(key => key.id === keyId ? { ...key, status: 'revoked' } : key));
      toast.success('API key revoked');
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      toast.error('Failed to revoke API key');
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to permanently delete this API key?')) {
      return;
    }

    try {
      await base44.entities.ApiKey.delete(keyId);
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast.success('API key deleted');
    } catch (error) {
      console.error('Failed to delete API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text, keyId) => {
    navigator.clipboard.writeText(text);
    setCopiedKeys(prev => new Set(prev).add(keyId));
    toast.success('Copied to clipboard');
    setTimeout(() => {
      setCopiedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyId);
        return newSet;
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#00d4ff] mx-auto mb-4" />
          <p className="text-[#a3a3a3]">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Key className="w-8 h-8 text-[#00d4ff]" />
                API Keys
              </h1>
              <p className="text-[#a3a3a3] mt-2">
                Manage API keys for authenticating requests to the knXw Developer Platform
              </p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </div>
        </div>

        {/* New Key Alert */}
        {newlyCreatedKey && (
          <Card className="bg-[#10b981]/10 border-[#10b981]/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-[#10b981] flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2">Your new API key</h3>
                  <p className="text-sm text-[#a3a3a3] mb-4">
                    Make sure to copy your API key now. You won't be able to see it again!
                  </p>
                  <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-lg p-3">
                    <code className="flex-1 text-sm text-white font-mono">{newlyCreatedKey.full_key}</code>
                    <Button
                      onClick={() => copyToClipboard(newlyCreatedKey.full_key, 'new')}
                      size="sm"
                      variant="ghost"
                      className="text-[#00d4ff]"
                    >
                      {copiedKeys.has('new') ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button
                    onClick={() => setNewlyCreatedKey(null)}
                    size="sm"
                    variant="ghost"
                    className="mt-4 text-[#10b981]"
                  >
                    Got it, don't show this again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <Card className="bg-[#111111] border-[#262626] mb-8">
            <CardHeader>
              <CardTitle className="text-white">Create New API Key</CardTitle>
              <CardDescription className="text-[#a3a3a3]">
                Give your API key a descriptive name to help you identify it later
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="e.g., Production Frontend, Analytics Backend"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="bg-[#0a0a0a] border-[#262626] text-white"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateKey}
                  disabled={isCreating || !newKeyName.trim()}
                  className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Key'
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewKeyName('');
                  }}
                  variant="outline"
                  className="border-[#262626] text-[#a3a3a3]"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Keys List */}
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="p-12 text-center">
                <Key className="w-12 h-12 text-[#404040] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No API keys yet</h3>
                <p className="text-[#a3a3a3] mb-6">
                  Create your first API key to start using the knXw Developer Platform
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create API Key
                </Button>
              </CardContent>
            </Card>
          ) : (
            apiKeys.map((key) => (
              <Card key={key.id} className="bg-[#111111] border-[#262626]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{key.name}</h3>
                        <Badge
                          variant="outline"
                          className={
                            key.status === 'active'
                              ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30'
                              : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
                          }
                        >
                          {key.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-[#a3a3a3] font-mono bg-[#0a0a0a] px-2 py-1 rounded">
                            {key.key_prefix}••••••••••••••••
                          </code>
                          <Button
                            onClick={() => copyToClipboard(key.key_prefix, key.id)}
                            size="sm"
                            variant="ghost"
                            className="text-[#00d4ff] p-1 h-auto"
                          >
                            {copiedKeys.has(key.id) ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-xs text-[#6b7280]">
                          <span>Created: {new Date(key.created_date).toLocaleDateString()}</span>
                          {key.last_used_at && (
                            <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                          )}
                          <span>Rate limit: {key.rate_limit_rpm} req/min</span>
                        </div>
                        
                        {key.scopes && key.scopes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {key.scopes.map((scope, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {scope}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      {key.status === 'active' && (
                        <Button
                          onClick={() => handleRevokeKey(key.id)}
                          size="sm"
                          variant="outline"
                          className="border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/10"
                        >
                          Revoke
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteKey(key.id)}
                        size="sm"
                        variant="ghost"
                        className="text-[#ef4444] hover:bg-[#ef4444]/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}