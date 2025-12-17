
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GoogleConnectCard from "@/components/integrations/GoogleConnectCard";
import GA4ReportPanel from "@/components/integrations/GA4ReportPanel";
import GoogleAdsConnectPanel from "@/components/integrations/GoogleAdsConnectPanel"; // This component is not rendered but the import is preserved as per instructions
import GoogleAdsPerformancePanel from "@/components/integrations/GoogleAdsPerformancePanel";
import { BarChart3 } from "lucide-react";

export default function GoogleData() {
  const [key, setKey] = React.useState(Date.now());

  // This function can be called by child components to force a re-render of the page
  const refreshPage = () => {
    setKey(Date.now());
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" key={key}>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
              <BarChart3 className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Google Data</h1>
          </div>
          <p className="text-[#a3a3a3] text-lg">
            Connect GA4 & Ads, run reports, and analyze performance to enrich psychographic insights.
          </p>
        </div>

        <div className="grid gap-6">
          <GoogleConnectCard />
          <GA4ReportPanel />
          <GoogleAdsPerformancePanel />
          {/* GoogleAdsConnectPanel was removed from rendering as per the outline, but the import remains. */}
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader className="p-6">
              <CardTitle className="text-white">How it works</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 text-[#a3a3a3] text-sm space-y-2">
              <p>1) Click "Connect Google" and authorize access in the popup window.</p>
              <p>2) Once connected, list your GA4 properties and Google Ads customer accounts.</p>
              <p>3) Use the panels below to run reports and analyze performance.</p>
              <p>4) This data enriches on-site behavior for psychographic analysis and ad optimization.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
