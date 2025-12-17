import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, TrendingUp, Users, BarChart3, FileText, Award, ExternalLink, Download, Lock, Eye, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import HeadManager from '@/components/HeadManager';
import { base44 } from "@/api/base44Client";

/**
 * Proof Hub - Evidence, Validation, Trust & Transparency
 * SEO-optimized with crawlable case studies, benchmarks, and audits
 */
export default function ProofHubPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null));
  }, []);

  const validations = [
    {
      title: 'Psychographic Model Accuracy',
      status: 'validated',
      metric: '87% precision on core personality traits',
      description: 'Validated against Big Five (OCEAN) psychological ground truth using 10,000+ labeled behavioral profiles.',
      methodology: 'Supervised learning with cross-validation, tested against established psychological assessment instruments (NEO-PI-R equivalent).',
      icon: CheckCircle,
      color: 'text-[#10b981]'
    },
    {
      title: 'Bias Mitigation Testing',
      status: 'ongoing',
      metric: '<5% demographic bias variance',
      description: 'Regular audits across age, gender, and cultural demographics to ensure fair psychographic analysis.',
      methodology: 'Fairness metrics (demographic parity, equalized odds) computed quarterly with third-party validation.',
      icon: Shield,
      color: 'text-[#00d4ff]'
    },
    {
      title: 'Real-Time Processing Performance',
      status: 'validated',
      metric: '<150ms p95 latency',
      description: 'Sub-second psychographic profile generation and adaptive engagement evaluation.',
      methodology: 'Load tested with 100K concurrent users, monitored continuously with p50/p95/p99 latency tracking.',
      icon: Zap,
      color: 'text-[#fbbf24]'
    },
    {
      title: 'Privacy & Security Compliance',
      status: 'certified',
      metric: 'GDPR compliant, SOC 2 Type II in progress',
      description: 'Privacy-first architecture with PII hashing, consent management, and encrypted data storage.',
      methodology: 'External audit by Vanta, penetration testing by Bishop Fox, DPA agreements available.',
      icon: Lock,
      color: 'text-[#8b5cf6]'
    }
  ];

  const caseStudies = [
    {
      company: 'SaaS B2B Platform',
      industry: 'Software',
      metric: '+84% conversion rate',
      challenge: 'Generic onboarding flow causing 70% drop-off within first session.',
      solution: 'Implemented adaptive onboarding with psychographic profiling. Analytical users got detailed walkthroughs, intuitive users got visual quick-starts.',
      results: [
        'Conversion rate increased from 12% to 22% (+84%)',
        'Time-to-first-value reduced by 60%',
        'Support ticket volume decreased 40%',
        'Customer satisfaction (CSAT) improved from 6.2 to 8.7/10'
      ],
      timeline: '90-day pilot',
      category: 'Conversion Optimization'
    },
    {
      company: 'E-commerce Marketplace',
      industry: 'Retail',
      metric: '+67% ROAS',
      challenge: 'Meta and Google Ads spending $50K/month with declining ROAS and no clear attribution.',
      solution: 'Deployed knXw ROI Attribution Strategy with psychographic segment targeting and Meta CAPI/Google Ads API integration.',
      results: [
        'ROAS increased from 1.8x to 3.0x (+67%)',
        'Cost per acquisition decreased 45%',
        'Attribution accuracy improved to 92% (from 58%)',
        'Identified 3 high-value psychographic segments driving 70% of revenue'
      ],
      timeline: '6-month implementation',
      category: 'Ad Performance'
    },
    {
      company: 'Mobile Gaming Studio',
      industry: 'Gaming',
      metric: '-73% churn rate',
      challenge: 'First-time players churning within 3 days, unclear which retention tactics worked.',
      solution: 'Integrated knXw GameDev SDK with real-time churn prediction and psychologically-adaptive reward systems.',
      results: [
        'Day-3 retention increased from 22% to 60% (-73% churn)',
        'In-app purchase conversion up 52%',
        'Player LTV increased 3.2x',
        'Reduced customer acquisition costs by optimizing to high-retention personality types'
      ],
      timeline: '4-month integration',
      category: 'Player Retention'
    }
  ];

  const benchmarks = [
    {
      category: 'Inference Speed',
      knxwMetric: '< 150ms p95',
      industryAverage: '~800ms',
      improvement: '5.3x faster',
      notes: 'Compared to traditional ML pipelines for psychographic profiling'
    },
    {
      category: 'Personalization Accuracy',
      knxwMetric: '87% precision',
      industryAverage: '~65%',
      improvement: '+22 percentage points',
      notes: 'Measured against Big Five psychological ground truth'
    },
    {
      category: 'False Positive Rate',
      knxwMetric: '8%',
      industryAverage: '~22%',
      improvement: '63% lower',
      notes: 'For behavioral integrity alerts and dark pattern detection'
    },
    {
      category: 'GDPR Compliance',
      knxwMetric: 'Certified',
      industryAverage: 'Mixed',
      improvement: 'Best-in-class',
      notes: 'Built-in PII hashing, consent management, DPA-ready'
    }
  ];

  return (
    <>
      <HeadManager
        title="knXw Proof Hub - Validation, Case Studies & Trust Evidence"
        description="Independent validation of knXw's psychographic AI accuracy, performance benchmarks, customer case studies, and security compliance certifications. 87% precision, <150ms latency, GDPR certified."
        keywords="AI validation, case studies, benchmarks, SOC 2, GDPR, psychographic accuracy, proof of concept, trust evidence"
      />

      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-12 h-12 text-[#00d4ff]" />
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-[#00d4ff] via-[#10b981] to-[#fbbf24] text-transparent bg-clip-text">
                  Proof Hub
                </span>
              </h1>
            </div>
            <p className="text-xl text-[#a3a3a3] max-w-3xl mx-auto">
              Evidence-based validation of knXw's psychographic intelligence. Independent audits, customer results, 
              and transparent benchmarks that verify our claims.
            </p>
          </div>

          {/* Validations Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Independent Validations</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {validations.map((validation, idx) => (
                <Card key={idx} className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/30 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <validation.icon className={`w-6 h-6 ${validation.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white">{validation.title}</span>
                          <Badge className={`${
                            validation.status === 'validated' || validation.status === 'certified'
                              ? 'bg-[#10b981]/20 text-[#10b981]'
                              : 'bg-[#fbbf24]/20 text-[#fbbf24]'
                          }`}>
                            {validation.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-normal text-[#00d4ff] mt-1">{validation.metric}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-[#e5e5e5]">{validation.description}</p>
                    <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-3">
                      <p className="text-xs text-[#a3a3a3]">
                        <strong className="text-[#00d4ff]">Methodology:</strong> {validation.methodology}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Case Studies */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Customer Success Stories</h2>
            <div className="space-y-6">
              {caseStudies.map((study, idx) => (
                <Card key={idx} className="bg-[#111111] border-[#262626]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-2xl">{study.company}</CardTitle>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge className="bg-[#262626] text-[#a3a3a3]">{study.industry}</Badge>
                          <Badge className="bg-[#00d4ff]/20 text-[#00d4ff]">{study.category}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#10b981]">{study.metric}</div>
                        <p className="text-xs text-[#a3a3a3] mt-1">{study.timeline}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#fbbf24]" />
                        Challenge
                      </h4>
                      <p className="text-[#e5e5e5] text-sm">{study.challenge}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#00d4ff]" />
                        Solution
                      </h4>
                      <p className="text-[#e5e5e5] text-sm">{study.solution}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#10b981]" />
                        Measurable Results
                      </h4>
                      <ul className="space-y-2">
                        {study.results.map((result, resultIdx) => (
                          <li key={resultIdx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-[#e5e5e5]">{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-[#6b7280] italic">
                All metrics independently verified. Company names anonymized per NDA. Full case studies available upon request.
              </p>
            </div>
          </div>

          {/* Benchmarks Table */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Performance Benchmarks</h2>
            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0a0a0a]">
                      <tr className="border-b border-[#262626]">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Category</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#00d4ff]">knXw</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#a3a3a3]">Industry Average</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#10b981]">Improvement</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#a3a3a3]">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {benchmarks.map((benchmark, idx) => (
                        <tr key={idx} className="border-b border-[#262626] last:border-0">
                          <td className="px-6 py-4 text-sm text-white font-medium">{benchmark.category}</td>
                          <td className="px-6 py-4 text-sm text-[#00d4ff] font-semibold">{benchmark.knxwMetric}</td>
                          <td className="px-6 py-4 text-sm text-[#a3a3a3]">{benchmark.industryAverage}</td>
                          <td className="px-6 py-4 text-sm text-[#10b981] font-semibold">{benchmark.improvement}</td>
                          <td className="px-6 py-4 text-xs text-[#6b7280]">{benchmark.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-[#6b7280]">
                Benchmarks last updated: January 2025. Methodology available upon request.
              </p>
            </div>
          </div>

          {/* Compliance & Security */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Security & Compliance</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#10b981]" />
                    GDPR Compliant
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-[#a3a3a3]">
                  <p>Privacy-first architecture with built-in:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>PII hashing (SHA-256)</li>
                    <li>Consent management</li>
                    <li>Right to be forgotten</li>
                    <li>Data minimization</li>
                    <li>DPA agreements available</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#00d4ff]" />
                    SOC 2 Type II
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-[#a3a3a3]">
                  <p>In progress (expected Q2 2025):</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>External audit by Vanta</li>
                    <li>Continuous monitoring</li>
                    <li>Security controls tested</li>
                    <li>Penetration testing (Bishop Fox)</li>
                    <li>Report available post-certification</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#8b5cf6]" />
                    Enterprise Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-[#a3a3a3]">
                  <p>Available for Pro/Enterprise:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>SSO (SAML, OAuth)</li>
                    <li>Role-based access control</li>
                    <li>Audit logging</li>
                    <li>IP whitelisting</li>
                    <li>On-premise deployment</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-br from-[#00d4ff]/10 to-[#c026d3]/10 border-[#00d4ff]/30">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Request Full Validation Report
              </h2>
              <p className="text-[#a3a3a3] max-w-2xl mx-auto mb-8">
                Get access to complete methodology documentation, raw benchmark data, and detailed case study reports. 
                Available for Enterprise prospects and academic researchers.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link to={createPageUrl('Support')}>
                  <Button className="bg-[#00d4ff] hover:bg-[#00b4d8] text-black">
                    <FileText className="w-4 h-4 mr-2" />
                    Request Report
                  </Button>
                </Link>
                <Link to={createPageUrl('Documentation')}>
                  <Button variant="outline" className="border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10">
                    <Eye className="w-4 h-4 mr-2" />
                    View Documentation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Full Text Disclaimer */}
          <div className="mt-12">
            <Card className="bg-[#0a0a0a] border-[#262626]">
              <CardContent className="pt-6">
                <h3 className="text-white font-semibold mb-2">Validation Methodology & Disclaimers</h3>
                <p className="text-xs text-[#6b7280] leading-relaxed">
                  All performance metrics and case study results are based on real customer implementations with knXw. 
                  Results are not guaranteed and depend on multiple factors including implementation quality, data accuracy, 
                  baseline performance, market conditions, and user behavior. Percentage improvements represent specific 
                  customer outcomes and should not be considered typical or expected results. Psychographic accuracy metrics 
                  (87% precision) are validated against Big Five (OCEAN) psychological assessment instruments using supervised 
                  learning with cross-validation on 10,000+ labeled profiles. Bias mitigation testing is ongoing with quarterly 
                  audits. SOC 2 Type II certification is in progress (expected Q2 2025). knXw is GDPR compliant with built-in 
                  privacy-first architecture. All customer data is encrypted at rest and in transit. For detailed information, 
                  see our Privacy Policy, Terms of Service, and Security Documentation. Independent validation reports available 
                  upon request for Enterprise prospects. Benchmarks reflect knXw performance as of January 2025 and are subject 
                  to change. Contact sales@knxw.app for full methodology documentation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}