
import React, { useState, useEffect, useCallback } from "react";
import { AudienceSegment } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Eye, Filter, Search, ChevronLeft, ChevronRight, Trash2, Edit, Sparkles, TrendingUp, Database, Target, Loader2, HelpCircle, Brain, List } from "lucide-react"; // Added Target, Loader2, HelpCircle, Brain, List
import FilterBuilder from "../components/audience/FilterBuilder";
import AudiencePreview from "../components/audience/AudiencePreview";
import SegmentList from "../components/audience/SegmentList";
import AISegmentSuggestions from "../components/audience/AISegmentSuggestions";
import PredictiveSegments from '../components/audience/PredictiveSegments';
import { CollaborationProvider } from '../components/collaboration/CollaborationProvider';
import PresenceIndicator from '../components/collaboration/PresenceIndicator';
import { handleApiError } from "../components/system/errorHandler";
import { toast } from "@/components/ui/use-toast";
import { applyAudienceSegment } from "@/api/functions";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // New imports for Tabs
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AudienceBuilderPage() { // Renamed from AudienceBuilder
  const [activeTab, setActiveTab] = useState("builder"); // "builder" | "saved" | "ai" | "predictive"
  const [segmentName, setSegmentName] = useState("");
  const [segmentDescription, setSegmentDescription] = useState("");
  const [filterConditions, setFilterConditions] = useState({
    operator: "AND",
    conditions: []
  });
  const [previewData, setPreviewData] = useState({ count: 0, sampleUsers: [] });
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [isGeneratingSegments, setIsGeneratingSegments] = useState(false); // New state for AI segment generation

  // Segments list state
  const [segments, setSegments] = useState([]);
  const [segmentsLoading, setSegmentsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const SEGMENTS_PER_PAGE = 10;

  // Confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [segmentToDelete, setSegmentToDelete] = useState(null);

  // showAISuggestions state removed, now managed by activeTab

  const loadSegments = useCallback(async (page = 1) => {
    setSegmentsLoading(true);
    const offset = (page - 1) * SEGMENTS_PER_PAGE;

    const filters = { status: "active" };
    if (searchTerm) filters.name = { "$ilike": `%${searchTerm}%` };

    try {
      // Fetch one more than SEGMENTS_PER_PAGE to determine if there's a next page
      const dataPlusOne = await AudienceSegment.filter(filters, '-updated_date', SEGMENTS_PER_PAGE + 1, offset);
      const pageData = dataPlusOne.slice(0, SEGMENTS_PER_PAGE);
      setSegments(pageData);
      setHasNextPage(dataPlusOne.length > SEGMENTS_PER_PAGE);
      setCurrentPage(page);
    } catch (error) {
      handleApiError(error, "Failed to load audience segments.");
      setSegments([]);
      setHasNextPage(false); // No next page if there's an error
    } finally {
      setSegmentsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    // Only load segments if the 'saved' tab is active
    if (activeTab === "saved") {
      const handler = setTimeout(() => {
        loadSegments(1);
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [searchTerm, activeTab, loadSegments]);

  const updatePreview = useCallback(async () => {
    if (filterConditions.conditions.length === 0) {
      setPreviewData({ count: 0, sampleUsers: [] });
      return;
    }

    setIsPreviewLoading(true);
    try {
      // Create a temporary segment for preview
      const tempSegment = {
        name: "preview",
        filter_conditions: filterConditions
      };

      // Use the backend function for consistent filtering logic
      const response = await applyAudienceSegment({
        segment: tempSegment,
        preview: true
      });

      if (response.data) {
        setPreviewData({
          count: response.data.count,
          sampleUsers: response.data.sampleUsers || []
        });
      }
    } catch (error) {
      console.error("Preview error:", error);
      setPreviewData({ count: 0, sampleUsers: [] });
    } finally {
      setIsPreviewLoading(false);
    }
  }, [filterConditions]);

  useEffect(() => {
    // Only update preview if builder tab is active
    if (activeTab === "builder") {
      const debounce = setTimeout(updatePreview, 500);
      return () => clearTimeout(debounce);
    }
  }, [updatePreview, activeTab]); // Added activeTab to dependency array

  const handleSaveSegment = async () => { // Renamed from handleSave
    if (!segmentName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your audience segment.",
        variant: "destructive"
      });
      return;
    }

    if (filterConditions.conditions.length === 0) {
      toast({
        title: "No Filters",
        description: "Please add at least one filter condition.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const segmentData = {
        name: segmentName,
        description: segmentDescription,
        filter_conditions: filterConditions,
        estimated_size: previewData.count,
        last_calculated: new Date().toISOString()
      };

      if (editingSegment) {
        await AudienceSegment.update(editingSegment.id, segmentData);
        toast({
          title: "Segment Updated",
          description: `"${segmentName}" has been updated successfully.`
        });
      } else {
        await AudienceSegment.create(segmentData);
        toast({
          title: "Segment Saved",
          description: `"${segmentName}" has been saved successfully.`
        });
      }

      // Reset form
      setSegmentName("");
      setSegmentDescription("");
      setFilterConditions({ operator: "AND", conditions: [] });
      setEditingSegment(null);

      // Refresh segments list if on that tab
      if (activeTab === "saved") { // Changed from "segments" to "saved"
        loadSegments(currentPage);
      }
    } catch (error) {
      handleApiError(error, "Failed to save audience segment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyAISegment = (segment) => {
    setSegmentName(segment.name);
    setSegmentDescription(segment.description);
    setFilterConditions(segment.filter_conditions);
    setActiveTab('builder'); // Ensure it switches to the builder tab
    toast({
      title: 'Segment Applied',
      description: `"${segment.name}" has been loaded. Review and save when ready.`
    });
  };

  const handleEditSegment = (segment) => {
    setSegmentName(segment.name);
    setSegmentDescription(segment.description || "");
    setFilterConditions(segment.filter_conditions);
    setEditingSegment(segment);
    setActiveTab("builder");
  };

  const handleDeleteSegment = (segment) => {
    setSegmentToDelete(segment);
    setShowDeleteDialog(true);
  };

  const confirmDeleteSegment = async () => {
    if (!segmentToDelete) return;

    try {
      await AudienceSegment.update(segmentToDelete.id, { status: "archived" });
      toast({
        title: "Segment Deleted",
        description: `"${segmentToDelete.name}" has been deleted.`
      });
      loadSegments(currentPage);
    } catch (error) {
      handleApiError(error, "Failed to delete segment.");
    } finally {
      setSegmentToDelete(null);
      setShowDeleteDialog(false); // Close dialog after action
    }
  };

  const handleGenerateSegments = async () => {
    setIsGeneratingSegments(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast({
      title: "AI Segments Generated",
      description: "AI-powered segment suggestions are now available in the 'AI Suggestions' tab."
    });
    setActiveTab("ai"); // Switch to the AI suggestions tab
    setIsGeneratingSegments(false);
  };


  return (
    <CollaborationProvider>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
                  <Target className="w-6 h-6 text-[#0a0a0a]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                      Audience Builder
                    </h1>
                    <Link to={`${createPageUrl('Documentation')}#audience-builder`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-[#6b7280] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10"
                        title="View audience builder documentation"
                      >
                        <HelpCircle className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                  <p className="text-[#a3a3a3] text-lg">
                    Create psychographic audience segments with advanced AI assistance
                  </p>
                  {/* Collaboration Presence - kept as per original file structure, adjusted position for new header layout */}
                  <div className="mt-3">
                    <PresenceIndicator />
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSaveSegment}
                disabled={isSaving || !segmentName}
                className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Segment
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-[#111111] border border-[#262626]">
              <TabsTrigger
                value="builder"
                className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] data-[state=active]:font-semibold"
                data-tour="filter-builder"
              >
                <Filter className="w-4 h-4 mr-2" />
                Segment Builder
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] data-[state=active]:font-semibold"
                data-tour="ai-suggestions"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Suggestions
              </TabsTrigger>
              <TabsTrigger
                value="predictive"
                className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] data-[state=active]:font-semibold"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Predictive Analysis
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a] data-[state=active]:font-semibold"
              >
                <List className="w-4 h-4 mr-2" />
                Saved Segments ({segments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-6">
              {/* AI Suggestions Panel */}
              <Card className="bg-[#111111] border-[#8b5cf6]/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#fbbf24]" />
                    <span className="text-white">AI-Powered Segment Suggestions</span>
                  </CardTitle>
                  <p className="text-[#e5e5e5] text-sm">
                    Start with proven segments or let AI analyze your users to suggest custom opportunities
                  </p>
                </CardHeader>
                <CardContent className="text-white">
                  <Button
                    onClick={handleGenerateSegments}
                    disabled={isGeneratingSegments}
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold"
                  >
                    {isGeneratingSegments ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Custom Segments...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Generate Custom Segments
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Filter Builder */}
                <div className="lg:col-span-2" data-tour="filter-builder">
                  <Card className="bg-[#111111] border-[#262626] mb-6">
                    <CardHeader>
                      <CardTitle className="text-white">Segment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-white">
                      <Input
                        placeholder="Enter segment name..."
                        value={segmentName}
                        onChange={(e) => setSegmentName(e.target.value)}
                        className="bg-[#1a1a1a] border-[#262626] text-white placeholder:text-[#6b7280]"
                        data-tour="segment-name-input" />
                      <Textarea
                        placeholder="Optional description..."
                        value={segmentDescription}
                        onChange={(e) => setSegmentDescription(e.target.value)}
                        className="bg-[#1a1a1a] border-[#262626] text-white placeholder:text-[#6b7280] h-20"
                        data-tour="segment-description-input" />
                    </CardContent>
                  </Card>

                  <FilterBuilder
                    conditions={filterConditions}
                    onChange={setFilterConditions} />
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-1" data-tour="audience-preview">
                  <AudiencePreview
                    data={previewData}
                    isLoading={isPreviewLoading}
                    isSaving={isSaving}
                    hasConditions={filterConditions.conditions.length > 0}
                    segmentName={segmentName}
                    editingSegment={editingSegment} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai">
              <AISegmentSuggestions onApplySegment={handleApplyAISegment} />
            </TabsContent>

            <TabsContent value="predictive" className="space-y-6">
              <PredictiveSegments />
            </TabsContent>

            <TabsContent value="saved">
              <div data-tour="segments-list">
                {/* Search */}
                <div className="mb-6">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                    <Input
                      placeholder="Search segments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-[#111111] border-[#262626] text-white" />
                  </div>
                </div>

                {/* Segments List */}
                <SegmentList
                  segments={segments}
                  isLoading={segmentsLoading}
                  onEdit={handleEditSegment}
                  onDelete={handleDeleteSegment} />


                {/* Pagination */}
                {segments.length > 0 &&
                  <div className="flex items-center justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={() => loadSegments(currentPage - 1)}
                      disabled={currentPage === 1 || segmentsLoading}
                      className="bg-[#111111] border-[#262626] text-white">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <span className="text-sm text-[#a3a3a3]">
                      Page {currentPage}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => loadSegments(currentPage + 1)}
                      disabled={!hasNextPage || segmentsLoading}
                      className="bg-[#111111] border-[#262626] text-white">
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                }
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Audience Segment"
          description={`Are you sure you want to delete "${segmentToDelete?.name}"? This will remove the segment and all associated targeting rules.`}
          confirmText="Delete Segment"
          cancelText="Keep Segment"
          onConfirm={confirmDeleteSegment}
          variant="destructive"
        />
      </div>
    </CollaborationProvider>
  );
}
