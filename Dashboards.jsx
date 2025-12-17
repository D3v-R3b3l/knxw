
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BarChart3, // Changed from LayoutDashboard
  Plus,
  Eye,
  Edit,
  Copy,
  Trash2,
  Globe,
  Lock,
  Calendar,
  User
} from 'lucide-react';
import { Dashboard } from '@/api/entities';
import { dashboardOperations } from '@/api/functions';

// New imports from the outline
import CustomDashboardBuilder from '../components/dashboard/CustomDashboardBuilder';
import SankeyDiagram from '../components/charts/SankeyDiagram';
import NetworkGraph from '../components/charts/NetworkGraph';
import AdvancedHeatmap from '../components/charts/AdvancedHeatmap';

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Retained for filtering existing dashboards, though search input removed from header
  
  // Removed showCreateForm as it's replaced by showBuilder for a more generic builder
  const [newDashboard, setNewDashboard] = useState({ // Still needed for the initial create dashboard form, if it were to be re-added, but not for CustomDashboardBuilder directly
    name: '',
    description: '',
    is_public: false
  });

  // New state variables from the outline
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState(null); // Used to pass dashboard ID to builder for editing

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    setLoading(true);
    try {
      const dashboardList = await Dashboard.list('-created_date');
      setDashboards(dashboardList);
    } catch (error) {
      console.error('Failed to load dashboards:', error);
    } finally {
      setLoading(false);  
    }
  };

  // Filtered dashboards logic is retained for when the list is shown
  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dashboard.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // handleCreateDashboard is replaced by handleSaveDashboardFromBuilder
  // Keeping this for now if there's any implicit need, but it's not directly used by the new builder flow.
  // const handleCreateDashboard = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const { data } = await dashboardOperations({
  //       operation: 'create_dashboard',
  //       data: {
  //         ...newDashboard,
  //         org_id: 'default_org',
  //         workspace_id: 'default_workspace'
  //       }
  //     });
      
  //     if (data.success) {
  //       setShowCreateForm(false);
  //       setNewDashboard({ name: '', description: '', is_public: false });
  //       loadDashboards();
  //     }
  //   } catch (error) {
  //     console.error('Failed to create dashboard:', error);
  //   }
  // };

  // New function to handle saving/updating from CustomDashboardBuilder
  const handleSaveDashboardFromBuilder = async (dashboardData, dashboardId = null) => {
    try {
      if (dashboardId) {
        // Update existing dashboard
        await dashboardOperations({
          operation: 'update_dashboard',
          dashboard_id: dashboardId,
          data: dashboardData // dashboardData expected to contain name, description, is_public, and internal config
        });
      } else {
        // Create new dashboard
        await dashboardOperations({
          operation: 'create_dashboard',
          data: {
            ...dashboardData,
            org_id: 'default_org', // This would come from user context
            workspace_id: 'default_workspace' // This would come from user context
          }
        });
      }
      setShowBuilder(false);
      setSelectedDashboard(null); // Reset selected dashboard after save/cancel
      loadDashboards(); // Reload dashboards to show changes
    } catch (error) {
      console.error('Failed to save dashboard:', error);
      // Potentially show an error message to the user
    }
  };

  const handleDuplicateDashboard = async (dashboard) => {
    try {
      const { data } = await dashboardOperations({
        operation: 'duplicate_dashboard',
        dashboard_id: dashboard.id,
        data: { name: `${dashboard.name} (Copy)` }
      });
      
      if (data.success) {
        loadDashboards();
      }
    } catch (error) {
      console.error('Failed to duplicate dashboard:', error);
    }
  };

  const handleDeleteDashboard = async (dashboard) => {
    if (!confirm(`Are you sure you want to delete "${dashboard.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const { data } = await dashboardOperations({
        operation: 'delete_dashboard',
        dashboard_id: dashboard.id
      });
      
      if (data.success) {
        loadDashboards();
      }
    } catch (error) {
      console.error('Failed to delete dashboard:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white"> {/* Updated outer div class */}
      <div className="p-6 md:p-8 max-w-7xl mx-auto"> {/* Updated inner div class */}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
                  <BarChart3 className="w-6 h-6 text-[#0a0a0a]" /> {/* Changed icon */}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Custom Dashboards
                </h1>
              </div>
              <p className="text-[#a3a3a3] text-lg">
                Create personalized dashboards with advanced visualizations
              </p>
            </div>
            <Button
              onClick={() => {
                setShowBuilder(!showBuilder);
                setSelectedDashboard(null); // Always clear selected dashboard when toggling builder via this button
              }}
              className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showBuilder ? 'Hide Builder' : 'New Dashboard'}
            </Button>
          </div>
        </div>

        {/* Custom Dashboard Builder */}
        <AnimatePresence>
          {showBuilder && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <CustomDashboardBuilder
                dashboardId={selectedDashboard?.id}
                onSave={(dashboardData) => handleSaveDashboardFromBuilder(dashboardData, selectedDashboard?.id)}
                onCancel={() => {
                  setShowBuilder(false);
                  setSelectedDashboard(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Only show demo charts and existing dashboards when builder is not active */}
        {!showBuilder && (
          <>
            {/* Demo: Advanced Chart Showcase */}
            <div className="space-y-8 mb-8">
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white">User Journey Flow (Sankey)</CardTitle>
                  <p className="text-sm text-[#a3a3a3]">
                    Visualize how users flow through your application
                  </p>
                </CardHeader>
                <CardContent>
                  <SankeyDiagram
                    data={{
                      nodes: [
                        { name: 'Landing' },
                        { name: 'Signup' },
                        { name: 'Onboarding' },
                        { name: 'Dashboard' },
                        { name: 'Active User' },
                        { name: 'Churned' }
                      ],
                      links: [
                        { source: 0, target: 1, value: 1000 },
                        { source: 1, target: 2, value: 750 },
                        { source: 2, target: 3, value: 600 },
                        { source: 3, target: 4, value: 450 },
                        { source: 3, target: 5, value: 150 },
                        { source: 1, target: 5, value: 250 }
                      ]
                    }}
                    width={800}
                    height={400}
                  />
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white">Psychographic Network</CardTitle>
                  <p className="text-sm text-[#a3a3a3]">
                    Explore connections between personality traits and behaviors
                  </p>
                </CardHeader>
                <CardContent>
                  <NetworkGraph
                    nodes={[
                      { id: 'analytical', label: 'Analytical', group: 'analytical', value: 30 },
                      { id: 'intuitive', label: 'Intuitive', group: 'intuitive', value: 25 },
                      { id: 'systematic', label: 'Systematic', group: 'systematic', value: 20 },
                      { id: 'creative', label: 'Creative', group: 'creative', value: 25 },
                      { id: 'high_engagement', label: 'High Engagement', group: 'conservative', value: 40 },
                      { id: 'conversion', label: 'Conversions', group: 'moderate', value: 35 }
                    ]}
                    edges={[
                      { source: 'analytical', target: 'high_engagement', value: 15 },
                      { source: 'systematic', target: 'high_engagement', value: 12 },
                      { source: 'intuitive', target: 'conversion', value: 18 },
                      { source: 'creative', target: 'conversion', value: 10 },
                      { source: 'analytical', target: 'conversion', value: 20 }
                    ]}
                    width={800}
                    height={500}
                  />
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white">Engagement Intensity Heatmap</CardTitle>
                  <p className="text-sm text-[#a3a3a3]">
                    See where different psychographic profiles engage most
                  </p>
                </CardHeader>
                <CardContent>
                  <AdvancedHeatmap
                    data={[
                      [45, 32, 18, 67, 28],
                      [89, 54, 23, 45, 67],
                      [23, 78, 91, 34, 12],
                      [56, 45, 67, 89, 43],
                      [34, 67, 45, 23, 78]
                    ]}
                    xLabels={['Homepage', 'Pricing', 'Features', 'Docs', 'Blog']}
                    yLabels={['Analytical', 'Intuitive', 'Systematic', 'Creative', 'Mixed']}
                    width={800}
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>
            {/* Dashboards Grid (retained, but without search bar) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredDashboards.map((dashboard) => (
                  <motion.div
                    key={dashboard.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/30 transition-all duration-200 h-full">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-white text-lg truncate mb-1">
                              {dashboard.name}
                            </CardTitle>
                            {dashboard.description && (
                              <p className="text-[#a3a3a3] text-sm line-clamp-2">
                                {dashboard.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {dashboard.is_public ? (
                              <Globe className="w-4 h-4 text-[#00d4ff]" title="Public" />
                            ) : (
                              <Lock className="w-4 h-4 text-[#a3a3a3]" title="Private" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-xs text-[#6b7280] mb-4">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>You</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(dashboard.created_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedDashboard(dashboard);
                              setShowBuilder(true);
                            }}
                            className="flex-1 bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDashboard(dashboard);
                              setShowBuilder(true);
                            }}
                            className="border-[#262626] text-[#a3a3a3] hover:bg-[#262626]"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDuplicateDashboard(dashboard)}
                            className="border-[#262626] text-[#a3a3a3] hover:bg-[#262626]"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteDashboard(dashboard)}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredDashboards.length === 0 && !loading && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-[#a3a3a3] mx-auto mb-4" /> {/* Changed icon */}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm ? 'No dashboards found' : 'No dashboards yet'}
                </h3>
                <p className="text-[#a3a3a3] mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Create your first custom dashboard to start visualizing your data'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setShowBuilder(true)} // Now uses the new builder flow
                    className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Dashboard
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
