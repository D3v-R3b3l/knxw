import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Profiles from "./Profiles";

import Events from "./Events";

import Insights from "./Insights";

import Settings from "./Settings";

import Engagements from "./Engagements";

import BatchAnalytics from "./BatchAnalytics";

import Documentation from "./Documentation";

import Integrations from "./Integrations";

import Landing from "./Landing";

import Profile from "./Profile";

import DemoData from "./DemoData";

import Privacy from "./Privacy";

import Terms from "./Terms";

import Glossary from "./Glossary";

import Agents from "./Agents";

import PricingFAQ from "./PricingFAQ";

import AttributionSettings from "./AttributionSettings";

import Onboarding from "./Onboarding";

import Blog from "./Blog";

import BlogPost from "./BlogPost";

import OrgAdmin from "./OrgAdmin";

import SystemHealth from "./SystemHealth";

import AlertsSettings from "./AlertsSettings";

import Dashboards from "./Dashboards";

import DashboardBuilder from "./DashboardBuilder";

import Tests from "./Tests";

import DataImport from "./DataImport";

import MetaData from "./MetaData";

import GoogleData from "./GoogleData";

import ImportedTextRecords from "./ImportedTextRecords";

import CRMRecords from "./CRMRecords";

import EmployeeRecords from "./EmployeeRecords";

import AudienceBuilder from "./AudienceBuilder";

import Journeys from "./Journeys";

import ExecutiveDashboard from "./ExecutiveDashboard";

import PageAnalytics from "./PageAnalytics";

import Support from "./Support";

import ABTesting from "./ABTesting";

import UnifiedDataIntegration from "./UnifiedDataIntegration";

import MyApps from "./MyApps";

import lowdown from "./lowdown";

import MarketIntelligence from "./MarketIntelligence";

import FeedbackInsights from "./FeedbackInsights";

import EnterpriseSecurityDashboard from "./EnterpriseSecurityDashboard";

import SystemValidation from "./SystemValidation";

import AdminRoles from "./AdminRoles";

import Developers from "./Developers";

import DeveloperKeys from "./DeveloperKeys";

import DeveloperUsage from "./DeveloperUsage";

import DeveloperPlayground from "./DeveloperPlayground";

import DeveloperGameDev from "./DeveloperGameDev";

import Assistant from "./Assistant";

import LlmEvaluation from "./LlmEvaluation";

import ComplianceDashboard from "./ComplianceDashboard";

import Pricing from "./Pricing";

import ProofHub from "./ProofHub";

import InteractiveDemo from "./InteractiveDemo";

import dashboard from "./dashboard";

import blog from "./blog";

import documentation from "./documentation";

import settings from "./settings";

import Robotics from "./Robotics";

import landing from "./landing";

import IntegrationsManagement from "./IntegrationsManagement";

import ABTestingStudio from "./ABTestingStudio";

import PredictivePsychographics from "./PredictivePsychographics";

import DataQuality from "./DataQuality";

import UserSettings from "./UserSettings";

import Collaborate from "./Collaborate";

import CaseStudy from "./CaseStudy";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Profiles: Profiles,
    
    Events: Events,
    
    Insights: Insights,
    
    Settings: Settings,
    
    Engagements: Engagements,
    
    BatchAnalytics: BatchAnalytics,
    
    Documentation: Documentation,
    
    Integrations: Integrations,
    
    Landing: Landing,
    
    Profile: Profile,
    
    DemoData: DemoData,
    
    Privacy: Privacy,
    
    Terms: Terms,
    
    Glossary: Glossary,
    
    Agents: Agents,
    
    PricingFAQ: PricingFAQ,
    
    AttributionSettings: AttributionSettings,
    
    Onboarding: Onboarding,
    
    Blog: Blog,
    
    BlogPost: BlogPost,
    
    OrgAdmin: OrgAdmin,
    
    SystemHealth: SystemHealth,
    
    AlertsSettings: AlertsSettings,
    
    Dashboards: Dashboards,
    
    DashboardBuilder: DashboardBuilder,
    
    Tests: Tests,
    
    DataImport: DataImport,
    
    MetaData: MetaData,
    
    GoogleData: GoogleData,
    
    ImportedTextRecords: ImportedTextRecords,
    
    CRMRecords: CRMRecords,
    
    EmployeeRecords: EmployeeRecords,
    
    AudienceBuilder: AudienceBuilder,
    
    Journeys: Journeys,
    
    ExecutiveDashboard: ExecutiveDashboard,
    
    PageAnalytics: PageAnalytics,
    
    Support: Support,
    
    ABTesting: ABTesting,
    
    UnifiedDataIntegration: UnifiedDataIntegration,
    
    MyApps: MyApps,
    
    lowdown: lowdown,
    
    MarketIntelligence: MarketIntelligence,
    
    FeedbackInsights: FeedbackInsights,
    
    EnterpriseSecurityDashboard: EnterpriseSecurityDashboard,
    
    SystemValidation: SystemValidation,
    
    AdminRoles: AdminRoles,
    
    Developers: Developers,
    
    DeveloperKeys: DeveloperKeys,
    
    DeveloperUsage: DeveloperUsage,
    
    DeveloperPlayground: DeveloperPlayground,
    
    DeveloperGameDev: DeveloperGameDev,
    
    Assistant: Assistant,
    
    LlmEvaluation: LlmEvaluation,
    
    ComplianceDashboard: ComplianceDashboard,
    
    Pricing: Pricing,
    
    ProofHub: ProofHub,
    
    InteractiveDemo: InteractiveDemo,
    
    dashboard: dashboard,
    
    blog: blog,
    
    documentation: documentation,
    
    settings: settings,
    
    Robotics: Robotics,
    
    landing: landing,
    
    IntegrationsManagement: IntegrationsManagement,
    
    ABTestingStudio: ABTestingStudio,
    
    PredictivePsychographics: PredictivePsychographics,
    
    DataQuality: DataQuality,
    
    UserSettings: UserSettings,
    
    Collaborate: Collaborate,
    
    CaseStudy: CaseStudy,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Profiles" element={<Profiles />} />
                
                <Route path="/Events" element={<Events />} />
                
                <Route path="/Insights" element={<Insights />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Engagements" element={<Engagements />} />
                
                <Route path="/BatchAnalytics" element={<BatchAnalytics />} />
                
                <Route path="/Documentation" element={<Documentation />} />
                
                <Route path="/Integrations" element={<Integrations />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/DemoData" element={<DemoData />} />
                
                <Route path="/Privacy" element={<Privacy />} />
                
                <Route path="/Terms" element={<Terms />} />
                
                <Route path="/Glossary" element={<Glossary />} />
                
                <Route path="/Agents" element={<Agents />} />
                
                <Route path="/PricingFAQ" element={<PricingFAQ />} />
                
                <Route path="/AttributionSettings" element={<AttributionSettings />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/Blog" element={<Blog />} />
                
                <Route path="/BlogPost" element={<BlogPost />} />
                
                <Route path="/OrgAdmin" element={<OrgAdmin />} />
                
                <Route path="/SystemHealth" element={<SystemHealth />} />
                
                <Route path="/AlertsSettings" element={<AlertsSettings />} />
                
                <Route path="/Dashboards" element={<Dashboards />} />
                
                <Route path="/DashboardBuilder" element={<DashboardBuilder />} />
                
                <Route path="/Tests" element={<Tests />} />
                
                <Route path="/DataImport" element={<DataImport />} />
                
                <Route path="/MetaData" element={<MetaData />} />
                
                <Route path="/GoogleData" element={<GoogleData />} />
                
                <Route path="/ImportedTextRecords" element={<ImportedTextRecords />} />
                
                <Route path="/CRMRecords" element={<CRMRecords />} />
                
                <Route path="/EmployeeRecords" element={<EmployeeRecords />} />
                
                <Route path="/AudienceBuilder" element={<AudienceBuilder />} />
                
                <Route path="/Journeys" element={<Journeys />} />
                
                <Route path="/ExecutiveDashboard" element={<ExecutiveDashboard />} />
                
                <Route path="/PageAnalytics" element={<PageAnalytics />} />
                
                <Route path="/Support" element={<Support />} />
                
                <Route path="/ABTesting" element={<ABTesting />} />
                
                <Route path="/UnifiedDataIntegration" element={<UnifiedDataIntegration />} />
                
                <Route path="/MyApps" element={<MyApps />} />
                
                <Route path="/lowdown" element={<lowdown />} />
                
                <Route path="/MarketIntelligence" element={<MarketIntelligence />} />
                
                <Route path="/FeedbackInsights" element={<FeedbackInsights />} />
                
                <Route path="/EnterpriseSecurityDashboard" element={<EnterpriseSecurityDashboard />} />
                
                <Route path="/SystemValidation" element={<SystemValidation />} />
                
                <Route path="/AdminRoles" element={<AdminRoles />} />
                
                <Route path="/Developers" element={<Developers />} />
                
                <Route path="/DeveloperKeys" element={<DeveloperKeys />} />
                
                <Route path="/DeveloperUsage" element={<DeveloperUsage />} />
                
                <Route path="/DeveloperPlayground" element={<DeveloperPlayground />} />
                
                <Route path="/DeveloperGameDev" element={<DeveloperGameDev />} />
                
                <Route path="/Assistant" element={<Assistant />} />
                
                <Route path="/LlmEvaluation" element={<LlmEvaluation />} />
                
                <Route path="/ComplianceDashboard" element={<ComplianceDashboard />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
                <Route path="/ProofHub" element={<ProofHub />} />
                
                <Route path="/InteractiveDemo" element={<InteractiveDemo />} />
                
                <Route path="/dashboard" element={<dashboard />} />
                
                <Route path="/blog" element={<blog />} />
                
                <Route path="/documentation" element={<documentation />} />
                
                <Route path="/settings" element={<settings />} />
                
                <Route path="/Robotics" element={<Robotics />} />
                
                <Route path="/landing" element={<landing />} />
                
                <Route path="/IntegrationsManagement" element={<IntegrationsManagement />} />
                
                <Route path="/ABTestingStudio" element={<ABTestingStudio />} />
                
                <Route path="/PredictivePsychographics" element={<PredictivePsychographics />} />
                
                <Route path="/DataQuality" element={<DataQuality />} />
                
                <Route path="/UserSettings" element={<UserSettings />} />
                
                <Route path="/Collaborate" element={<Collaborate />} />
                
                <Route path="/CaseStudy" element={<CaseStudy />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}