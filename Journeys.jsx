import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Journey } from "@/api/entities";
import { JourneyVersion } from "@/api/entities";
import { JourneyTask } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, Play, CheckCircle2, Clock, Menu, X, Zap, Settings, Target, Timer, ChevronLeft, ChevronRight, List, Sliders, FileText, Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { runJourneys } from "@/api/functions";
import JourneyTestDialog from "@/components/journeys/JourneyTestDialog";

// Journey Templates
const JOURNEY_TEMPLATES = {
  welcome_flow: {
    name: "Welcome Flow",
    description: "Onboard new users with personalized messaging",
    nodes: [
      { id: 'start', type: 'trigger', x: 100, y: 200, data: { trigger_type: 'event', event_type: 'user_signup', title: 'User Signs Up' } },
      { id: 'condition1', type: 'condition', x: 300, y: 150, data: { type: 'profile', field: 'personality_traits.openness', operator: 'greater_than', value: '0.7', title: 'High Openness?' } },
      { id: 'action1', type: 'action', x: 500, y: 100, data: { type: 'engagement', title: 'Advanced Welcome', message: 'Welcome! Ready to explore all features?' } },
      { id: 'action2', type: 'action', x: 500, y: 250, data: { type: 'engagement', title: 'Simple Welcome', message: 'Welcome! Let\'s start with the basics.' } },
      { id: 'wait1', type: 'wait', x: 700, y: 175, data: { delay_seconds: 86400, title: 'Wait 1 Day' } },
      { id: 'goal1', type: 'goal', x: 900, y: 175, data: { event_type: 'feature_used', title: 'Feature Engagement' } }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'condition1', label: '' },
      { id: 'e2', source: 'condition1', target: 'action1', label: 'true' },
      { id: 'e3', source: 'condition1', target: 'action2', label: 'false' },
      { id: 'e4', source: 'action1', target: 'wait1', label: '' },
      { id: 'e5', source: 'action2', target: 'wait1', label: '' },
      { id: 'e6', source: 'wait1', target: 'goal1', label: '' }
    ]
  },
  reengagement_flow: {
    name: "Re-engagement Flow",
    description: "Bring back inactive users based on their motivation",
    nodes: [
      { id: 'start', type: 'trigger', x: 100, y: 200, data: { trigger_type: 'behavior', event_type: 'inactivity_7_days', title: 'User Inactive 7 Days' } },
      { id: 'condition1', type: 'condition', x: 300, y: 150, data: { type: 'motive', field: 'motivation_stack', operator: 'contains', value: 'achievement', title: 'Achievement Motivated?' } },
      { id: 'action1', type: 'action', x: 500, y: 100, data: { type: 'email', title: 'Achievement Email', message: 'You\'re so close to your goals! Come back and crush them.' } },
      { id: 'action2', type: 'action', x: 500, y: 250, data: { type: 'email', title: 'Social Email', message: 'Your community misses you! See what others are achieving.' } },
      { id: 'wait1', type: 'wait', x: 700, y: 175, data: { delay_seconds: 259200, title: 'Wait 3 Days' } },
      { id: 'goal1', type: 'goal', x: 900, y: 175, data: { event_type: 'user_return', title: 'User Returns' } }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'condition1', label: '' },
      { id: 'e2', source: 'condition1', target: 'action1', label: 'true' },
      { id: 'e3', source: 'condition1', target: 'action2', label: 'false' },
      { id: 'e4', source: 'action1', target: 'wait1', label: '' },
      { id: 'e5', source: 'action2', target: 'wait1', label: '' },
      { id: 'e6', source: 'wait1', target: 'goal1', label: '' }
    ]
  },
  conversion_flow: {
    name: "Conversion Flow",
    description: "Convert trial users to paid based on risk profile",
    nodes: [
      { id: 'start', type: 'trigger', x: 100, y: 200, data: { trigger_type: 'event', event_type: 'trial_day_5', title: 'Trial Day 5' } },
      { id: 'condition1', type: 'condition', x: 300, y: 150, data: { type: 'profile', field: 'risk_profile', operator: 'equals', value: 'conservative', title: 'Conservative User?' } },
      { id: 'action1', type: 'action', x: 500, y: 100, data: { type: 'engagement', title: 'Security Focus', message: 'Join thousands of satisfied customers. Risk-free guarantee!' } },
      { id: 'action2', type: 'action', x: 500, y: 250, data: { type: 'engagement', title: 'Innovation Focus', message: 'Don\'t miss out! Be among the first to access new features.' } },
      { id: 'goal1', type: 'goal', x: 700, y: 175, data: { event_type: 'subscription_created', title: 'Subscription Created' } }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'condition1', label: '' },
      { id: 'e2', source: 'condition1', target: 'action1', label: 'true' },
      { id: 'e3', source: 'condition1', target: 'action2', label: 'false' },
      { id: 'e4', source: 'action1', target: 'goal1', label: '' },
      { id: 'e5', source: 'action2', target: 'goal1', label: '' }
    ]
  }
};

// Node component with working drag functionality
function JourneyNode({ node, isSelected, onSelect, onMove, isConnecting, onStartConnection, onEndConnection, zoom }) {
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startNodeX = node.x;
    const startNodeY = node.y;
    
    setIsDragging(true);

    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) / zoom;
      const deltaY = (moveEvent.clientY - startY) / zoom;
      
      onMove(node.id, startNodeX + deltaX, startNodeY + deltaY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [node.id, node.x, node.y, onMove, zoom]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onSelect(node.id);
  }, [node.id, onSelect]);

  const handleConnectionPoint = useCallback((e) => {
    e.stopPropagation();
    if (isConnecting) {
      onEndConnection(node.id);
    } else {
      onStartConnection(node.id);
    }
  }, [isConnecting, node.id, onStartConnection, onEndConnection]);

  // Node type styling
  const getNodeStyle = () => {
    switch (node.type) {
      case 'trigger':
        return { bg: 'from-[#10b981] to-[#059669]', icon: Zap };
      case 'condition':
        return { bg: 'from-[#f59e0b] to-[#d97706]', icon: Settings };
      case 'action':
        return { bg: 'from-[#3b82f6] to-[#2563eb]', icon: Zap };
      case 'wait':
        return { bg: 'from-[#8b5cf6] to-[#7c3aed]', icon: Timer };
      case 'goal':
        return { bg: 'from-[#ef4444] to-[#dc2626]', icon: Target };
      default:
        return { bg: 'from-[#6b7280] to-[#4b5563]', icon: Settings };
    }
  };

  const nodeStyle = getNodeStyle();
  const Icon = nodeStyle.icon;

  return (
    <div
      ref={nodeRef}
      className={`absolute cursor-move select-none transition-all duration-200 ${
        isSelected ? 'z-50' : 'z-40'
      } ${isDragging ? 'z-[60] scale-105' : ''}`}
      style={{
        left: node.x,
        top: node.y,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)'
      }}
    >
      {/* Connection Points */}
      <div
        className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-[#374151] border-2 border-[#6b7280] rounded-full cursor-pointer hover:bg-[#4b5563] transition-colors z-[70]"
        onClick={handleConnectionPoint}
      />
      <div
        className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-[#374151] border-2 border-[#6b7280] rounded-full cursor-pointer hover:bg-[#4b5563] transition-colors z-[70]"
        onClick={handleConnectionPoint}
      />

      {/* Node Body */}
      <div
        className={`bg-[#2a2a3a] border-2 rounded-lg shadow-lg min-w-[160px] ${
          isSelected ? 'border-[#00d4ff] shadow-[#00d4ff]/20' : 'border-[#4a4a5a]'
        } ${isDragging ? 'shadow-2xl' : 'hover:shadow-xl hover:border-[#6a6a7a]'}`}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className={`px-3 py-2 bg-gradient-to-r ${nodeStyle.bg} rounded-t-lg flex items-center gap-2`}>
          <Icon className="w-4 h-4 text-white" />
          <span className="text-xs font-semibold text-white capitalize">{node.type}</span>
        </div>

        {/* Content */}
        <div className="px-3 py-2 space-y-1">
          <div className="text-xs font-medium text-white truncate">
            {node.data?.title || node.data?.name || `${node.type} node`}
          </div>
          <div className="text-xs text-[#9ca3af] truncate">
            {node.type === 'trigger' && `${node.data?.trigger_type || 'event'}`}
            {node.type === 'condition' && `${node.data?.field || 'field'}`}
            {node.type === 'action' && `${node.data?.type || 'engagement'}`}
            {node.type === 'wait' && `${node.data?.delay_seconds ? `${Math.floor(node.data.delay_seconds / 86400)}d ${Math.floor((node.data.delay_seconds % 86400) / 3600)}h` : '0s'}`}
            {node.type === 'goal' && `${node.data?.event_type || 'conversion'}`}
          </div>
        </div>
      </div>
    </div>
  );
}

// Connection lines with proper z-index
function ConnectionLines({ nodes, edges }) {
  const nodeMap = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);

  return (
    <svg 
      className="absolute inset-0 pointer-events-none overflow-visible" 
      style={{ zIndex: 30 }}
      width="100%" 
      height="100%"
    >
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" markerUnits="strokeWidth">
          <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
        </marker>
      </defs>
      {edges.map(edge => {
        const sourceNode = nodeMap[edge.source];
        const targetNode = nodeMap[edge.target];
        
        if (!sourceNode || !targetNode) return null;
        
        // Assuming node width is 160px for source connection point and target connection point
        const sourceX = sourceNode.x + 160; 
        const sourceY = sourceNode.y + 30; // 30 is roughly half node height
        const targetX = targetNode.x;
        const targetY = targetNode.y + 30; // 30 is roughly half node height
        
        const dx = targetX - sourceX;
        const controlX1 = sourceX + Math.max(50, Math.abs(dx) * 0.5);
        const controlX2 = targetX - Math.max(50, Math.abs(dx) * 0.5);
        
        const pathD = `M ${sourceX} ${sourceY} C ${controlX1} ${sourceY}, ${controlX2} ${targetY}, ${targetX} ${targetY}`;
        
        return (
          <g key={edge.id} style={{ zIndex: 30 }}>
            <path
              d={pathD}
              stroke="#9ca3af"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
              className="hover:stroke-[#00d4ff] transition-colors"
              style={{ zIndex: 30 }}
            />
            {edge.label && (
              <text
                x={(sourceX + targetX) / 2}
                y={(sourceY + targetY) / 2 - 10}
                fill="#9ca3af"
                fontSize="10"
                textAnchor="middle"
                className="pointer-events-none"
              >
                {edge.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function JourneysPage() {
  const { toast } = useToast();
  const [journeys, setJourneys] = useState([]);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);

  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);

  useEffect(() => {
    const loadJourneys = async () => {
      try {
        const js = await Journey.list('-updated_date', 50);
        setJourneys(js);
        if (js[0]) {
          setSelectedJourney(js[0]);
        }
      } catch (error) {
        console.error('Failed to load journeys:', error);
      }
    };
    loadJourneys();
  }, []);

  useEffect(() => {
    const loadVersions = async () => {
      if (!selectedJourney) return;
      try {
        const vs = await JourneyVersion.filter({ journey_id: selectedJourney.id }, '-version', 50);
        setVersions(vs);
        const pub = vs.find(v => v.status === 'published') || vs[0];
        if (pub?.schema) {
          setCurrentVersion(pub);
          setNodes(pub.schema.nodes || []);
          setEdges(pub.schema.edges || []);
        } else {
          setNodes([]);
          setEdges([]);
          setCurrentVersion(null);
        }
      } catch (error) {
        console.error('Failed to load versions:', error);
      }
    };
    loadVersions();
  }, [selectedJourney]);

  // Zoom and pan handlers
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleCanvasMouseDown = useCallback((e) => {
    // Only start panning if the click is directly on the canvas background, not on a node or other element
    if (e.target !== canvasRef.current) return;
    
    setIsPanning(true);
    setLastPanPoint({ x: e.clientX, y: e.clientY });
    setSelectedNodeId(null); // Deselect any node when clicking on canvas
    
    // Also reset connection state if clicking on canvas
    if (isConnecting) {
      setIsConnecting(false);
      setConnectingFrom(null);
    }
  }, [isConnecting]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (!isPanning) return;
    
    const dx = e.clientX - lastPanPoint.x;
    const dy = e.clientY - lastPanPoint.y;
    
    setPanOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  }, [isPanning, lastPanPoint]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault(); // Prevent page scrolling
    const scaleFactor = 1.1; // Adjust this value for zoom sensitivity
    const delta = e.deltaY < 0 ? scaleFactor : 1 / scaleFactor;
    
    setZoom(prev => {
      const newZoom = Math.max(0.3, Math.min(3, prev * delta)); // Clamp zoom between 0.3 and 3
      return newZoom;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      // Attach mouseup to document to handle cases where mouse is released outside canvas
      document.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [handleWheel, handleCanvasMouseUp]);

  const loadTemplate = useCallback((templateKey) => {
    const template = JOURNEY_TEMPLATES[templateKey];
    if (template) {
      setNodes(template.nodes);
      setEdges(template.edges);
      setShowTemplates(false);
      // Reset view when loading a template
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
      toast({ title: "Template loaded", description: `${template.name} template loaded successfully.` });
    }
  }, [toast]);

  const addNode = useCallback((type) => {
    const id = `${type}_${Date.now()}`;
    
    // Calculate position based on current viewport and existing nodes
    setNodes(prevNodes => {
      const nodeCount = prevNodes.length;
      const newNode = {
        id,
        type,
        x: (300 - panOffset.x) / zoom + nodeCount * 200,
        y: (200 - panOffset.y) / zoom + Math.floor(nodeCount / 3) * 120,
        data: {}
      };

      switch (type) {
        case 'trigger':
          newNode.data = { trigger_type: 'event', event_type: 'page_view', title: 'Journey Start' };
          break;
        case 'condition':
          newNode.data = { type: 'profile', field: 'risk_profile', operator: 'equals', value: 'moderate', title: 'Condition' };
          break;
        case 'action':
          newNode.data = { type: 'engagement', title: 'Send Message', message: 'Hello from Journey!' };
          break;
        case 'wait':
          newNode.data = { delay_seconds: 3600, title: 'Wait 1 Hour' };
          break;
        case 'goal':
          newNode.data = { event_type: 'conversion', title: 'Goal Reached' };
          break;
      }

      return [...prevNodes, newNode];
    });
  }, [zoom, panOffset]);

  const moveNode = useCallback((id, x, y) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  }, []);

  const selectNode = useCallback((id) => {
    setSelectedNodeId(id);
  }, []);

  const startConnection = useCallback((nodeId) => {
    setIsConnecting(true);
    setConnectingFrom(nodeId);
  }, []);

  const endConnection = useCallback((nodeId) => {
    if (isConnecting && connectingFrom && connectingFrom !== nodeId) {
      const newEdge = {
        id: `edge_${Date.now()}`,
        source: connectingFrom,
        target: nodeId,
        label: ''
      };
      setEdges(prev => [...prev, newEdge]);
    }
    setIsConnecting(false);
    setConnectingFrom(null);
  }, [isConnecting, connectingFrom]);

  const saveDraft = async () => {
    if (!selectedJourney) return;
    try {
      const existing = await JourneyVersion.filter({ journey_id: selectedJourney.id }, '-version', 1);
      const nextVersion = (existing[0]?.version || 0) + 1;
      const schema = { journey_id: selectedJourney.id, nodes, edges };
      await JourneyVersion.create({ journey_id: selectedJourney.id, version: nextVersion, status: 'draft', schema });
      const vs = await JourneyVersion.filter({ journey_id: selectedJourney.id }, '-version', 50);
      setVersions(vs);
      toast({ title: "Draft saved", description: `v${nextVersion} created.` });
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast({ title: "Error", description: "Failed to save draft.", variant: "destructive" });
    }
  };

  const publishVersion = async (version) => {
    if (!selectedJourney) return;
    try {
      const all = await JourneyVersion.filter({ journey_id: selectedJourney.id }, null, 200);
      for (const v of all) {
        if (v.status === 'published') {
          await JourneyVersion.update(v.id, { status: 'archived' });
        }
      }
      await JourneyVersion.update(version.id, { status: 'published', published_at: new Date().toISOString() });
      await Journey.update(selectedJourney.id, { published_version: version.version });
      setCurrentVersion(version);
      toast({ title: "Published", description: `Journey v${version.version} is now live.` });
    } catch (error) {
      console.error('Failed to publish version:', error);
      toast({ title: "Error", description: "Failed to publish version.", variant: "destructive" });
    }
  };

  const newJourney = async () => {
    const name = prompt("Journey name?");
    if (!name) return;
    try {
      const j = await Journey.create({ name, description: "" });
      const js = await Journey.list('-updated_date', 50);
      setJourneys(js);
      setSelectedJourney(js.find(x => x.id === j.id) || js[0]);
    } catch (error) {
      console.error('Failed to create journey:', error);
      toast({ title: "Error", description: "Failed to create journey.", variant: "destructive" });
    }
  };

  const updateSelectedNodeField = (field, value) => {
    setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, data: { ...n.data, [field]: value } } : n));
  };

  const handleTestRun = async (userId, type) => {
    try {
      await runJourneys({ user_id: userId, event: { user_id: userId, event_type: type, timestamp: new Date().toISOString() } });
      toast({ title: "Journey executed", description: `Interpreter ran for ${type} event.` });
    } catch (error) {
      console.error('Failed to run journey:', error);
      toast({ title: "Error", description: "Failed to execute journey.", variant: "destructive" });
    }
  };

  const processDue = async () => {
    try {
      await runJourneys({ process_due: true });
      toast({ title: "Processed", description: "Due Journey waits processed." });
    } catch (error) {
      console.error('Failed to process due tasks:', error);
      toast({ title: "Error", description: "Failed to process due tasks.", variant: "destructive" });
    }
  };

  return (
    <div className="h-screen bg-[#000000] text-white flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-[#1a1a1a] border-b border-[#333] px-4 py-3 flex items-center justify-between z-[100] flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white">Journeys</h1>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setShowTemplates(true)} className="bg-transparent border-[#555] text-white hover:bg-[#333]">
              <FileText className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Templates</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => addNode('trigger')} className="bg-transparent border-[#555] text-white hover:bg-[#333]">
              <Zap className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Trigger</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => addNode('condition')} className="bg-transparent border-[#555] text-white hover:bg-[#333]">
              <Settings className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Condition</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => addNode('action')} className="bg-transparent border-[#555] text-white hover:bg-[#333]">
              <Zap className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Action</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => addNode('wait')} className="bg-transparent border-[#555] text-white hover:bg-[#333]">
              <Timer className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Wait</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => addNode('goal')} className="bg-transparent border-[#555] text-white hover:bg-[#333]">
              <Target className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Goal</span>
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="ghost" onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden text-white hover:bg-[#333]">
            <List className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowProperties(!showProperties)} className="text-white hover:bg-[#333]">
            <Sliders className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowTestDialog(true)} className="bg-transparent border-[#555] text-white hover:bg-[#333]">
            <Play className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Test</span>
          </Button>
          <Button size="sm" variant="outline" onClick={processDue} className="bg-transparent border-[#555] text-white hover:bg-[#333]">
            <Clock className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Process Due</span>
          </Button>
          <Button size="sm" onClick={saveDraft} className="bg-[#10b981] hover:bg-[#059669] text-white">
            <Save className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Save Draft</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Minimal and collapsible */}
        {showSidebar && (
          <div className="absolute lg:relative left-0 top-0 h-full w-64 bg-[#1a1a1a] border-r border-[#333] flex flex-col z-[90] lg:z-10">
            <div className="p-3 border-b border-[#333] flex items-center justify-between">
              <h2 className="font-semibold text-white text-sm">Journey List</h2>
              <div className="flex items-center gap-1">
                <Button onClick={newJourney} size="sm" className="bg-[#00d4ff] text-[#0a0a0a] hover:bg-[#0ea5e9] h-7">
                  <Plus className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowSidebar(false)} className="lg:hidden text-white hover:bg-[#333] h-7">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto">
              <div className="space-y-2">
                {journeys.map(j => (
                  <button
                    key={j.id}
                    onClick={() => setSelectedJourney(j)}
                    className={`w-full text-left p-2 rounded border transition-colors text-sm ${
                      selectedJourney?.id === j.id 
                        ? 'border-[#00d4ff] bg-[#00d4ff]/10' 
                        : 'border-[#555] hover:bg-[#333]'
                    }`}
                  >
                    <div className="font-medium text-white truncate">{j.name}</div>
                    <div className="text-xs text-[#9ca3af]">v{j.published_version || '-'}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 relative" style={{ zIndex: 1 }}>
          <div
            ref={canvasRef}
            className="absolute inset-0 bg-[#000000]"
            style={{
              backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
              zIndex: 1,
              cursor: isPanning ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp} // Stop panning if mouse leaves canvas
          >
            <div
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                width: '100%',
                height: '100%',
                position: 'relative'
              }}
            >
              <ConnectionLines nodes={nodes} edges={edges} />
              
              {nodes.map(node => (
                <JourneyNode
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  onSelect={selectNode}
                  onMove={moveNode}
                  isConnecting={isConnecting}
                  onStartConnection={startConnection}
                  onEndConnection={endConnection}
                  zoom={zoom} // Pass zoom to node for drag calculations
                />
              ))}
            </div>
            
            {isConnecting && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#00d4ff] text-[#0a0a0a] px-3 py-2 rounded font-semibold z-[100] text-sm">
                Click on a node to connect
              </div>
            )}
          </div>

          {/* Floating Zoom Controls */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-[100]">
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomIn}
              className="bg-[#1a1a1a] border-[#555] text-white hover:bg-[#333] w-10 h-10 p-0"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomOut}
              className="bg-[#1a1a1a] border-[#555] text-white hover:bg-[#333] w-10 h-10 p-0"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomReset}
              className="bg-[#1a1a1a] border-[#555] text-white hover:bg-[#333] w-10 h-10 p-0"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <div className="text-xs text-[#9ca3af] text-center mt-1">
              {Math.round(zoom * 100)}%
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        {showProperties && (
          <div className="absolute lg:relative right-0 top-0 h-full w-80 bg-[#1a1a1a] border-l border-[#333] p-4 z-[90] lg:z-10 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Properties</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowProperties(false)}
                className="text-[#9ca3af] hover:text-white hover:bg-[#333]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {selectedNodeId ? (
              <div className="space-y-4">
                <div className="text-sm font-medium text-[#9ca3af] mb-4">
                  Selected: {nodes.find(n => n.id === selectedNodeId)?.type}
                </div>
                
                {(() => {
                  const node = nodes.find(n => n.id === selectedNodeId);
                  if (!node) return null;

                  if (node.type === 'trigger') {
                    return (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-[#9ca3af] block mb-1">Title</label>
                          <Input
                            className="bg-[#333] border-[#555] text-white"
                            value={node.data?.title || ''}
                            onChange={(e) => updateSelectedNodeField('title', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-[#9ca3af] block mb-1">Trigger Type</label>
                          <Select value={node.data?.trigger_type || 'event'} onValueChange={(v) => updateSelectedNodeField('trigger_type', v)}>
                            <SelectTrigger className="bg-[#333] border-[#555] text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="event">Event</SelectItem>
                              <SelectItem value="behavior">Behavior Pattern</SelectItem>
                              <SelectItem value="profile_change">Profile Change</SelectItem>
                              <SelectItem value="time_based">Time Based</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {(node.data?.trigger_type || 'event') === 'event' && (
                          <div>
                            <label className="text-sm text-[#9ca3af] block mb-1">Event Type</label>
                            <Select value={node.data?.event_type || 'page_view'} onValueChange={(v) => updateSelectedNodeField('event_type', v)}>
                              <SelectTrigger className="bg-[#333] border-[#555] text-white">
                                <SelectValue />
                              </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="page_view">Page View</SelectItem>
                                <SelectItem value="user_signup">User Signup</SelectItem>
                                <SelectItem value="purchase">Purchase</SelectItem>
                                <SelectItem value="trial_started">Trial Started</SelectItem>
                                <SelectItem value="trial_day_5">Trial Day 5</SelectItem>
                                <SelectItem value="feature_used">Feature Used</SelectItem>
                                <SelectItem value="inactivity_7_days">Inactive 7 Days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (node.type === 'condition') {
                    return (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-[#9ca3af] block mb-1">Title</label>
                          <Input
                            className="bg-[#333] border-[#555] text-white"
                            value={node.data?.title || ''}
                            onChange={(e) => updateSelectedNodeField('title', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-[#9ca3af] block mb-1">Condition Type</label>
                          <Select value={node.data?.type || 'profile'} onValueChange={(v) => updateSelectedNodeField('type', v)}>
                            <SelectTrigger className="bg-[#333] border-[#555] text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="profile">Profile Field</SelectItem>
                              <SelectItem value="motive">Motivation</SelectItem>
                              <SelectItem value="behavior">Recent Behavior</SelectItem>
                              <SelectItem value="demographic">Demographics</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm text-[#9ca3af] block mb-1">Field</label>
                          <Select value={node.data?.field || 'risk_profile'} onValueChange={(v) => updateSelectedNodeField('field', v)}>
                            <SelectTrigger className="bg-[#333] border-[#555] text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="risk_profile">Risk Profile</SelectItem>
                              <SelectItem value="cognitive_style">Cognitive Style</SelectItem>
                              <SelectItem value="personality_traits.openness">Openness</SelectItem>
                              <SelectItem value="personality_traits.conscientiousness">Conscientiousness</SelectItem>
                              <SelectItem value="emotional_state.mood">Emotional Mood</SelectItem>
                              <SelectItem value="motivation_stack">Motivation Stack</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm text-[#9ca3af] block mb-1">Operator</label>
                          <Select value={node.data?.operator || 'equals'} onValueChange={(v) => updateSelectedNodeField('operator', v)}>
                            <SelectTrigger className="bg-[#333] border-[#555] text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="not_equals">Not Equals</SelectItem>
                              <SelectItem value="greater_than">Greater Than</SelectItem>
                              <SelectItem value="less_than">Less Than</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="not_contains">Not Contains</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm text-[#9ca3af] block mb-1">Value</label>
                          <Input
                            className="bg-[#333] border-[#555] text-white"
                            placeholder="e.g., conservative, achievement"
                            value={node.data?.value || ''}
                            onChange={(e) => updateSelectedNodeField('value', e.target.value)}
                          />
                        </div>
                      </div>
                    );
                  }

                  if (node.type === 'action') {
                    return (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-[#9ca3af] block mb-1">Title</label>
                          <Input
                            className="bg-[#333] border-[#555] text-white"
                            value={node.data?.title || ''}
                            onChange={(e) => updateSelectedNodeField('title', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-[#9ca3af] block mb-1">Action Type</label>
                          <Select value={node.data?.type || 'engagement'} onValueChange={(v) => updateSelectedNodeField('type', v)}>
                            <SelectTrigger className="bg-[#333] border-[#555] text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="engagement">In-App Message</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                              <SelectItem value="push">Push Notification</SelectItem>
                              <SelectItem value="webhook">Webhook</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm text-[#9ca3af] block mb-1">Message</label>
                          <Textarea
                            className="bg-[#333] border-[#555] text-white"
                            value={node.data?.message || ''}
                            onChange={(e) => updateSelectedNodeField('message', e.target.value)}
                          />
                        </div>
                      </div>
                    );
                  }

                  if (node.type === 'wait') {
                    return (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-[#9ca3af] block mb-1">Title</label>
                          <Input
                            className="bg-[#333] border-[#555] text-white"
                            value={node.data?.title || ''}
                            onChange={(e) => updateSelectedNodeField('title', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-[#9ca3af] block mb-1">Wait Duration</label>
                          <Select value={String(node.data?.delay_seconds || 3600)} onValueChange={(v) => updateSelectedNodeField('delay_seconds', parseInt(v))}>
                            <SelectTrigger className="bg-[#333] border-[#555] text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="300">5 minutes</SelectItem>
                              <SelectItem value="1800">30 minutes</SelectItem>
                              <SelectItem value="3600">1 hour</SelectItem>
                              <SelectItem value="21600">6 hours</SelectItem>
                              <SelectItem value="86400">1 day</SelectItem>
                              <SelectItem value="259200">3 days</SelectItem>
                              <SelectItem value="604800">1 week</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  }

                  if (node.type === 'goal') {
                    return (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-[#9ca3af] block mb-1">Title</label>
                          <Input
                            className="bg-[#333] border-[#555] text-white"
                            value={node.data?.title || ''}
                            onChange={(e) => updateSelectedNodeField('title', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-[#9ca3af] block mb-1">Goal Event</label>
                          <Select value={node.data?.event_type || 'conversion'} onValueChange={(v) => updateSelectedNodeField('event_type', v)}>
                            <SelectTrigger className="bg-[#333] border-[#555] text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conversion">Conversion</SelectItem>
                              <SelectItem value="purchase">Purchase</SelectItem>
                              <SelectItem value="subscription_created">Subscription Created</SelectItem>
                              <SelectItem value="feature_adopted">Feature Adopted</SelectItem>
                              <SelectItem value="user_return">User Returns</SelectItem>
                              <SelectItem value="engagement_increase">Engagement Increase</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  }

                  return <div className="text-sm text-[#9ca3af]">Select fields will appear here</div>;
                })()}
              </div>
            ) : (
              <div className="text-sm text-[#9ca3af]">Select a node to edit properties</div>
            )}

            {/* Versions */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-[#9ca3af] mb-3">Versions</h4>
              <div className="space-y-2">
                {versions.slice(0, 5).map(v => (
                  <div key={v.id} className="flex items-center justify-between p-2 rounded bg-[#333]">
                    <div className="text-sm text-white">
                      v{v.version}
                      <Badge className="ml-2 text-xs bg-[#555] text-white">{v.status}</Badge>
                    </div>
                    <div className="flex gap-1">
                      {v.status !== 'published' && (
                        <Button size="sm" variant="ghost" onClick={() => publishVersion(v)} className="text-[#10b981] hover:bg-[#555] h-6 px-2">
                          <CheckCircle2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Test Dialog */}
        <JourneyTestDialog 
          isOpen={showTestDialog}
          onClose={() => setShowTestDialog(false)}
          onRun={handleTestRun}
        />

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Journey Templates</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {Object.entries(JOURNEY_TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => loadTemplate(key)}
                    className="w-full text-left p-3 rounded border border-[#555] hover:border-[#00d4ff] hover:bg-[#00d4ff]/5 transition-colors"
                  >
                    <div className="font-medium text-white">{template.name}</div>
                    <div className="text-xs text-[#9ca3af] mt-1">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile overlay */}
        {(showSidebar || showProperties) && (
          <div 
            className="fixed inset-0 bg-black/50 z-[80] lg:hidden" 
            onClick={() => {
              setShowSidebar(false);
              setShowProperties(false);
            }} 
          />
        )}
      </div>
    </div>
  );
}