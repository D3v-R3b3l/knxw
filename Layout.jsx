
import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Menu, X, User, LogOut, ArrowUp, ChevronLeft, ChevronRight, Bot,
  HelpCircle, GraduationCap, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import ErrorBoundary from "./components/system/ErrorBoundary";
import GlobalErrorBoundary from "./components/system/GlobalErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import GoogleSiteVerificationMeta from "./components/system/GoogleSiteVerificationMeta";
import { DashboardProvider } from "./components/dashboard/DashboardStore";
import { HelmetProvider } from 'react-helmet-async';
import { createPageUrl } from "@/utils";
import InteractiveTour from "./components/onboarding/InteractiveTour";
import ComprehensiveWalkthrough from "./components/onboarding/ComprehensiveWalkthrough";
import GlobalAIAssistant from "./components/ai/GlobalAIAssistant";
import RoleBasedOnboarding, { detectUserRole } from "./components/onboarding/RoleBasedOnboarding";
import AdaptiveOnboardingEngine from "./components/onboarding/AdaptiveOnboardingEngine";
import { navigationSections, adminNavigationItems } from "./components/constants/navigation";
import { ASSETS } from "./components/constants/assets";
import { logError } from "./components/config/sentry";
import SEOHead from "./components/system/SEOHead";

const ProfileMenu = () => {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  if (!user) return null;

  return (
    <div className="relative profile-menu-container">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-lg flex items-center justify-center">
          <User className="w-4 h-4 text-[#0a0a0a]" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-white truncate">{user.full_name || user.email}</div>
          <div className="text-xs text-[#6b7280] truncate">{user.email}</div>
        </div>
      </button>
      {showMenu && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#111111] border border-[#262626] rounded-lg shadow-xl overflow-hidden">
          <Link
            to={createPageUrl('Profile')}
            className="block px-4 py-2 text-sm text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white transition-colors"
            onClick={() => setShowMenu(false)}
          >
            Profile Settings
          </Link>
          <button
            onClick={() => {
              setShowMenu(false);
              base44.auth.logout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-[#1a1a1a] transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTour, setShowTour] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showRoleOnboarding, setShowRoleOnboarding] = useState(false);
  const [userRole, setUserRole] = useState('marketer');
  const [authError, setAuthError] = useState(null);



  const isLandingPage = currentPageName === 'Landing' || location.pathname === createPageUrl('Landing') || location.pathname === '/';
  const isOnboardingPage = currentPageName === 'Onboarding';
  const isPricingFAQPage = currentPageName === 'PricingFAQ';
  const isDocsPublicPage = currentPageName?.toLowerCase() === 'documentation';
  const isBlogPage = currentPageName === 'Blog' || currentPageName === 'BlogPost' || currentPageName === 'blog';
  const isLegalPage = currentPageName === 'Privacy' || currentPageName === 'Terms';
  const isInteractiveDemoPage = currentPageName === 'InteractiveDemo';

  useEffect(() => {
    if (isLandingPage || isOnboardingPage || isPricingFAQPage || isDocsPublicPage || isBlogPage || isLegalPage || isInteractiveDemoPage) {
      setIsLoadingUser(false);
      return;
    }

    base44.auth.me()
      .then(user => {
        setCurrentUser(user);
        const detectedRole = detectUserRole(user);
        setUserRole(detectedRole);
        
        // Check backend for onboarding state
        const onboardingKey = `${detectedRole}_completed`;
        const dismissedKey = `${detectedRole}_dismissed`;
        
        if (!user.onboarding_state?.[onboardingKey] && !user.onboarding_state?.[dismissedKey]) {
          setTimeout(() => {
            setShowRoleOnboarding(true);
          }, 2000);
        }
        
        // Check for tour state in backend
        if (user.onboarding_state?.tour_requested && !user.onboarding_state?.tour_completed) {
          setShowTour(true);
        }

        // Listen for onboarding trigger from dashboard
        const handleOnboardingTrigger = () => {
          setShowRoleOnboarding(true);
        };
        window.addEventListener('knxw-trigger-onboarding', handleOnboardingTrigger);
        
        return () => {
          window.removeEventListener('knxw-trigger-onboarding', handleOnboardingTrigger);
        };
      })
      .catch((error) => {
        logError(error, { context: 'Layout authentication' });
        setAuthError(error);
        // Graceful error - show message instead of immediate redirect
        setTimeout(() => {
          navigate(createPageUrl('Landing'));
        }, 2000);
      })
      .finally(() => setIsLoadingUser(false));
  }, [isLandingPage, isOnboardingPage, isPricingFAQPage, isDocsPublicPage, isBlogPage, isLegalPage, isInteractiveDemoPage]);



  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const adminItems = currentUser?.role === 'admin' ? adminNavigationItems : [];

  const allNavItems = [
    ...navigationSections.flatMap(section => section.items),
    ...adminItems
  ];

  const filteredSections = searchQuery
    ? [{ title: "Search Results", items: allNavItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )}]
    : navigationSections;

  if (isLandingPage || isOnboardingPage || isPricingFAQPage || isDocsPublicPage || isBlogPage || isLegalPage || isInteractiveDemoPage) {
    return (
      <HelmetProvider>
        <GlobalErrorBoundary>
          <SEOHead />
          <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
            {isLandingPage && <GoogleSiteVerificationMeta />}
            {children}
            <Toaster />
          </div>
        </GlobalErrorBoundary>
      </HelmetProvider>
    );
  }
  
  if (authError) {
    return (
      <GlobalErrorBoundary>
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
            <p className="text-gray-400 mb-6">Redirecting to login...</p>
            <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </GlobalErrorBoundary>
    );
  }

  return (
    <HelmetProvider>
      <GlobalErrorBoundary>
        <style>{`
          /* Sidebar scrollbar styling - thin, dark, minimalistic */
          .sidebar-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #00d4ff40;
            border-radius: 3px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: #00d4ff80;
          }
          .sidebar-scroll {
            scrollbar-width: thin;
            scrollbar-color: #00d4ff40 transparent;
          }
          
          /* Prevent horizontal scroll in collapsed state */
          .sidebar-scroll {
            overflow-x: hidden;
          }
        `}</style>
        
        <AdaptiveOnboardingEngine>
        <div className="h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden">
          {showTour && (
            <InteractiveTour
              onComplete={() => setShowTour(false)}
              onSkip={() => setShowTour(false)}
            />
          )}

          <ComprehensiveWalkthrough
            isOpen={showWalkthrough}
            onClose={() => setShowWalkthrough(false)}
            onComplete={async () => {
              setShowWalkthrough(false);
              try {
                const user = await base44.auth.me();
                await base44.auth.updateMe({
                  onboarding_state: {
                    ...user.onboarding_state,
                    walkthrough_completed: true
                  }
                });
              } catch (error) {
                console.error('Failed to save walkthrough completion:', error);
              }
            }}
          />

          <RoleBasedOnboarding
            isOpen={showRoleOnboarding}
            onClose={async () => {
              setShowRoleOnboarding(false);
              
              try {
                // Mark as dismissed so it doesn't show again
                const user = await base44.auth.me();
                await base44.auth.updateMe({
                  onboarding_state: {
                    ...user.onboarding_state,
                    [`${userRole}_dismissed`]: true,
                    dismissed_at: new Date().toISOString()
                  }
                });
              } catch (error) {
                console.error('Failed to save onboarding dismissal:', error);
              }
            }}
            userRole={userRole}
          />

          <GlobalAIAssistant
            isOpen={showAIAssistant}
            onClose={() => setShowAIAssistant(false)}
          />

          <aside className={`hidden md:flex fixed top-0 left-0 h-full bg-[#0a0a0a]/95 backdrop-blur-xl border-r border-white/5 z-30 transition-all duration-300 flex-col ${isCollapsed ? 'w-16' : 'w-72'}`}>
            <div className="border-b border-white/5 p-4 flex items-center justify-between h-20 flex-shrink-0 bg-white/5 backdrop-blur-sm">
              {!isCollapsed && (
                <Link to={createPageUrl('Landing')} className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img 
                      src={ASSETS.logo} 
                      alt={ASSETS.brandName} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </Link>
              )}
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)} 
                className="p-2 hover:bg-[#1a1a1a] rounded-lg flex-shrink-0 text-[#a3a3a3] hover:text-white transition-colors"
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {!isCollapsed && (
              <div className="px-4 py-3 border-b border-[#262626] flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
                  <input
                    type="text"
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-[#1a1a1a] border border-[#262626] rounded-lg text-white placeholder:text-[#6b7280] focus:outline-none focus:border-[#00d4ff]/50"
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto sidebar-scroll px-4 py-4">
              {filteredSections.map((section) => (
                <div key={section.title} className="mb-6">
                  {!isCollapsed && (
                    <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2 px-3">
                      {section.title}
                    </h3>
                  )}
                  <nav className="space-y-1">
                    {section.items.map((item) => {
                      const href = createPageUrl(item.page);
                      const isActive = location.pathname === href;
                      return (
                        <Link
                          key={item.title}
                          to={href}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                            isActive
                              ? 'bg-white/10 border border-[#00d4ff]/40 text-white shadow-[0_0_20px_rgba(0,212,255,0.2)] backdrop-blur-md'
                              : 'text-[#a3a3a3] hover:text-white hover:bg-white/5 hover:backdrop-blur-sm hover:shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:border-[#00d4ff]/20 border border-transparent'
                          } ${isCollapsed ? 'justify-center' : ''}`}
                          title={isCollapsed ? `${item.title} — ${item.description}` : item.description}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {!isCollapsed && <span className="text-sm font-medium truncate">{item.title}</span>}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}

              {!isCollapsed && adminItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2 px-3">
                    Administration
                  </h3>
                  <nav className="space-y-1">
                    {adminItems.map((item) => {
                      const href = createPageUrl(item.page);
                      const isActive = location.pathname === href;
                      return (
                        <Link
                          key={item.title}
                          to={href}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                            isActive
                              ? 'bg-white/10 border border-[#00d4ff]/40 text-white shadow-[0_0_20px_rgba(0,212,255,0.2)] backdrop-blur-md'
                              : 'text-[#a3a3a3] hover:text-white hover:bg-white/5 hover:backdrop-blur-sm hover:shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:border-[#00d4ff]/20 border border-transparent'
                          }`}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{item.title}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              )}
            </div>

            <div className="border-t border-[#262626] p-4 h-20 flex-shrink-0">
              {!isCollapsed && <ProfileMenu />}
            </div>
          </aside>

          <header className="md:hidden bg-[#111111] border-b border-[#262626] px-4 py-3 flex items-center justify-between">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-[#1a1a1a]">
              <Menu className="w-6 h-6" />
            </button>
            <Link to={createPageUrl('Landing')} className="flex items-center gap-2">
              <img 
                src={ASSETS.logo} 
                alt={ASSETS.brandName} 
                className="w-8 h-8 object-contain"
              />
            </Link>
            <div className="w-10" />
          </header>

          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-80 h-full bg-[#0f0f0f] border-r border-[#262626] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="p-4 border-b border-[#262626] flex items-center justify-between">
                    <span className="text-lg font-bold">{ASSETS.brandName}</span>
                    <button onClick={() => setIsMobileMenuOpen(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                <div className="p-4">
                  {navigationSections.map((section) => (
                    <div key={section.title} className="mb-6">
                      <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">
                        {section.title}
                      </h3>
                      <nav className="space-y-1">
                        {section.items.map((item) => (
                          <Link
                            key={item.title}
                            to={createPageUrl(item.page)}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-xl text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]"
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{item.title}</span>
                          </Link>
                        ))}
                      </nav>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <main className={`h-full overflow-y-auto bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#1f1f1f] via-[#0a0a0a] to-[#0a0a0a] transition-all duration-300 ${isCollapsed ? 'md:pl-16' : 'md:pl-72'}`}>
            {isLoadingUser ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#262626] border-t-[#00d4ff] rounded-full animate-spin" />
              </div>
            ) : (
              <ErrorBoundary>
                <DashboardProvider>{children}</DashboardProvider>
              </ErrorBoundary>
            )}
          </main>

          {/* Floating Action Buttons */}
          <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-40">
            <Button
                onClick={() => setShowAIAssistant(true)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] text-[#0a0a0a] shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]"
                title="AI Assistant"
              >
                <Bot className="w-6 h-6" />
              </Button>
              <Button
                onClick={() => setShowRoleOnboarding(true)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ec4899] to-[#db2777] text-white shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.5)]"
                title={`${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Onboarding`}
              >
                <GraduationCap className="w-6 h-6" />
              </Button>
              <Button
                onClick={() => setShowWalkthrough(true)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white shadow-lg hover:scale-110 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                title="Interactive Walkthrough"
              >
                <HelpCircle className="w-6 h-6" />
              </Button>
            {showBackToTop && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-14 h-14 rounded-full bg-[#111111] border border-[#262626] text-white shadow-lg hover:border-[#00d4ff]/40 transition-all"
              >
                <ArrowUp className="w-5 h-5 mx-auto" />
              </button>
            )}
          </div>

          <Toaster />
        </div>
      </AdaptiveOnboardingEngine>
    </GlobalErrorBoundary>
    </HelmetProvider>
  );
}
