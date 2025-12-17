
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card"; // CardHeader, CardTitle removed as not used in new outline
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Filter, Search, Calendar, User, MousePointer, Eye, Download } from "lucide-react"; // Updated lucide-react imports
import { motion } from "framer-motion";
import { safeFormatDate } from "../components/utils/datetime"; // NEW IMPORT
import PageHeader from '../components/ui/PageHeader';

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // Renamed from filterEventType
  const [filterUserId, setFilterUserId] = useState(""); // NEW STATE

  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ['events', filterType, filterUserId],
    queryFn: async () => {
      let filter = { is_demo: false }; // Added is_demo: false as per original context
      if (filterType !== "all") {
        filter.event_type = filterType;
      }
      if (filterUserId) {
        // Assuming user_id filter can be a partial match, using "$ilike"
        // If exact match is needed, remove "$ilike" and "%"
        filter.user_id = { "$ilike": `%${filterUserId}%` };
      }
      
      const results = await base44.entities.CapturedEvent.filter(
        filter,
        '-timestamp', // Order by timestamp descending
        100 // Fetch 100 events
      );
      return results;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // This `filteredEvents` is client-side filtering on top of the `useQuery` results
  // The useQuery already filters by filterType and filterUserId
  // This `searchTerm` filtering is *additional* on top of what base44.entities.CapturedEvent.filter does.
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.user_id && event.user_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.event_payload && JSON.stringify(event.event_payload).toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getEventIcon = (eventType) => {
    const icons = {
      page_view: Eye,
      click: MousePointer,
      scroll: Activity,
      form_submit: User,
      form_focus: User,
      hover: MousePointer,
      exit_intent: Activity,
      time_on_page: Calendar
    };
    return icons[eventType] || Activity;
  };

  const getEventColor = (eventType) => {
    const colors = {
      page_view: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      click: "bg-green-500/20 text-green-400 border-green-500/30",
      scroll: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      form_submit: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      form_focus: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      hover: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      exit_intent: "bg-red-500/20 text-red-400 border-red-500/30",
      time_on_page: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
    };
    return colors[eventType] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  // No specific useEffect for initial load/refetch needed as useQuery handles it

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#111111] p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Event Stream"
          description="Real-time behavioral event capture and analysis"
          icon={Activity}
          docSection="javascript-sdk"
          actions={
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10"
              disabled={isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          }
        />

        <div className="grid gap-4 mb-6 md:grid-cols-3 sticky top-0 bg-gradient-to-br from-[#0a0a0a] to-[#111111] py-4 z-10"> {/* Added sticky filters */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#111111] border-[#262626] text-white"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-[#111111] border-[#262626] text-white">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="page_view">Page Views</SelectItem>
              <SelectItem value="click">Clicks</SelectItem>
              <SelectItem value="scroll">Scrolls</SelectItem>
              <SelectItem value="form_submit">Form Submits</SelectItem>
              <SelectItem value="hover">Hovers</SelectItem>
              {/* Additional event types could be added here if needed */}
              <SelectItem value="form_focus">Form Focus</SelectItem>
              <SelectItem value="exit_intent">Exit Intent</SelectItem>
              <SelectItem value="time_on_page">Time on Page</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter by User ID"
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="bg-[#111111] border-[#262626] text-white"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Activity className="w-8 h-8 text-[#00d4ff] animate-spin mx-auto mb-4" />
            <p className="text-[#a3a3a3]">Loading events...</p>
          </div>
        ) : error ? (
          <Card className="bg-[#1a1a1a] border-[#262626]">
            <CardContent className="py-12 text-center">
              <p className="text-red-400">Error loading events: {error.message}</p>
            </CardContent>
          </Card>
        ) : filteredEvents.length === 0 ? (
          <Card className="bg-[#1a1a1a] border-[#262626]">
            <CardContent className="py-12 text-center">
              <Activity className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
              <p className="text-[#a3a3a3]">No events captured yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event, index) => {
              const EventIcon = getEventIcon(event.event_type);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-[#1a1a1a] border-[#262626] hover:border-[#00d4ff]/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg border ${getEventColor(event.event_type)}`}>
                          <EventIcon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="border-[#00d4ff]/30 text-[#00d4ff]">
                              {event.event_type.replace(/_/g, ' ')} {/* Convert snake_case to readable */}
                            </Badge>
                            <span className="text-sm text-[#a3a3a3]">
                              {safeFormatDate(event.timestamp)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {event.user_id && (
                              <div>
                                <span className="text-[#a3a3a3]">User ID:</span>
                                <span className="text-white ml-2 font-mono break-all">{event.user_id}</span>
                              </div>
                            )}
                            {event.session_id && (
                              <div>
                                <span className="text-[#a3a3a3]">Session:</span>
                                <span className="text-white ml-2 font-mono break-all">{event.session_id?.substring(0, 8)}...</span>
                              </div>
                            )}
                          </div>
                          
                          {event.event_payload && Object.keys(event.event_payload).length > 0 && (
                            <div className="mt-2 p-2 bg-[#111111] rounded border border-[#262626]">
                              <pre className="text-xs text-[#a3a3a3] overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(event.event_payload, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
