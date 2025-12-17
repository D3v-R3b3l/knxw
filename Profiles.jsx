
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Brain, TrendingUp, Target, Search, Filter, Users } from "lucide-react";
import { motion } from "framer-motion";
import MotivationDisplay from "../components/dashboard/MotivationDisplay";
import { safeFormatDate } from "../components/utils/datetime";
import PageHeader from '../components/ui/PageHeader';

export default function ProfilesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterCognitive, setFilterCognitive] = useState("all");
  const [selectedProfile, setSelectedProfile] = useState(null);

  const { data: profiles = [], isLoading, error } = useQuery({
    queryKey: ['profiles', filterRisk, filterCognitive],
    queryFn: async () => {
      let filter = {};
      if (filterRisk !== "all") {
        filter.risk_profile = filterRisk;
      }
      if (filterCognitive !== "all") {
        filter.cognitive_style = filterCognitive;
      }
      
      const results = await base44.entities.UserPsychographicProfile.filter(
        filter,
        '-last_analyzed',
        100
      );
      return results;
    },
  });

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchTerm || 
      profile.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getRiskColor = (risk) => {
    const colors = {
      conservative: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      moderate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      aggressive: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return colors[risk] || colors.moderate;
  };

  const getCognitiveIcon = (style) => {
    const icons = {
      analytical: Brain,
      intuitive: Target,
      systematic: TrendingUp,
      creative: Brain
    };
    return icons[style] || Brain;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8">
        <PageHeader
          title="User Profiles"
          description="Detailed psychographic analysis and behavioral insights"
          icon={Users}
          docSection="data-structures"
        />

        <div className="grid gap-4 mb-6 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
            <Input
              placeholder="Search by user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#111111] border-[#262626] text-white"
            />
          </div>

          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="bg-[#111111] border-[#262626] text-white">
              <SelectValue placeholder="Risk Profile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Profiles</SelectItem>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCognitive} onValueChange={setFilterCognitive}>
            <SelectTrigger className="bg-[#111111] border-[#262626] text-white">
              <SelectValue placeholder="Cognitive Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cognitive Styles</SelectItem>
              <SelectItem value="analytical">Analytical</SelectItem>
              <SelectItem value="intuitive">Intuitive</SelectItem>
              <SelectItem value="systematic">Systematic</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Brain className="w-8 h-8 text-[#00d4ff] animate-spin mx-auto mb-4" />
            <p className="text-[#a3a3a3]">Loading profiles...</p>
          </div>
        ) : error ? (
          <Card className="bg-[#1a1a1a] border-[#262626]">
            <CardContent className="py-12 text-center">
              <p className="text-red-400">Error loading profiles: {error.message}</p>
            </CardContent>
          </Card>
        ) : filteredProfiles.length === 0 ? (
          <Card className="bg-[#1a1a1a] border-[#262626]">
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
              <p className="text-[#a3a3a3]">No profiles found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile, index) => {
              const CognitiveIcon = getCognitiveIcon(profile.cognitive_style);
              return (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="bg-[#1a1a1a] border-[#262626] hover:border-[#00d4ff]/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-[#00d4ff]" />
                          <CardTitle className="text-white text-sm font-mono">
                            {profile.user_id.substring(0, 12)}...
                          </CardTitle>
                        </div>
                        <CognitiveIcon className="w-5 h-5 text-[#a3a3a3]" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getRiskColor(profile.risk_profile)}>
                            {profile.risk_profile}
                          </Badge>
                          <Badge variant="outline" className="border-[#00d4ff]/30 text-[#00d4ff]">
                            {profile.cognitive_style}
                          </Badge>
                        </div>

                        {profile.motivation_stack_v2 && profile.motivation_stack_v2.length > 0 && (
                          <div>
                            <p className="text-xs text-[#a3a3a3] mb-2">Top Motivations:</p>
                            <MotivationDisplay 
                              motivations={profile.motivation_stack_v2.slice(0, 3)} 
                              compact={true}
                            />
                          </div>
                        )}

                        {profile.emotional_state && (
                          <div className="text-sm">
                            <span className="text-[#a3a3a3]">Mood: </span>
                            <span className="text-white capitalize">{profile.emotional_state.mood || 'neutral'}</span>
                          </div>
                        )}

                        <div className="pt-3 border-t border-[#262626] text-xs text-[#6b7280]">
                          Last analyzed: {safeFormatDate(profile.last_analyzed)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {selectedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedProfile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1a1a1a] border border-[#262626] rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Profile Details</h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedProfile(null)}
                  className="text-[#a3a3a3] hover:text-white"
                >
                  Close
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-[#a3a3a3] mb-2">User ID</p>
                  <p className="text-white font-mono">{selectedProfile.user_id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#a3a3a3] mb-2">Risk Profile</p>
                    <Badge className={getRiskColor(selectedProfile.risk_profile)}>
                      {selectedProfile.risk_profile}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-[#a3a3a3] mb-2">Cognitive Style</p>
                    <Badge variant="outline" className="border-[#00d4ff]/30 text-[#00d4ff]">
                      {selectedProfile.cognitive_style}
                    </Badge>
                  </div>
                </div>

                {selectedProfile.motivation_stack_v2 && selectedProfile.motivation_stack_v2.length > 0 && (
                  <div>
                    <p className="text-sm text-[#a3a3a3] mb-3">Motivation Stack</p>
                    <MotivationDisplay motivations={selectedProfile.motivation_stack_v2} />
                  </div>
                )}

                {selectedProfile.personality_traits && (
                  <div>
                    <p className="text-sm text-[#a3a3a3] mb-3">Personality Traits (OCEAN)</p>
                    <div className="space-y-2">
                      {Object.entries(selectedProfile.personality_traits).map(([trait, value]) => (
                        <div key={trait}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white capitalize">{trait}</span>
                            <span className="text-[#a3a3a3]">{(value * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-[#262626] rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] h-2 rounded-full transition-all"
                              style={{ width: `${value * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProfile.emotional_state && (
                  <div>
                    <p className="text-sm text-[#a3a3a3] mb-2">Emotional State</p>
                    <div className="bg-[#111111] rounded-lg p-4 border border-[#262626]">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-[#a3a3a3]">Mood: </span>
                          <span className="text-white capitalize">{selectedProfile.emotional_state.mood || 'neutral'}</span>
                        </div>
                        {selectedProfile.emotional_state.confidence_score !== undefined && (
                          <div>
                            <span className="text-[#a3a3a3]">Confidence: </span>
                            <span className="text-white">
                              {(selectedProfile.emotional_state.confidence_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                        {selectedProfile.emotional_state.energy_level && (
                          <div>
                            <span className="text-[#a3a3a3]">Energy: </span>
                            <span className="text-white capitalize">{selectedProfile.emotional_state.energy_level}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[#262626] text-sm text-[#6b7280]">
                  <p>Last analyzed: {safeFormatDate(selectedProfile.last_analyzed)}</p>
                  {selectedProfile.valid_to && (
                    <p className="mt-1">Valid until: {safeFormatDate(selectedProfile.valid_to)}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
