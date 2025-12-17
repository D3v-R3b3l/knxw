
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStore } from "@/components/dashboard/DashboardStore";
import { createPageUrl } from "@/utils";
import { formatDistanceToNow } from "date-fns";

export default function PageAnalytics() {
  const { events, appOrigins } = useDashboardStore();
  const [path, setPath] = useState("/");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const p = urlParams.get("path");
    setPath(p || "/");
  }, []);

  const { rows, sessionsCount, conversions, avgDwell, exits } = useMemo(() => {
    // Filter to this path
    const list = (events || []).filter((e) => {
      const url = e?.event_payload?.url || "";
      try {
        const u = new URL(url);
        return u.pathname === path;
      } catch {
        return false;
      }
    });

    let dwellTotal = 0;
    let dwellCount = 0;
    let conversions = 0;
    let exits = 0;
    const sessions = new Map();

    list.forEach((e) => {
      if (e.event_type === "time_on_page" && e.event_payload?.duration) {
        dwellTotal += Number(e.event_payload.duration) || 0;
        dwellCount += 1;
      }
      if (e.event_type === "checkout_complete") conversions += 1;

      const sk = `${e.user_id || "anon"}::${e.session_id || "sess"}`;
      const prev = sessions.get(sk);
      if (prev && prev.type === "page_view" && prev.path === path) {
        exits += 1;
      }
      sessions.set(sk, { type: e.event_type, path });
    });

    // Recent events rows table
    const rows = list.slice(0, 100).map((e) => ({
      id: e.id,
      type: e.event_type,
      ts: e.timestamp,
      user: e.user_id,
      session: e.session_id
    }));

    return {
      rows,
      sessionsCount: sessions.size,
      conversions,
      exits,
      avgDwell: dwellCount ? Math.round(dwellTotal / dwellCount) : 0
    };
  }, [events, path]); // removed unnecessary appOrigins dependency

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Page Analytics</h1>
          <div className="text-sm text-[#a3a3a3] mt-1">
            App Scoped • Path: <Badge variant="outline" className="ml-1">{path}</Badge>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#111111] border-[#262626]"><CardHeader><CardTitle className="text-sm text-white">Sessions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{sessionsCount}</div></CardContent></Card>
          <Card className="bg-[#111111] border-[#262626]"><CardHeader><CardTitle className="text-sm text-white">Events</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{rows.length}</div></CardContent></Card>
          <Card className="bg-[#111111] border-[#262626]"><CardHeader><CardTitle className="text-sm text-white">Conversions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{conversions}</div></CardContent></Card>
          <Card className="bg-[#111111] border-[#262626]"><CardHeader><CardTitle className="text-sm text-white">Avg Dwell (s)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{avgDwell}</div></CardContent></Card>
        </div>

        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader><CardTitle className="text-white">Recent Events</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 text-xs text-[#a3a3a3] mb-2">
              <div>Time</div><div>User</div><div>Session</div><div>Type</div><div>Link</div>
            </div>
            <div className="space-y-1">
              {rows.map((r) => (
                <div key={r.id} className="grid grid-cols-5 gap-2 p-2 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                  <div>{formatDistanceToNow(new Date(r.ts), { addSuffix: true })}</div>
                  <div className="truncate">{r.user || "anon"}</div>
                  <div className="truncate">{r.session || "-"}</div>
                  <div className="capitalize">{String(r.type || "").replace(/_/g, " ")}</div>
                  <a href={`${createPageUrl("Events")}?q=${encodeURIComponent(r.user || "")}&type=${encodeURIComponent(r.type || "")}`} className="text-[#00d4ff] hover:underline">Open Stream</a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
