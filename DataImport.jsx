
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadFile, ExtractDataFromUploadedFile } from "@/api/integrations";
import { CRMRecord } from "@/api/entities";
import { ImportedTextRecord } from "@/api/entities";
import { EmployeeRecord } from "@/api/entities";
import { processImportedData } from "@/api/functions";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, FileText, Database, CheckCircle2, Brain, Download, Sparkles, Search, Calendar, Tag, Building, Users, Mail, TrendingUp, Zap } from "lucide-react";
import { format } from "date-fns";
// FIX: Import the new centralized error handler
import { handleApiError } from "../components/system/errorHandler";

function DataViewer({ entityType, EntityClass, title, icon: Icon }) {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      // Assuming EntityClass.list exists and fetches records
      const data = await EntityClass.list('-updated_date', 100); 
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(`Error loading ${entityType} records:`, error);
      // FIX: Use centralized error handler
      handleApiError(error, `Could not fetch ${entityType} records.`);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [EntityClass, entityType]); // Removed 'toast' from dependency array as handleApiError handles it

  useEffect(() => {
    loadRecords();
    
    // Listen for a custom event to re-load data after an import
    const handleDataImported = () => {
      loadRecords();
    };
    window.addEventListener('dataImported', handleDataImported);
    return () => {
      window.removeEventListener('dataImported', handleDataImported);
    };
  }, [loadRecords]);

  const filteredRecords = records.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    // Check if the record has the properties before calling .toLowerCase()
    return (record.subject_id?.toLowerCase().includes(searchLower) ||
           record.text?.toLowerCase().includes(searchLower) ||
           record.name?.toLowerCase().includes(searchLower) ||
           record.email?.toLowerCase().includes(searchLower) ||
           record.department?.toLowerCase().includes(searchLower) ||
           record.notes?.toLowerCase().includes(searchLower));
  });

  const handleIntelligentProcessing = async () => {
    if (records.length === 0) {
      toast({ title: "No records to process", description: "Import some records first.", variant: "default" });
      return;
    }
    
    setIsProcessing(true);
    try {
      const unprocessedRecords = records.filter(r => !r.analyzed);
      const recordIds = unprocessedRecords.map(r => r.id);
      
      if (recordIds.length === 0) {
        toast({ title: "All records already processed", description: "No new records to process.", variant: "default" });
        setIsProcessing(false); // Make sure to reset loading state
        return;
      }

      // Assuming processImportedData is an async function that handles the backend call
      // FIX: Use centralized error handler for API call
      const { data } = await processImportedData({ 
        entity_type: entityType, 
        record_ids: recordIds 
      });

      toast({
        title: "Intelligent Processing Complete! 🎉",
        description: `Processed ${data.processed_count || 0} records, created ${data.profiles_created || 0} profiles, generated ${data.insights_generated || 0} insights`,
        variant: "success"
      });

      // Show suggestions if available
      data.suggestions?.forEach((suggestion, idx) => {
        setTimeout(() => {
          toast({
            title: "💡 Smart Suggestion",
            description: suggestion,
            variant: "default"
          });
        }, (idx + 1) * 2000); // Stagger suggestions
      });

      await loadRecords(); // Refresh to show processed status
    } catch (error) {
      // FIX: Use centralized error handler
      handleApiError(error, "Intelligent processing failed.");
      console.error("Intelligent processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getRecordPreview = (record) => {
    if (entityType === 'ImportedTextRecord') {
      return {
        title: record.subject_id || 'Unknown Subject',
        subtitle: record.source || 'unknown',
        content: record.text || 'No text content',
        badges: [
          { text: record.source || 'unknown', color: 'bg-[#00d4ff]/20 text-[#00d4ff]' },
          ...(record.analyzed ? [{ text: 'Analyzed', color: 'bg-[#10b981]/20 text-[#10b981]' }] : [])
        ]
      };
    } else if (entityType === 'CRMRecord') {
      return {
        title: record.name || record.subject_id || 'Unknown Contact',
        subtitle: record.email || '',
        content: record.notes || 'No notes',
        badges: [
          ...(record.lifecycle_stage ? [{ text: record.lifecycle_stage, color: 'bg-[#8b5cf6]/20 text-[#8b5cf6]' }] : []),
          ...(record.source ? [{ text: record.source, color: 'bg-[#6b7280]/20 text-[#6b7280]' }] : []),
          ...(record.analyzed ? [{ text: 'Analyzed', color: 'bg-[#10b981]/20 text-[#10b981]' }] : [])
        ]
      };
    } else { // EmployeeRecord
      return {
        title: record.name || record.subject_id || 'Unknown Employee',
        subtitle: record.email || '',
        content: record.notes || 'No notes',
        badges: [
          ...(record.department ? [{ text: record.department, color: 'bg-[#8b5cf6]/20 text-[#8b5cf6]' }] : []),
          ...(record.role ? [{ text: record.role, color: 'bg-[#00d4ff]/20 text-[#00d4ff]' }] : []),
          ...(record.analyzed ? [{ text: 'Analyzed', color: 'bg-[#10b981]/20 text-[#10b981]' }] : [])
        ]
      };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with intelligent processing */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-[#00d4ff]" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <Badge className="bg-[#111111] text-[#a3a3a3]">{records.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleIntelligentProcessing} 
            disabled={isProcessing || records.length === 0}
            className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] text-[#0a0a0a] hover:from-[#0ea5e9] hover:to-[#38bdf8]"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
            Intelligent Processing
          </Button>
          <Button variant="outline" className="border-[#262626] text-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
        <Input
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-[#111111] border-[#262626] text-white"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] text-center">
          <div className="text-lg font-bold text-[#00d4ff]">{records.length}</div>
          <div className="text-xs text-[#a3a3a3]">Total</div>
        </div>
        <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] text-center">
          <div className="text-lg font-bold text-[#10b981]">
            {records.filter(r => r.analyzed).length}
          </div>
          <div className="text-xs text-[#a3a3a3]">Processed</div>
        </div>
        <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] text-center">
          <div className="text-lg font-bold text-[#fbbf24]">
            {new Set(records.map(r => r.subject_id)).size}
          </div>
          <div className="text-xs text-[#a3a3a3]">Unique</div>
        </div>
        <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] text-center">
          <div className="text-lg font-bold text-[#ec4899]">
            {records.filter(r => r.created_date && new Date(r.created_date) > new Date(Date.now() - 24*60*60*1000)).length}
          </div>
          <div className="text-xs text-[#a3a3a3]">Recent (24h)</div>
        </div>
      </div>

      {/* Records list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse p-4 rounded-lg bg-[#141414]">
              <div className="h-4 bg-[#262626] rounded mb-2" />
              <div className="h-3 bg-[#262626] rounded w-3/4" />
            </div>
          ))
        ) : filteredRecords.length > 0 ? (
          filteredRecords.map((record) => {
            const preview = getRecordPreview(record);
            return (
              <div key={record.id} className="p-4 rounded-lg bg-[#141414] border border-[#262626] hover:border-[#00d4ff]/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white text-sm">{preview.title}</h4>
                      {preview.badges.map((badge, idx) => (
                        <Badge key={idx} className={`${badge.color} border-0 text-xs`}>
                          {badge.text}
                        </Badge>
                      ))}
                    </div>
                    {preview.subtitle && (
                      <p className="text-xs text-[#a3a3a3] mb-1">{preview.subtitle}</p>
                    )}
                    <p className="text-xs text-[#a3a3a3] line-clamp-2">{preview.content}</p>
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {record.created_date ? format(new Date(record.created_date), 'MMM d, yyyy') : 'No Date'}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-[#a3a3a3]">
            <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No records found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Uploader({ title, description, jsonSchema, onImport }) {
  const [file, setFile] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [extracted, setExtracted] = React.useState(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const { toast } = useToast();

  const inferSubjectIdFromName = (name) => {
    if (!name) return "";
    const base = name.replace(/\.[^.]+$/, ""); // drop extension
    const parts = base.split(/[_\- ]+/);
    return (parts[0] || base).slice(0, 64);
  };

  const hasTextFieldInSchema = React.useMemo(() => {
    return !!jsonSchema?.properties?.text;
  }, [jsonSchema]);

  const requiredFields = React.useMemo(() => {
    return Array.isArray(jsonSchema?.required) ? jsonSchema.required : [];
  }, [jsonSchema]);

  const validateRowsAgainstSchema = (rows) => {
    const missing = [];
    rows.forEach((row, idx) => {
      requiredFields.forEach((f) => {
        // Check for undefined, null, or empty string for required fields
        if (row[f] === undefined || row[f] === null || String(row[f]).trim() === "") {
          missing.push({ index: idx, field: f });
        }
      });
    });
    return missing;
  };

  const parseJsonFile = async (fileObj) => {
    const text = await fileObj.text();
    try {
      const data = JSON.parse(text);
      const rows = Array.isArray(data) ? data : [data];
      return rows;
    } catch (e) {
      throw new Error("Invalid JSON file. Please provide valid JSON.");
    }
  };

  const parseTxtFileForTextSchema = async (fileObj) => {
    const content = await fileObj.text();
    // Wrap into a single record; best-effort defaults for required fields
    const subjectId = inferSubjectIdFromName(fileObj.name) || "unknown_subject";
    const row = {
      subject_id: subjectId,
      source: "upload",
      tags: [],
      text: content,
      timestamp: new Date().toISOString()
    };
    return [row];
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setExtracted(null); // Clear previous extraction
    try {
      const nameLower = (file.name || "").toLowerCase();
      const ext = nameLower.includes(".") ? nameLower.split(".").pop() : "";

      // Handle JSON locally
      if (ext === "json") {
        const rows = await parseJsonFile(file);

        // If subject_id missing in JSON and schema requires it, infer from file name
        const normalizedRows = rows.map((row) => {
          const r = { ...row };
          if (requiredFields.includes("subject_id") && !r.subject_id) {
            r.subject_id = inferSubjectIdFromName(file.name) || `unknown_subject_${Date.now()}`;
          }
          if (jsonSchema?.properties?.timestamp && !r.timestamp) {
            r.timestamp = new Date().toISOString();
          }
          if (jsonSchema?.properties?.tags && !Array.isArray(r.tags)) {
            r.tags = [];
          }
          if (jsonSchema?.properties?.source && !r.source) {
            r.source = r.source || "upload";
          }
          // Add default 'analyzed' status for new imports
          r.analyzed = false;
          return r;
        });

        const missing = validateRowsAgainstSchema(normalizedRows);
        if (missing.length > 0) {
          toast({
            title: "Validation error",
            description: `Missing required fields in ${missing.length} row(s). First missing: row ${missing[0].index + 1}, field "${missing[0].field}".`,
            variant: "destructive",
          });
          setExtracted(null);
          return;
        }

        setExtracted(normalizedRows);
        toast({ title: "File parsed", description: `${normalizedRows.length} rows ready to import` });
        return;
      }

      // Handle TXT locally only for text schemas
      if (ext === "txt") {
        if (!hasTextFieldInSchema) {
          toast({
            title: "Unsupported for this import",
            description: "TXT files are only supported for Text Records (schemas with a 'text' field).",
            variant: "destructive",
          });
          setExtracted(null);
          return;
        }

        const rows = (await parseTxtFileForTextSchema(file)).map(r => ({ ...r, analyzed: false })); // Add analyzed status
        const missing = validateRowsAgainstSchema(rows);
        if (missing.length > 0) {
          toast({
            title: "Validation error",
            description: `Missing required fields in ${missing.length} row(s). First missing: row ${missing[0].index + 1}, field "${missing[0].field}".`,
            variant: "destructive",
          });
          setExtracted(null);
          return;
        }

        setExtracted(rows);
        toast({ title: "File parsed", description: `${rows.length} rows ready to import` });
        return;
      }

      // For supported extraction types (csv, pdf, images), use the integration
      const { file_url } = await UploadFile({ file });
      const { status, output, details } = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: jsonSchema
      });
      if (status !== "success" || !output) {
        // FIX: Provide a more user-friendly error message
        throw new Error(details || "The file could not be parsed. Please check the file format and try again.");
      } else {
        const rows = (Array.isArray(output) ? output : [output]).map(r => ({ ...r, analyzed: false })); // Add analyzed status
        const missing = validateRowsAgainstSchema(rows);
        if (missing.length > 0) {
          toast({
            title: "Validation error",
            description: `Missing required fields in ${missing.length} row(s). First missing: row ${missing[0].index + 1}, field "${missing[0].field}".`,
            variant: "destructive",
          });
          setExtracted(null);
          return;
        }
        setExtracted(rows);
        toast({ title: "File parsed", description: `${rows.length} rows ready to import` });
      }
    } catch (e) {
      // FIX: Use centralized error handler via toast for client-side errors
      toast({ title: "Parsing failed", description: e.message || "Unknown error during parsing", variant: "destructive" });
      setExtracted(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImport = async () => {
    if (!extracted || extracted.length === 0) return;
    setIsImporting(true);
    try {
      await onImport(extracted);
      
      toast({ 
        title: "Import successful! 🎉", 
        description: `${extracted.length} records imported. Use 'Intelligent Processing' to generate profiles and insights.`,
        variant: "success" 
      });
      
      setExtracted(null);
      setFile(null);
      
      // Trigger a refresh of the data viewer
      window.dispatchEvent(new CustomEvent('dataImported'));
    } catch (e) {
      // FIX: Use centralized error handler
      handleApiError(e, "Import failed.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="p-6">
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        <p className="text-[#a3a3a3]">{description}</p>
        <div className="grid md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-3">
            <Label className="text-[#a3a3a3]">File (CSV, JSON, PDF, Image, TXT)</Label>
            <Input
              type="file"
              accept=".csv,.json,.pdf,.png,.jpg,.jpeg,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="bg-[#111111] border-[#262626] text-white"
            />
          </div>
          <Button onClick={handleUpload} disabled={!file || isUploading} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            Parse File
          </Button>
        </div>

        {Array.isArray(extracted) && extracted.length > 0 && (
          <>
            <div className="text-sm text-[#a3a3a3] mt-4">Preview (first 10 rows)</div>
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-[#a3a3a3] border-b border-[#262626]">
                    {Object.keys(extracted[0]).map((key) => (
                      <th key={key} className="py-2 pr-4 font-medium">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {extracted.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-b border-[#1f1f1f]">
                      {Object.keys(extracted[0]).map((key) => (
                        <td key={key} className="py-2 pr-4 text-white">{String(row[key] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleImport} disabled={isImporting} className="bg-[#10b981] hover:bg-[#059669]">
                {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
                Import {extracted.length} rows
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function DataImportPage() {
  const crmSchema = {
    type: "object",
    properties: {
      subject_id: { type: "string" },
      email: { type: "string" },
      name: { type: "string" },
      source: { type: "string" },
      notes: { type: "string" },
      last_contacted_at: { type: "string" },
      lifecycle_stage: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      analyzed: { type: "boolean" }, // Add analyzed status
      created_date: { type: "string" }, // Add created_date for filtering
    },
    required: ["subject_id"]
  };
  const textSchema = {
    type: "object",
    properties: {
      subject_id: { type: "string" },
      source: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      text: { type: "string" },
      timestamp: { type: "string" },
      analyzed: { type: "boolean" }, // Add analyzed status
      created_date: { type: "string" }, // Add created_date for filtering
    },
    required: ["subject_id", "text", "timestamp"] // Added timestamp to required for txt parsing consistency
  };
  const employeeSchema = {
    type: "object",
    properties: {
      subject_id: { type: "string" },
      email: { type: "string" },
      name: { type: "string" },
      department: { type: "string" },
      role: { type: "string" },
      notes: { type: "string" },
      survey_responses: { type: "array", items: { type: "string" } },
      hired_at: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      analyzed: { type: "boolean" }, // Add analyzed status
      created_date: { type: "string" }, // Add created_date for filtering
    },
    required: ["subject_id"]
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
              <CheckCircle2 className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Data Intelligence Hub</h1>
          </div>
          <p className="text-[#a3a3a3] text-lg">
            Import, process, and transform data into psychographic insights automatically.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Import Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#00d4ff]" />
              Import & Process
            </h2>
            
            <Tabs defaultValue="crm" className="space-y-4">
              <TabsList className="bg-[#111111] border border-[#262626]">
                <TabsTrigger value="crm">CRM Records</TabsTrigger>
                <TabsTrigger value="text">Text Records</TabsTrigger>
                <TabsTrigger value="employee">Employee Records</TabsTrigger>
              </TabsList>

              <TabsContent value="crm">
                <Uploader
                  title="CRM Records"
                  description="Import contacts, notes, and lifecycle attributes."
                  jsonSchema={crmSchema}
                  onImport={async (rows) => {
                    // Assuming bulkCreate automatically adds created_date/updated_date and 'id'
                    const recordsWithDates = rows.map(r => ({
                      ...r,
                      created_date: r.created_date || new Date().toISOString(),
                      updated_date: r.updated_date || new Date().toISOString(),
                      analyzed: false // Ensure new records are marked as not analyzed
                    }));
                    await CRMRecord.bulkCreate(recordsWithDates);
                  }}
                />
              </TabsContent>

              <TabsContent value="text">
                <Uploader
                  title="Text Records"
                  description="Import text for NLP analysis and psychographic profiling."
                  jsonSchema={textSchema}
                  onImport={async (rows) => {
                    const recordsWithDates = rows.map(r => ({
                      ...r,
                      created_date: r.created_date || new Date().toISOString(),
                      updated_date: r.updated_date || new Date().toISOString(),
                      analyzed: false
                    }));
                    await ImportedTextRecord.bulkCreate(recordsWithDates);
                  }}
                />
              </TabsContent>

              <TabsContent value="employee">
                <Uploader
                  title="Employee Records"
                  description="Import employee details and survey responses."
                  jsonSchema={employeeSchema}
                  onImport={async (rows) => {
                    const recordsWithDates = rows.map(r => ({
                      ...r,
                      created_date: r.created_date || new Date().toISOString(),
                      updated_date: r.updated_date || new Date().toISOString(),
                      analyzed: false
                    }));
                    await EmployeeRecord.bulkCreate(recordsWithDates);
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Data Management Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
              Data Management
            </h2>

            <Tabs defaultValue="text" className="space-y-4">
              <TabsList className="bg-[#111111] border border-[#262626]">
                <TabsTrigger value="text">Text Data</TabsTrigger>
                <TabsTrigger value="crm">CRM Data</TabsTrigger>
                <TabsTrigger value="employee">Employee Data</TabsTrigger>
              </TabsList>

              <TabsContent value="text">
                <DataViewer 
                  entityType="ImportedTextRecord"
                  EntityClass={ImportedTextRecord}
                  title="Text Records"
                  icon={FileText}
                />
              </TabsContent>

              <TabsContent value="crm">
                <DataViewer 
                  entityType="CRMRecord"
                  EntityClass={CRMRecord}
                  title="CRM Records"
                  icon={Users}
                />
              </TabsContent>

              <TabsContent value="employee">
                <DataViewer 
                  entityType="EmployeeRecord"
                  EntityClass={EmployeeRecord}
                  title="Employee Records"
                  icon={Building}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Processing Pipeline Status */}
        <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-[#111111] to-[#0f0f0f] border border-[#262626]">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#fbbf24]" />
            Intelligent Processing Pipeline
          </h3>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg bg-[#141414]">
              <Database className="w-8 h-8 text-[#00d4ff] mx-auto mb-2" />
              <div className="text-sm font-medium text-white">Import Data</div>
              <div className="text-xs text-[#a3a3a3]">Structured & Unstructured</div>
            </div>
            <div className="p-3 rounded-lg bg-[#141414]">
              <Brain className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
              <div className="text-sm font-medium text-white">NLP Analysis</div>
              <div className="text-xs text-[#a3a3a3]">Extract Psychology</div>
            </div>
            <div className="p-3 rounded-lg bg-[#141414]">
              <Users className="w-8 h-8 text-[#8b5cf6] mx-auto mb-2" />
              <div className="text-sm font-medium text-white">Generate Profiles</div>
              <div className="text-xs text-[#a3a3a3]">Psychographic Insights</div>
            </div>
            <div className="p-3 rounded-lg bg-[#141414]">
              <Zap className="w-8 h-8 text-[#fbbf24] mx-auto mb-2" />
              <div className="text-sm font-medium text-white">Update System</div>
              <div className="text-xs text-[#a3a3a3]">Dashboard & Actions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
