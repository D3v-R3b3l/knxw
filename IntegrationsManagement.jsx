import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Settings,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Search,
  Zap,
  Database,
  Mail,
  MessageSquare,
  BarChart3,
  ShoppingCart,
  Code,
  Cloud,
  Link as LinkIcon,
  Loader2,
  Users,
  Megaphone,
  ShoppingBag,
  Flame,
  HelpCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import SegmentIntegration from '../components/integrations/SegmentIntegration';
import ShopifyIntegration from '../components/integrations/ShopifyIntegration';
import FirebaseIntegration from '../components/integrations/FirebaseIntegration';

const INTEGRATION_CATEGORIES = {
  analytics: { name: 'Analytics', icon: BarChart3, color: '#00d4ff' },
  crm: { name: 'CRM & Sales', icon: Database, color: '#10b981' },
  marketing: { name: 'Marketing', icon: Mail, color: '#ec4899' },
  communication: { name: 'Communication', icon: MessageSquare, color: '#8b5cf6' },
  ecommerce: { name: 'E-commerce', icon: ShoppingCart, color: '#f59e0b' },
  infrastructure: { name: 'Infrastructure', icon: Cloud, color: '#6b7280' },
  development: { name: 'Dev Tools', icon: Code, color: '#3b82f6' }
};

const AVAILABLE_INTEGRATIONS = [
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    icon: Users,
    color: '#ff7a59',
    description: 'Sync psychographic profiles to HubSpot contacts',
    features: ['Contact Sync', 'Custom Properties', 'Bi-directional'],
    status: 'available',
    setupPage: 'Integrations',
    docPath: 'hubspot-integration'
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics 4',
    category: 'analytics',
    icon: Database,
    color: '#4285f4',
    description: 'Connect GA4 for behavior + psychology analytics',
    features: ['Event Tracking', 'Custom Dimensions', 'Funnels'],
    status: 'available',
    setupPage: 'GoogleData',
    docPath: 'ga4-integration'
  },
  {
    id: 'google_ads',
    name: 'Google Ads',
    category: 'marketing',
    icon: Megaphone,
    color: '#fbbc04',
    description: 'Optimize ad targeting with psychographic data',
    features: ['Conversions', 'Audience Sync', 'ROI'],
    status: 'available',
    setupPage: 'Integrations',
    docPath: 'google-ads-integration'
  },
  {
    id: 'meta_pages',
    name: 'Meta Pages',
    category: 'marketing',
    icon: Megaphone,
    color: '#1877f2',
    description: 'Analyze Facebook/Instagram engagement',
    features: ['Page Analysis', 'Sentiment', 'Psychology'],
    status: 'available',
    setupPage: 'MetaData',
    docPath: 'meta-pages-integration'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'ecommerce',
    icon: ShoppingBag,
    color: '#635bff',
    description: 'Payment data + user psychology insights',
    features: ['Payments', 'Subscriptions', 'Churn'],
    status: 'available',
    setupPage: 'Settings',
    docPath: 'stripe-integration'
  },
  {
    id: 'segment',
    name: 'Segment',
    category: 'analytics',
    component: SegmentIntegration,
    icon: Zap,
    color: '#52bd95',
    description: 'Send psychographic data to Segment CDP',
    features: ['Event Forwarding', 'User Traits', 'Routing'],
    status: 'available',
    docPath: 'segment-integration'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'ecommerce',
    component: ShopifyIntegration,
    icon: ShoppingBag,
    color: '#96bf48',
    description: 'Optimize product recommendations by psychology',
    features: ['Customer Sync', 'Orders', 'Analytics'],
    status: 'available',
    docPath: 'shopify-integration'
  },
  {
    id: 'firebase',
    name: 'Firebase',
    category: 'development',
    component: FirebaseIntegration,
    icon: Flame,
    color: '#ffca28',
    description: 'Real-time DB, auth, and analytics for mobile',
    features: ['Real-time DB', 'Auth', 'Analytics'],
    status: 'available',
    docPath: 'firebase-integration'
  },
  {
    id: 'aws_s3',
    name: 'AWS S3',
    category: 'infrastructure',
    icon: Cloud,
    color: '#ff9900',
    description: 'Export data to S3 for warehousing',
    features: ['Exports', 'Formats', 'Scheduled'],
    status: 'available',
    setupPage: 'Settings',
    docPath: 'aws-s3-integration'
  },
  {
    id: 'aws_eventbridge',
    name: 'AWS EventBridge',
    category: 'infrastructure',
    icon: Cloud,
    color: '#ff9900',
    description: 'Stream events for serverless workflows',
    features: ['Real-time', 'Rules', 'Lambda'],
    status: 'available',
    setupPage: 'Settings',
    docPath: 'aws-eventbridge-integration'
  },
  {
    id: 'azure_blob',
    name: 'Azure Blob',
    category: 'infrastructure',
    icon: Cloud,
    color: '#0078d4',
    description: 'Export to Azure for enterprise data lakes',
    features: ['Blob Exports', 'Containers', 'Lifecycle'],
    status: 'available',
    setupPage: 'Settings',
    docPath: 'azure-blob-integration'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'crm',
    icon: Users,
    color: '#00a1e0',
    description: 'Enrich leads with psychological insights',
    features: ['Lead Scoring', 'Fields', 'Workflows'],
    status: 'coming_soon',
    docPath: 'salesforce-integration'
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    icon: MessageSquare,
    color: '#4a154b',
    description: 'Get alerts delivered to Slack',
    features: ['Alerts', 'Digests', 'Bot'],
    status: 'coming_soon',
    docPath: 'slack-integration'
  }
];

export default function IntegrationsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [connectedIntegrations, setConnectedIntegrations] = useState({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = async () => {
    setLoading(true);
    try {
      const hubspotConfigs = await base44.entities.HubSpotIntegrationConfig.list();
      const metaAccounts = await base44.entities.MetaAccount.list();
      const googleAccounts = await base44.entities.GoogleAccount.list();

      setConnectedIntegrations({
        hubspot: hubspotConfigs.length > 0 && hubspotConfigs[0].setup_completed,
        meta_pages: metaAccounts.length > 0,
        google_analytics: googleAccounts.length > 0,
        google_ads: googleAccounts.length > 0
      });
    } catch (error) {
      console.error('Failed to load integration status:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIntegrations = AVAILABLE_INTEGRATIONS.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (integration) => {
    if (integration.status === 'coming_soon') {
      return <Badge className="bg-[#6b7280] text-white border-none text-xs">Coming Soon</Badge>;
    }
    
    const isConnected = connectedIntegrations[integration.id];
    if (isConnected) {
      return <Badge className="bg-[#10b981] text-white border-none text-xs font-semibold">Connected</Badge>;
    }
    
    return <Badge className="bg-[#fbbf24] text-[#0a0a0a] font-semibold border-none text-xs">Not Connected</Badge>;
  };

  const handleConfigure = (integration) => {
    if (integration.setupPage) {
      window.location.href = createPageUrl(integration.setupPage);
    } else {
      toast({
        title: "Setup Available Soon",
        description: `Configuration for ${integration.name} coming soon`
      });
    }
  };

  const IntegrationCard = ({ integration }) => {
    const CardIcon = integration.icon || INTEGRATION_CATEGORIES[integration.category]?.icon || Zap;
    const cardColor = integration.color || INTEGRATION_CATEGORIES[integration.category]?.color || '#6b7280';
    const isConnected = connectedIntegrations[integration.id];
    const isComingSoon = integration.status === 'coming_soon';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}>
        <Card className="bg-[#111111] border-[#262626] hover:border-white/20 transition-all h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div 
                  className="p-2.5 rounded-xl flex-shrink-0"
                  style={{ backgroundColor: `${cardColor}20` }}>
                  <CardIcon className="w-5 h-5" style={{ color: cardColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-white text-base font-bold leading-tight">{integration.name}</CardTitle>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    {INTEGRATION_CATEGORIES[integration.category]?.name}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                {getStatusBadge(integration)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 flex-1 flex flex-col">
            <p className="text-sm text-[#a3a3a3] mb-4 leading-relaxed">
              {integration.description}
            </p>
            
            <div className="flex flex-wrap gap-1.5 mb-4">
              {integration.features?.slice(0, 3).map((feature, idx) => (
                <span 
                  key={idx} 
                  className="text-xs px-2.5 py-1 bg-white/5 text-[#a3a3a3] rounded-md border border-white/10">
                  {feature}
                </span>
              ))}
            </div>

            <div className="flex gap-2 mt-auto">
              {!isComingSoon && (
                <Button
                  onClick={() => handleConfigure(integration)}
                  size="sm"
                  className={`flex-1 ${
                    isConnected 
                      ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' 
                      : 'bg-white hover:bg-white/90 text-[#0a0a0a] font-semibold'
                  }`}>
                  <Settings className="w-4 h-4 mr-1.5" />
                  {isConnected ? 'Manage' : 'Connect'}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`${createPageUrl('Documentation')}#${integration.docPath}`, '_blank')}
                className="border-white/10 text-[#a3a3a3] hover:bg-white/5 hover:text-white flex-shrink-0">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header - Fully responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex-shrink-0">
                <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                    Integrations
                  </h1>
                  <Link to={`${createPageUrl('Documentation')}#integration-playbooks`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-[#6b7280] hover:text-white hover:bg-white/5 flex-shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <p className="text-sm sm:text-base text-[#a3a3a3] mt-1">
                  Connect your stack
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search - Responsive */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <Input
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#111111] border-white/10 text-white placeholder:text-[#6b7280]"
            />
          </div>
        </div>

        {/* Category Filters - Horizontal scroll on mobile */}
        <div className="mb-6 sm:mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              onClick={() => setSelectedCategory('all')}
              size="sm"
              className={`flex-shrink-0 ${selectedCategory === 'all' 
                ? 'bg-white text-[#0a0a0a] hover:bg-white/90 font-semibold'
                : 'bg-white/5 text-[#a3a3a3] hover:bg-white/10 hover:text-white border border-white/10'
              }`}>
              All
            </Button>
            {Object.entries(INTEGRATION_CATEGORIES).map(([key, category]) => (
              <Button
                key={key}
                onClick={() => setSelectedCategory(key)}
                size="sm"
                className={`flex-shrink-0 whitespace-nowrap ${selectedCategory === key
                  ? 'bg-white text-[#0a0a0a] hover:bg-white/90 font-semibold'
                  : 'bg-white/5 text-[#a3a3a3] hover:bg-white/10 hover:text-white border border-white/10'
                }`}>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Active Integrations Summary */}
        {!loading && Object.values(connectedIntegrations).some(Boolean) && (
          <div className="mb-6 sm:mb-8">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                    <CheckCircle className="w-5 h-5 text-[#10b981] flex-shrink-0" />
                    <span>Active Connections</span>
                  </CardTitle>
                  <Button
                    onClick={loadConnectionStatus}
                    size="sm"
                    variant="ghost"
                    className="text-white/60 hover:text-white hover:bg-white/5 self-start sm:self-auto">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(connectedIntegrations)
                    .filter(([_, connected]) => connected)
                    .map(([integrationId]) => {
                      const integration = AVAILABLE_INTEGRATIONS.find(i => i.id === integrationId);
                      return integration ? (
                        <Badge key={integrationId} className="bg-white/10 text-white border-white/20 font-medium text-xs">
                          {integration.name}
                        </Badge>
                      ) : null;
                    })
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Integrations Grid - Fully responsive */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
          </div>
        ) : filteredIntegrations.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No integrations found</h3>
            <p className="text-sm sm:text-base text-[#a3a3a3]">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence>
              {filteredIntegrations.map(integration => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Help Section - Responsive */}
        <div className="mt-12 sm:mt-16 border-t border-white/5 pt-8 sm:pt-12">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Need Help?</h3>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <Card className="bg-[#111111] border-white/10">
              <CardContent className="p-4 sm:p-6">
                <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Integration Guides</h4>
                <p className="text-xs sm:text-sm text-[#a3a3a3] mb-4 leading-relaxed">
                  Step-by-step setup instructions
                </p>
                <Button
                  onClick={() => window.location.href = createPageUrl('Documentation')}
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white hover:bg-white/5 w-full sm:w-auto">
                  View Docs
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-white/10">
              <CardContent className="p-4 sm:p-6">
                <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Request Integration</h4>
                <p className="text-xs sm:text-sm text-[#a3a3a3] mb-4 leading-relaxed">
                  Don't see your tool? Let us know
                </p>
                <Button
                  onClick={() => window.location.href = createPageUrl('Support')}
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white hover:bg-white/5 w-full sm:w-auto">
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}