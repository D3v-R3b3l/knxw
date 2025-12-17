import React, { useState, useEffect } from "react";
import { ImportedTextRecord } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Search, Calendar, Tag, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function ImportedTextRecordsPage() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await ImportedTextRecord.list('-updated_date', 100);
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading imported text records:', error);
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
    record.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const safeFormatDate = (dateString) => {
    try {
      if (!dateString) return 'Unknown';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMM d, yyyy HH:mm');
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
                  <FileText className="w-6 h-6 text-[#0a0a0a]" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Imported Text Records
                </h1>
              </div>
              <p className="text-[#a3a3a3] text-lg">
                View and analyze imported text data for psychographic insights
              </p>
            </div>
            <Button onClick={loadRecords} variant="outline" className="bg-[#111111] border-[#262626] text-white hover:bg-[#262626]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
            <Input
              placeholder="Search by subject ID, text content, or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#111111] border-[#262626] text-white placeholder-[#a3a3a3]"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#00d4ff]">{records.length}</div>
              <div className="text-sm text-[#a3a3a3]">Total Records</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#10b981]">
                {new Set(records.map(r => r.subject_id)).size}
              </div>
              <div className="text-sm text-[#a3a3a3]">Unique Subjects</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#111111] border-[#262626]">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#fbbf24]">
                {records.filter(r => r.analyzed).length}
              </div>
              <div className="text-sm text-[#a3a3a3]">Analyzed</div>
            </CardContent>
          </Card>
        </div>

        {/* Records List */}
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader className="p-6">
            <CardTitle className="text-white">Text Records</CardTitle>
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
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white">
                            {record.subject_id || 'Unknown Subject'}
                          </h3>
                          <Badge className="bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">
                            {record.source || 'unknown'}
                          </Badge>
                          {record.analyzed && (
                            <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">
                              Analyzed
                            </Badge>
                          )}
                        </div>
                        <p className="text-[#a3a3a3] text-sm mb-3 line-clamp-3">
                          {record.text || 'No text content'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[#6b7280]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {safeFormatDate(record.timestamp || record.created_date)}
                          </div>
                          {record.tags && record.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {record.tags.slice(0, 3).join(', ')}
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
                <FileText className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                <p className="text-[#a3a3a3]">
                  {searchTerm ? 'No records match your search' : 'No text records imported yet'}
                </p>
                {!searchTerm && (
                  <p className="text-[#6b7280] text-sm mt-2">
                    Go to Data Import → Text Records to import your first text data
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