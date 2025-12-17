import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, TrendingUp, Rocket, Shield, ArrowRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from "@/api/base44Client";
import HeadManager from '@/components/HeadManager';

/**
 * SEO-optimized Pricing Page with crawlable content
 */
export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [annualBilling, setAnnualBilling] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const plans = [
    {
      name: 'Developer',
      price: 0,
      annualPrice: 0,
      description: 'Perfect for testing and small-scale projects',
      highlight: false,
      features: [
        '1,000 monthly psychographic credits',
        'Basic psychographic profiling',
        'Real-time event stream',
        'Standard dashboards',
        'JavaScript SDK',
        'Documentation & forum support',
        'Up to 10,000 monthly active users'
      ],
      limitations: [
        'No advanced AI features',
        'Basic segmentation only',
        'Community support'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Growth',
      price: 99,
      annualPrice: 89,
      description: 'For growing businesses serious about conversion optimization',
      highlight: true,
      features: [
        '10,000-50,000 monthly credits',
        'Advanced psychographic profiling',
        'Limited Adaptive Engagement Engine (2 segments)',
        'Standard integrations (HubSpot, Meta, GA4)',
        'Email support',
        'A/B testing capabilities',
        'Content recommendation engine',
        'AI feedback analysis',
        'Up to 100,000 monthly active users'
      ],
      overageCost: '$0.01-$0.02 per extra credit',
      cta: 'Start 14-Day Trial',
      popular: true
    },
    {
      name: 'Pro',
      price: 499,
      annualPrice: 449,
      description: 'For teams that need enterprise-grade intelligence and scale',
      highlight: false,
      features: [
        '100,000-500,000 monthly credits',
        'Unlimited Adaptive Engagement Engine',
        'Advanced Batch Analytics',
        'Full API access',
        'Priority support',
        'Dedicated account manager (higher tiers)',
        'Market intelligence analysis',
        'Competitor psychographic insights',
        'White-glove onboarding',
        'Custom integrations',
        'Up to 1M monthly active users'
      ],
      overageCost: '$0.01-$0.02 per extra credit',
      cta: 'Start 14-Day Trial',
      popular: false
    },
    {
      name: 'Enterprise',
      price: null,
      annualPrice: null,
      description: 'Custom solutions for enterprise-scale operations',
      highlight: false,
      features: [
        'Unlimited psychographic credits',
        'Custom AI model training',
        'Dedicated infrastructure',
        'SSO & SAML integration',
        'Advanced security & compliance',
        'SLA guarantees',
        'Custom contracts & MSA',
        '24/7 premium support',
        'Unlimited monthly active users',
        'On-premise deployment options'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const calculateSavings = (monthlyPrice) => {
    if (!monthlyPrice) return null;
    const annualTotal = monthlyPrice * 12;
    const discountedAnnual = monthlyPrice * 0.9 * 12;
    return Math.round(annualTotal - discountedAnnual);
  };

  return (
    <>
      <HeadManager
        title="knXw Pricing - Psychographic Intelligence for Every Stage"
        description="Transparent, value-based pricing for psychographic AI. Start free, scale as you grow. Developer plan free forever, Growth from $99/mo, Pro from $499/mo. 10% annual discount."
        keywords="pricing, psychographic analytics, AI pricing, SaaS pricing, conversion optimization cost"
      />

      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] text-white">
        {/* SEO-optimized header with full text content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#00d4ff] via-[#c026d3] to-[#fbbf24] text-transparent bg-clip-text">
                Transparent Pricing
              </span>
              <span className="block mt-2 text-white">Built for Every Growth Stage</span>
            </h1>
            
            <p className="text-xl text-[#a3a3a3] max-w-3xl mx-auto mb-8">
              Start free with the Developer plan. Scale confidently with Growth or Pro. 
              Enterprise for custom needs. All plans include core psychographic analysis, 
              real-time profiling, and explainable AI reasoning.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm ${!annualBilling ? 'text-white font-semibold' : 'text-[#a3a3a3]'}`}>
                Monthly
              </span>
              <button
                onClick={() => setAnnualBilling(!annualBilling)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  annualBilling ? 'bg-[#00d4ff]' : 'bg-[#262626]'
                }`}
              >
                <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  annualBilling ? 'translate-x-7' : 'translate-x-0'
                }`} />
              </button>
              <span className={`text-sm ${annualBilling ? 'text-white font-semibold' : 'text-[#a3a3a3]'}`}>
                Annual
                <Badge className="ml-2 bg-[#10b981] text-white text-xs">Save 10%</Badge>
              </span>
            </div>
          </div>

          {/* Plans grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {plans.map((plan, idx) => {
              const displayPrice = annualBilling ? plan.annualPrice : plan.price;
              const savings = annualBilling && plan.price ? calculateSavings(plan.price) : null;
              
              return (
                <Card
                  key={idx}
                  className={`relative ${
                    plan.highlight
                      ? 'bg-gradient-to-br from-[#00d4ff]/10 to-[#c026d3]/10 border-[#00d4ff] shadow-xl shadow-[#00d4ff]/20'
                      : 'bg-[#111111] border-[#262626]'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[#00d4ff] text-black font-semibold px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-white">
                      <div className="flex items-center justify-between">
                        <span>{plan.name}</span>
                        {plan.name === 'Developer' && <Zap className="w-5 h-5 text-[#fbbf24]" />}
                        {plan.name === 'Growth' && <TrendingUp className="w-5 h-5 text-[#00d4ff]" />}
                        {plan.name === 'Pro' && <Rocket className="w-5 h-5 text-[#c026d3]" />}
                        {plan.name === 'Enterprise' && <Shield className="w-5 h-5 text-[#10b981]" />}
                      </div>
                    </CardTitle>
                    <p className="text-sm text-[#a3a3a3] mt-2">{plan.description}</p>
                    
                    <div className="mt-6">
                      {displayPrice !== null ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-white">${displayPrice}</span>
                            <span className="text-[#a3a3a3]">/month</span>
                          </div>
                          {savings && (
                            <p className="text-sm text-[#10b981] mt-1">
                              Save ${savings}/year with annual billing
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-4xl font-bold text-white">Custom</div>
                      )}
                      
                      {plan.overageCost && (
                        <p className="text-xs text-[#a3a3a3] mt-2">
                          Overage: {plan.overageCost}
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <Button
                      className={`w-full ${
                        plan.highlight
                          ? 'bg-[#00d4ff] hover:bg-[#00b4d8] text-black'
                          : 'bg-[#262626] hover:bg-[#333333] text-white'
                      }`}
                      onClick={() => {
                        if (plan.name === 'Enterprise') {
                          window.location.href = createPageUrl('Support');
                        } else if (!loading && !user) {
                          base44.auth.redirectToLogin(window.location.href);
                        }
                      }}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                        Features included:
                      </p>
                      {plan.features.map((feature, featureIdx) => (
                        <div key={featureIdx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-[#e5e5e5]">{feature}</span>
                        </div>
                      ))}
                      
                      {plan.limitations && (
                        <>
                          <p className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mt-4">
                            Limitations:
                          </p>
                          {plan.limitations.map((limitation, limitIdx) => (
                            <div key={limitIdx} className="flex items-start gap-2">
                              <div className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#6b7280]">•</div>
                              <span className="text-sm text-[#a3a3a3]">{limitation}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Crawlable FAQ section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#00d4ff]" />
                    What are "psychographic credits"?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[#a3a3a3]">
                  <p>
                    Credits measure AI processing for psychographic analysis. One credit typically equals:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>1 complete user profile generation or update</li>
                    <li>10 behavioral event captures and processing</li>
                    <li>1 AI-powered insight generation</li>
                    <li>1 personalized engagement evaluation</li>
                  </ul>
                  <p className="mt-2">
                    The Developer plan's 1,000 credits can analyze ~100 active users monthly with regular updates.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#00d4ff]" />
                    Can I start with Developer and upgrade later?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[#a3a3a3]">
                  <p>
                    Yes! The Developer plan is free forever and includes all core features for testing and small projects. 
                    When you upgrade to Growth or Pro, all your historical data, profiles, and configurations migrate automatically. 
                    There's no data loss or reconfiguration needed.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#00d4ff]" />
                    What happens if I exceed my credit limit?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[#a3a3a3]">
                  <p>
                    You won't be charged unexpectedly. On Growth and Pro plans, you'll receive email alerts at 80% and 95% usage. 
                    You can either:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Upgrade to the next tier for a higher monthly allocation</li>
                    <li>Purchase overage credits at $0.01-$0.02 each (auto-approved up to 20% over your limit)</li>
                    <li>Wait for your monthly reset</li>
                  </ul>
                  <p className="mt-2">
                    The Developer plan has a hard cap at 1,000 credits/month to keep the platform sustainable for free users.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#00d4ff]" />
                    Do you offer annual contracts with discounts?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[#a3a3a3]">
                  <p>
                    Yes! Annual billing provides a 10% discount on Growth and Pro plans. For Enterprise customers, 
                    we offer custom multi-year contracts with volume discounts, dedicated support, and flexible payment terms. 
                    Contact sales for a tailored quote.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#00d4ff]" />
                    What's included in "priority support"?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[#a3a3a3]">
                  <p>
                    Pro plan users get:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Dedicated Slack channel with our engineering team</li>
                    <li>&lt;4 hour response time during business hours</li>
                    <li>Monthly strategy calls with customer success</li>
                    <li>Early access to beta features</li>
                    <li>Custom integration assistance</li>
                  </ul>
                  <p className="mt-2">
                    Enterprise customers receive 24/7 support with SLA guarantees and a dedicated account manager.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <p className="text-[#a3a3a3] mb-4">
                Still have questions? We're here to help.
              </p>
              <Link to={createPageUrl('Support')}>
                <Button className="bg-[#00d4ff] hover:bg-[#00b4d8] text-black">
                  Contact Sales
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Full text disclaimer for crawlers */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="bg-[#0a0a0a] border-[#262626]">
              <CardContent className="pt-6">
                <h3 className="text-white font-semibold mb-2">Pricing Transparency & Performance Disclaimer</h3>
                <p className="text-xs text-[#6b7280] leading-relaxed">
                  All pricing shown in USD. Psychographic credit calculations are estimates and actual usage may vary based on 
                  implementation, event volume, and analysis depth. Performance improvements (e.g., "+67% ROAS", "+84% conversion rates") 
                  are based on limited case studies and are not guaranteed. Individual results depend on multiple factors including 
                  implementation quality, data accuracy, market conditions, and baseline performance. We recommend a minimum 90-day 
                  evaluation period before assessing ROI. Terms of Service and Performance Disclaimers must be accepted before platform access. 
                  knXw is committed to explainable AI, transparent pricing, and GDPR compliance. All plans include privacy-first data handling, 
                  PII hashing, and consent management. For detailed policy information, see our Privacy Policy and Terms of Service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}