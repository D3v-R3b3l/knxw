import React from "react";
import AlertsManager from "../components/admin/AlertsManager";

export default function AlertsSettings() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Alert Settings</h1>
          <p className="text-[#a3a3a3]">Configure monitoring alerts and notification channels for your organization.</p>
        </div>

        <AlertsManager />
      </div>
    </div>
  );
}