import React, { useState, useEffect } from "react";
import { CRMRecord } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, Calendar, Mail, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function CRMRecordsPage() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await CRMRecord.list('-updated_date', 100);
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading CRM records:', error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const filteredRecords = records.filter(record => 
    record.subject_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.lifecycle_stage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const safeFormatDate = (dateString) => {
    try {
      if (!dateString) return 'Never';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown';
    }
  };

  const getStageColor = (stage) => {
    switch (stage?.toLowerCase()) {
      case 'lead': return 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30';
      case 'mql': return 'bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30';
      case 'sql': return 'bg-[#ec4899]/20 text-[#ec4899] border-[#ec4899]/30';
      case 'customer': return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30';
      case 'churned': return 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30';
      default: return 'bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
                  <Users className="w-6 h-6 text-[#0a0a0a]" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  CRM Records
                </h1>
              </div>
              <p className="text-[#a3a3a3] text-lg">
                View and manage imported CRM contact data
              </p>
            </div>
            <Button onClick={loadRecords} variant="outline" className="bg-[#111111] border-[#262626] text-white hover:bg-[#262626]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
            <Input
              placeholder="Search by subject ID, email, name, or lifecycle stage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#111111] border-[#262626] text-white placeholder-[#a3a3a3]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#00d4ff]">{records.length}</div>
              <div className="text-sm text-[#a3a3a3]">Total Records</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#10b981]">
                {records.filter(r => r.lifecycle_stage === 'customer').length}
              </div>
              <div className="text-sm text-[#a3a3a3]">Customers</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#fbbf24]">
                {records.filter(r => ['lead', 'mql', 'sql'].includes(r.lifecycle_stage)).length}
              </div>
              <div className="text-sm text-[#a3a3a3]">Leads</div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#ec4899]">
                {records.filter(r => r.email).length}
              </div>
              <div className="text-sm text-[#a3a3a3]">With Email</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader className="p-6">
            <CardTitle className="text-white">CRM Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-[#262626] rounded mb-2" />
                    <div className="h-3 bg-[#262626] rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : filteredRecords.length > 0 ? (
              <div className="divide-y divide-[#262626]">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="p-6 hover:bg-[#1a1a1a] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-white">
                            {record.name || record.subject_id || 'Unknown Contact'}
                          </h3>
                          {record.lifecycle_stage && (
                            <Badge className={getStageColor(record.lifecycle_stage)}>
                              {record.lifecycle_stage}
                            </Badge>
                          )}
                          {record.source && (
                            <Badge className="bg-[#6b7280]/20 text-[#6b7280] border-[#6b7280]/30">
                              {record.source}
                            </Badge>
                          )}
                        </div>
                        {record.email && (
                          <div className="flex items-center gap-1 text-[#a3a3a3] text-sm mb-2">
                            <Mail className="w-3 h-3" />
                            {record.email}
                          </div>
                        )}
                        {record.notes && (
                          <p className="text-[#a3a3a3] text-sm mb-3 line-clamp-2">
                            {record.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-[#6b7280]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Last contacted: {safeFormatDate(record.last_contacted_at)}
                          </div>
                          {record.tags && record.tags.length > 0 && (
                            <div>
                              Tags: {record.tags.slice(0, 3).join(', ')}
                              {record.tags.length > 3 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                <p className="text-[#a3a3a3]">
                  {searchTerm ? 'No records match your search' : 'No CRM records imported yet'}
                </p>
                {!searchTerm && (
                  <p className="text-[#6b7280] text-sm mt-2">
                    Go to Data Import → CRM Records to import your first CRM data
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}