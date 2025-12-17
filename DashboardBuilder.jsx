import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, Plus, Settings, BarChart3, TrendingUp, Table, FileText,
  Trash2, Copy, ArrowLeft, Download, X, Grip
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { dashboardOperations } from '@/api/functions';
import AnimatedLine from '@/components/charts/AnimatedLine';
import AnimatedBar from '@/components/charts/AnimatedBar';
import { createPageUrl } from '@/utils';
import WidgetLibrary, { widgetTypes } from '../components/dashboard/WidgetLibrary';
import AdvancedWidgetConfig from '../components/dashboard/AdvancedWidgetConfig';

// Widget Components
const TimeseriesWidget = ({ data, config }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-[#a3a3a3]">
        No data available
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: new Date(item.timestamp).toLocaleDateString(),
    value: item.value
  }));

  return (
    <div className="h-full">
      {config.content?.chart_type === 'bar' ? (
        <AnimatedBar 
          data={chartData}
          bars={[{ key: 'value', color: '#00d4ff', name: config.query?.metric_name || 'Value' }]}
        />
      ) : (
        <AnimatedLine 
          data={chartData}
          lines={[{ key: 'value', color: '#00d4ff', name: config.query?.metric_name || 'Value' }]}
        />
      )}
    </div>
  );
};

const KPIWidget = ({ data, config }) => {
  const value = data && data.length > 0 
    ? data.reduce((sum, item) => sum + item.value, 0) / data.length
    : 0;

  const formattedValue = config.content?.decimal_places !== undefined
    ? value.toFixed(config.content.decimal_places)
    : Math.round(value);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="text-4xl font-bold text-[#00d4ff] mb-2">
        {formattedValue}
      </div>
      <div className="text-sm text-[#a3a3a3] text-center">
        {config.query?.metric_name?.replace(/_/g, ' ').toUpperCase() || 'METRIC'}
      </div>
    </div>
  );
};

const TableWidget = ({ data, columns }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-[#a3a3a3]">
        No data available
      </div>
    );
  }

  const displayColumns = columns?.slice(0, 5) || [];

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#262626]">
            {displayColumns.map(col => (
              <th key={col} className="text-left p-2 text-[#a3a3a3] font-medium">
                {col.replace(/_/g, ' ').toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row, idx) => (
            <tr key={idx} className="border-b border-[#262626]/50">
              {displayColumns.map(col => (
                <td key={col} className="p-2 text-white truncate">
                  {String(row[col] || '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MarkdownWidget = ({ content }) => {
  return (
    <div className="h-full p-4 prose prose-invert prose-sm max-w-none overflow-auto">
      <div dangerouslySetInnerHTML={{ __html: content?.replace(/\n/g, '<br/>') || '' }} />
    </div>
  );
};

// Widget Renderer
const WidgetRenderer = ({ widget, data, onEdit, onDelete, editMode }) => {
  const config = widget.widget_config || widget;
  
  let content;
  switch (config.kind) {
    case 'timeseries':
      content = <TimeseriesWidget data={data.data} config={config} />;
      break;
    case 'kpi':
      content = <KPIWidget data={data.data} config={config} />;
      break;
    case 'table':
      content = <TableWidget data={data.data} columns={data.columns} config={config} />;
      break;
    case 'markdown':
      content = <MarkdownWidget content={data.content || config.content?.markdown || ''} />;
      break;
    default:
      content = <div className="h-full flex items-center justify-center text-[#a3a3a3]">Unknown widget type</div>;
  }

  return (
    <Card className="h-full bg-[#111111] border-[#262626]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm font-medium">
            {config.title}
          </CardTitle>
          {editMode && (
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(widget)}
                className="h-6 w-6 text-[#a3a3a3] hover:text-white"
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(widget)}
                className="h-6 w-6 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 h-[calc(100%-60px)]">
        {content}
      </CardContent>
    </Card>
  );
};

export default function DashboardBuilder() {
  const [dashboard, setDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [widgetData, setWidgetData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showWidgetForm, setShowWidgetForm] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const dashboardId = urlParams.get('id');
  const isEdit = urlParams.get('edit') === 'true';

  const loadDashboard = useCallback(async () => {
    if (!dashboardId) return;
    
    setLoading(true);
    try {
      const { data } = await dashboardOperations({
        operation: 'get_dashboard_data',
        dashboard_id: dashboardId
      });
      
      if (data.success) {
        setDashboard(data.dashboard);
        setWidgets(data.widgets);
        setWidgetData(data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [dashboardId]);

  useEffect(() => {
    if (dashboardId) {
      loadDashboard();
      setEditMode(isEdit);
    }
  }, [dashboardId, isEdit, loadDashboard]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setWidgets(items);
  };

  const handleAddWidget = (type) => {
    const widgetType = widgetTypes.find(w => w.id === type);
    setEditingWidget({
      kind: type,
      title: widgetType?.name || `New ${type} Widget`,
      query: getDefaultQuery(type),
      layout: { x: 0, y: Infinity, w: 4, h: 3 },
      content: getDefaultContent(type)
    });
    setShowWidgetForm(true);
    setShowWidgetLibrary(false);
  };

  const getDefaultQuery = (type) => {
    switch (type) {
      case 'timeseries':
      case 'kpi':
        return {
          metric_name: 'requests',
          time_window_hours: 24,
          group_by: [],
          filters: {}
        };
      case 'table':
        return {
          table_source: 'system_events',
          columns: ['timestamp', 'event_type', 'severity'],
          limit: 100,
          filters: {}
        };
      default:
        return {};
    }
  };

  const getDefaultContent = (type) => {
    switch (type) {
      case 'timeseries':
        return {
          chart_type: 'line',
          color_scheme: 'blue',
          show_legend: true
        };
      case 'kpi':
        return {
          decimal_places: 0
        };
      case 'markdown':
        return {
          markdown: '# New Note\n\nAdd your content here...'
        };
      default:
        return {};
    }
  };

  const handleSaveWidget = async (widgetData) => {
    try {
      if (widgetData.id) {
        await dashboardOperations({
          operation: 'update_widget',
          widget_id: widgetData.id,
          data: widgetData
        });
      } else {
        await dashboardOperations({
          operation: 'add_widget',
          dashboard_id: dashboardId,
          data: widgetData
        });
      }
      
      setShowWidgetForm(false);
      setEditingWidget(null);
      loadDashboard();
    } catch (error) {
      console.error('Failed to save widget:', error);
    }
  };

  const handleDeleteWidget = async (widget) => {
    if (!confirm(`Delete "${widget.title}"?`)) return;
    
    try {
      await dashboardOperations({
        operation: 'delete_widget',
        widget_id: widget.id
      });
      loadDashboard();
    } catch (error) {
      console.error('Failed to delete widget:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Dashboard not found</h2>
          <Button onClick={() => window.location.href = createPageUrl('Dashboards')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-[#262626] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => window.location.href = createPageUrl('Dashboards')}
              className="text-[#a3a3a3] hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-white">{dashboard.name}</h1>
              {dashboard.description && (
                <p className="text-sm text-[#a3a3a3]">{dashboard.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {editMode && (
              <Button
                onClick={() => setShowWidgetLibrary(true)}
                className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-[#0a0a0a] font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => setEditMode(!editMode)}
              className="border-[#262626] text-[#a3a3a3] hover:bg-[#262626]"
            >
              {editMode ? 'View Mode' : 'Edit Mode'}
            </Button>
            
            <Button className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {widgets.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-[#a3a3a3] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No widgets yet</h3>
              <p className="text-[#a3a3a3] mb-6">
                Add your first widget to start building your dashboard
              </p>
              {editMode && (
                <Button onClick={() => setShowWidgetLibrary(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Widget
                </Button>
              )}
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="widgets">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid md:grid-cols-2 gap-4"
                  >
                    {widgets.map((widget, index) => (
                      <Draggable 
                        key={widget.id} 
                        draggableId={widget.id} 
                        index={index}
                        isDragDisabled={!editMode}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="h-64"
                          >
                            <Card className="bg-[#111111] border-[#262626] h-full">
                              <CardHeader {...provided.dragHandleProps} className={editMode ? 'cursor-move' : ''}>
                                <div className="flex items-center gap-2">
                                  {editMode && <Grip className="w-4 h-4 text-[#6b7280]" />}
                                  <CardTitle className="text-white text-sm">{widget.title}</CardTitle>
                                </div>
                              </CardHeader>
                              <CardContent className="h-[calc(100%-4rem)]">
                                <WidgetRenderer
                                  widget={widget}
                                  data={widgetData[widget.id] || {}}
                                  onEdit={(w) => {
                                    setEditingWidget(w);
                                    setShowWidgetForm(true);
                                  }}
                                  onDelete={handleDeleteWidget}
                                  editMode={editMode}
                                />
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showWidgetLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowWidgetLibrary(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Widget Library</h2>
                  <p className="text-[#a3a3a3] mt-1">
                    Choose a widget type to add to your dashboard
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowWidgetLibrary(false)}
                  className="text-[#a3a3a3] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <WidgetLibrary onSelectWidget={handleAddWidget} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWidgetForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setShowWidgetForm(false);
              setEditingWidget(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                {editingWidget?.id ? 'Edit Widget' : 'Configure Widget'}
              </h2>
              <AdvancedWidgetConfig
                widget={editingWidget}
                onChange={setEditingWidget}
                onSave={handleSaveWidget}
                onCancel={() => {
                  setShowWidgetForm(false);
                  setEditingWidget(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}