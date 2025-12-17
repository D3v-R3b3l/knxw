
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar, 
  Settings, 
  LogOut,
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from "@/utils";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setEditForm({
        full_name: currentUser.full_name || '',
        // Add other editable fields here
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await User.logout();
        // User will be redirected automatically by Base44
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSaveMessage({ type: '', text: '' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      full_name: user.full_name || '',
    });
    setSaveMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });
    
    try {
      await User.updateMyUserData({
        full_name: editForm.full_name.trim()
      });
      
      // Reload the user data to get the updated info
      await loadUserProfile();
      setIsEditing(false);
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }
    setIsSaving(false);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30';
      case 'user':
        return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30';
      default:
        return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-[#ef4444] mx-auto mb-4" />
              <p className="text-[#a3a3a3]">Failed to load user profile</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
              <UserIcon className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              User Profile
            </h1>
          </div>
          <p className="text-[#a3a3a3] text-lg">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Success/Error Message */}
        {saveMessage.text && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
            saveMessage.type === 'success' 
              ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]' 
              : 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'
          }`}>
            {saveMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#00d4ff]" />
                    Profile Information
                  </CardTitle>
                  {!isEditing ? (
                    <Button
                      onClick={handleEdit}
                      variant="outline"
                      size="sm"
                      className="border-[#262626] hover:border-[#00d4ff]/50 text-[#a3a3a3] hover:text-white"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        size="sm"
                        className="bg-[#10b981] hover:bg-[#059669] text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        variant="outline"
                        size="sm"
                        className="border-[#262626] hover:border-[#ef4444]/50 text-[#a3a3a3] hover:text-[#ef4444]"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-6 pt-0 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        placeholder="Enter your full name"
                        className="bg-[#0a0a0a] border-[#262626] text-white"
                      />
                    ) : (
                      <div className="p-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white">
                        {user.full_name || 'Not provided'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                      Email Address
                    </label>
                    <div className="p-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-[#a3a3a3] flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    <p className="text-xs text-[#6b7280] mt-1">
                      Email cannot be changed (managed by authentication provider)
                    </p>
                  </div>
                </div>

                <Separator className="bg-[#262626]" />

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                      Account Role
                    </label>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                      Member Since
                    </label>
                    <div className="flex items-center gap-2 text-white">
                      <Calendar className="w-4 h-4 text-[#a3a3a3]" />
                      {format(new Date(user.created_date), 'MMMM d, yyyy')}
                    </div>
                  </div>
                </div>

                {/* Onboarding Status */}
                <div>
                  <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                    Onboarding Status
                  </label>
                  <Badge className={
                    user.onboarding_completed 
                      ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' 
                      : 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30'
                  }>
                    {user.onboarding_completed ? 'Completed' : 'Pending'}
                  </Badge>
                  {!user.onboarding_completed && (
                    <p className="text-xs text-[#a3a3a3] mt-1">
                      Complete your onboarding to unlock all features
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader className="p-6">
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#10b981]" />
                  Account Security
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-[#262626] rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">Authentication Provider</h4>
                      <p className="text-sm text-[#a3a3a3]">Google OAuth (Secure)</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-[#10b981]" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-[#262626] rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                      <p className="text-sm text-[#a3a3a3]">Managed by Google</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-[#10b981]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Picture */}
            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-10 h-10 text-[#0a0a0a]" />
                </div>
                <h3 className="font-semibold text-white">{user.full_name || 'User'}</h3>
                <p className="text-sm text-[#a3a3a3]">{user.email}</p>
                <Badge className={getRoleBadgeColor(user.role)} size="sm">
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                </Badge>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader className="p-6">
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 pt-0 space-y-3">
                <Button
                  onClick={() => { window.location.href = createPageUrl("Settings") + "?onboarding=true"; }}
                  variant="outline"
                  className="w-full justify-start border-[#262626] hover:border-[#00d4ff]/50 text-[#a3a3a3] hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Restart Onboarding
                </Button>
                
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full justify-start border-[#ef4444]/30 hover:border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader className="p-6">
                <CardTitle className="text-white text-lg">Account Activity</CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#00d4ff]">
                    {Math.floor((Date.now() - new Date(user.created_date)) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-[#a3a3a3]">Days as member</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
