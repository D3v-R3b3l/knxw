
import React, { useState } from "react";
import { Shield, Users, FileText, BarChart3, DownloadCloud, Briefcase, Key, HeartPulse } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added Card components
import { Link } from 'react-router-dom'; // Added Link for navigation

import OrgManagement from "../components/admin/OrgManagement";
import AccessControl from "../components/admin/AccessControl";
import AuditLogViewer from "../components/admin/AuditLogViewer";
import LogExporter from "../components/admin/LogExporter";

export default function OrgAdminPage() {
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  // This would be set by the OrgManagement component
  const handleOrgSelection = (org) => {
    setSelectedOrgId(org ? org.id : null);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
              <Shield className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Organization Administration
            </h1>
          </div>
          <p className="text-[#a3a3a3] text-lg">
            Manage organizations, users, and access controls with full audit logging
          </p>
        </div>

        {/* Dashboard Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Management Card */}
          <Card className="bg-[#111111] border-[#262626] card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold text-white">User Management</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5]">
                <Users className="w-5 h-5 text-[#0a0a0a]" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#a3a3a3]">
                Invite, remove, and manage roles for users in your organization.
              </p>
            </CardContent>
          </Card>

          {/* Workspace Management Card */}
          <Card className="bg-[#111111] border-[#262626] card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold text-white">Workspace Management</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c]">
                <Briefcase className="w-5 h-5 text-[#0a0a0a]" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#a3a3a3]">
                Create new workspaces to isolate data and configurations.
              </p>
            </CardContent>
          </Card>

          {/* Billing & Subscription Card */}
          <Card className="bg-[#111111] border-[#262626] card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold text-white">Billing & Subscription</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#ec4899] to-[#db2777]">
                <BarChart3 className="w-5 h-5 text-[#0a0a0a]" /> {/* Using BarChart3, could be Receipt/CreditCard */}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#a3a3a3]">
                View your current plan, usage, and manage your subscription.
              </p>
            </CardContent>
          </Card>

          {/* NEW: System Health Card */}
          <Link to="/admin/system-health"> {/* Replaced createPageUrl with a direct path */}
            <Card className="bg-[#111111] border-[#262626] card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-white">System Health</CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669]">
                  <HeartPulse className="w-5 h-5 text-[#0a0a0a]" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#a3a3a3]">
                  Monitor real-time performance and reliability metrics for your organization.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* SSO Configuration Card */}
          <Card className="bg-[#111111] border-[#262626] card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold text-white">SSO Configuration</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#9333ea]">
                <Key className="w-5 h-5 text-[#0a0a0a]" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#a3a3a3]">
                Configure SAML or OIDC for single sign-on access.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed management */}
        <Tabs defaultValue="orgs" className="space-y-6">
          <TabsList className="bg-[#111111] border border-[#262626]">
            <TabsTrigger value="orgs" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <Users className="w-4 h-4 mr-2" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="access" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <Shield className="w-4 h-4 mr-2" />
              Access Control
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <FileText className="w-4 h-4 mr-2" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="exports" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">
              <DownloadCloud className="w-4 h-4 mr-2" />
              Log Exports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orgs">
            <OrgManagement onOrgSelected={handleOrgSelection} />
          </TabsContent>

          <TabsContent value="access">
            <AccessControl />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogViewer />
          </TabsContent>

          <TabsContent value="exports">
            {selectedOrgId ? (
              <LogExporter orgId={selectedOrgId} />
            ) : (
              <div className="text-center py-12 text-[#a3a3a3]">
                Please select an organization from the 'Organizations' tab to export its logs.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
