import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, FileText, Mail } from 'lucide-react';
import HeadManager from '@/components/HeadManager';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * SEO-optimized, crawlable Privacy Policy
 */
export default function PrivacyPage() {
  return (
    <>
      <HeadManager
        title="knXw Privacy Policy - Data Protection, GDPR Compliance & User Rights"
        description="Comprehensive privacy policy for knXw psychographic analytics platform. GDPR compliant, privacy-first architecture, PII hashing, consent management, and data protection practices."
        keywords="privacy policy, GDPR, data protection, user privacy, consent management, data security"
      />

      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-10 h-10 text-[#00d4ff]" />
              <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
            </div>
            <p className="text-[#a3a3a3] text-lg">
              Last Updated: January 1, 2025
            </p>
            <p className="text-[#a3a3a3] mt-4">
              knXw ("we," "our," or "us") is committed to protecting your privacy and ensuring transparency 
              in how we collect, use, and safeguard your data. This Privacy Policy explains our practices 
              for the knXw psychographic analytics platform ("Service").
            </p>
          </div>

          {/* Quick Links */}
          <Card className="bg-[#111111] border-[#262626] mb-8">
            <CardHeader>
              <CardTitle className="text-white">Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <a href="#data-collection" className="text-[#00d4ff] hover:underline">1. Data We Collect</a>
                <a href="#data-usage" className="text-[#00d4ff] hover:underline">2. How We Use Data</a>
                <a href="#data-sharing" className="text-[#00d4ff] hover:underline">3. Data Sharing & Disclosure</a>
                <a href="#data-security" className="text-[#00d4ff] hover:underline">4. Security Measures</a>
                <a href="#user-rights" className="text-[#00d4ff] hover:underline">5. Your Rights (GDPR)</a>
                <a href="#data-retention" className="text-[#00d4ff] hover:underline">6. Data Retention</a>
                <a href="#cookies" className="text-[#00d4ff] hover:underline">7. Cookies & Tracking</a>
                <a href="#contact" className="text-[#00d4ff] hover:underline">8. Contact Us</a>
              </div>
            </CardContent>
          </Card>

          {/* Section 1: Data Collection */}
          <section id="data-collection" className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-[#00d4ff]" />
              1. Data We Collect
            </h2>
            
            <Card className="bg-[#111111] border-[#262626] mb-6">
              <CardHeader>
                <CardTitle className="text-white text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="text-[#a3a3a3] space-y-2">
                <p><strong className="text-white">What we collect:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Email address (required for authentication)</li>
                  <li>Full name (optional, for personalization)</li>
                  <li>Company name (optional, for B2B features)</li>
                  <li>Billing information (processed securely via Stripe, never stored directly)</li>
                </ul>
                <p className="mt-4"><strong className="text-white">Lawful Basis:</strong> Contract performance (GDPR Art. 6(1)(b))</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#262626] mb-6">
              <CardHeader>
                <CardTitle className="text-white text-lg">Behavioral & Psychographic Data</CardTitle>
              </CardHeader>
              <CardContent className="text-[#a3a3a3] space-y-2">
                <p><strong className="text-white">What we collect:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Event data: page views, clicks, scrolls, form interactions, time on page</li>
                  <li>Device information: user agent, screen resolution, viewport size</li>
                  <li>Session data: session ID, timestamp, referrer URL</li>
                  <li>Derived psychographic profiles: motivation, cognitive style, risk profile, emotional state (AI-generated)</li>
                </ul>
                <p className="mt-4"><strong className="text-white">Privacy-First Processing:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All user IDs are SHA-256 hashed before storage</li>
                  <li>No personally identifiable information (PII) is stored in raw form</li>
                  <li>IP addresses are anonymized (last octet removed)</li>
                  <li>Data minimization: only behavior necessary for analysis is captured</li>
                </ul>
                <p className="mt-4"><strong className="text-white">Lawful Basis:</strong> Legitimate interest (GDPR Art. 6(1)(f)) for platform functionality; Consent (GDPR Art. 6(1)(a)) for enhanced psychographic analysis</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#262626]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Technical & Usage Data</CardTitle>
              </CardHeader>
              <CardContent className="text-[#a3a3a3] space-y-2">
                <p><strong className="text-white">What we collect:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Log data: API requests, response times, error logs</li>
                  <li>Performance metrics: latency, throughput, system health</li>
                  <li>Usage analytics: feature adoption, dashboard views, integration usage</li>
                </ul>
                <p className="mt-4"><strong className="text-white">Lawful Basis:</strong> Legitimate interest for system security, performance optimization, and service improvement</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 2: Data Usage */}
          <section id="data-usage" className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-[#00d4ff]" />
              2. How We Use Your Data
            </h2>
            
            <div className="bg-[#111111] border border-[#262626] rounded-lg p-6 space-y-4 text-[#a3a3a3]">
              <p><strong className="text-white">We use collected data for the following purposes:</strong></p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-semibold mb-1">Service Provision</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Generate psychographic profiles for end-users of your applications</li>
                    <li>Provide real-time behavioral analytics and insights</li>
                    <li>Enable adaptive engagement and personalization features</li>
                    <li>Power AI-driven recommendations and content optimization</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-1">Platform Improvement</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Train and refine AI models (only with aggregated, anonymized data)</li>
                    <li>Improve accuracy of psychographic inference</li>
                    <li>Optimize system performance and reliability</li>
                    <li>Develop new features based on usage patterns</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-1">Security & Compliance</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Detect and prevent fraud, abuse, and policy violations</li>
                    <li>Maintain audit logs for compliance purposes</li>
                    <li>Respond to legal requests and regulatory obligations</li>
                    <li>Enforce our Terms of Service</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-1">Communication</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Send essential service notifications (downtime, security alerts)</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Share product updates and feature announcements (opt-in)</li>
                  </ul>
                </div>
              </div>

              <p className="text-sm italic bg-[#0a0a0a] border border-[#262626] rounded p-3 mt-4">
                <strong className="text-[#00d4ff]">Important:</strong> We NEVER sell your data to third parties. 
                We NEVER use your data for advertising purposes unrelated to knXw services.
              </p>
            </div>
          </section>

          {/* Section 3: Data Sharing */}
          <section id="data-sharing" className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Data Sharing & Disclosure
            </h2>
            
            <div className="space-y-4 text-[#a3a3a3]">
              <p>We share data only in limited circumstances:</p>

              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <h4 className="text-white font-semibold mb-1">Service Providers (Processors)</h4>
                    <p className="text-sm">We engage trusted third-party providers who process data on our behalf:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                      <li><strong>AWS:</strong> Cloud infrastructure & storage (DPA in place)</li>
                      <li><strong>Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
                      <li><strong>OpenAI:</strong> LLM inference for psychographic analysis (no PII shared, prompts are anonymized)</li>
                      <li><strong>Resend:</strong> Transactional email delivery</li>
                    </ul>
                    <p className="text-xs mt-2">All processors are bound by Data Processing Agreements (DPAs) and cannot use your data for their own purposes.</p>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-1">Legal Obligations</h4>
                    <p className="text-sm">We may disclose data when required by law:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                      <li>In response to valid legal process (subpoenas, court orders)</li>
                      <li>To protect rights, property, or safety of knXw, users, or the public</li>
                      <li>To comply with regulatory requirements</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-1">Business Transfers</h4>
                    <p className="text-sm">In the event of a merger, acquisition, or sale of assets, user data may be transferred to the acquiring entity. Users will be notified via email and given the option to delete their data before transfer.</p>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-1">With Your Consent</h4>
                    <p className="text-sm">We will share data with third parties only when you explicitly consent (e.g., enabling CRM integrations like HubSpot).</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 4: Security */}
          <section id="data-security" className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-[#00d4ff]" />
              4. Security Measures
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white text-base">Encryption</CardTitle>
                </CardHeader>
                <CardContent className="text-[#a3a3a3] text-sm space-y-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>TLS 1.3 for data in transit</li>
                    <li>AES-256 encryption for data at rest</li>
                    <li>End-to-end encryption for sensitive API keys</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white text-base">Access Controls</CardTitle>
                </CardHeader>
                <CardContent className="text-[#a3a3a3] text-sm space-y-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Role-based access control (RBAC)</li>
                    <li>Multi-factor authentication (MFA) for admin accounts</li>
                    <li>Principle of least privilege</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white text-base">Monitoring & Auditing</CardTitle>
                </CardHeader>
                <CardContent className="text-[#a3a3a3] text-sm space-y-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Continuous security monitoring</li>
                    <li>Automated vulnerability scanning</li>
                    <li>Comprehensive audit logging</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-[#262626]">
                <CardHeader>
                  <CardTitle className="text-white text-base">Compliance</CardTitle>
                </CardHeader>
                <CardContent className="text-[#a3a3a3] text-sm space-y-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>GDPR compliant (EU representative available)</li>
                    <li>SOC 2 Type II in progress (Q2 2025)</li>
                    <li>Regular penetration testing</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <p className="text-sm text-[#a3a3a3] mt-4 italic">
              While we implement industry-standard security measures, no system is 100% secure. 
              We encourage users to use strong passwords and enable MFA.
            </p>
          </section>

          {/* Section 5: User Rights (GDPR) */}
          <section id="user-rights" className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              5. Your Rights Under GDPR
            </h2>
            
            <div className="bg-[#111111] border border-[#262626] rounded-lg p-6 space-y-4 text-[#a3a3a3]">
              <p>If you are an EU resident, you have the following rights:</p>

              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-semibold">✓ Right to Access (Art. 15)</h4>
                  <p className="text-sm">Request a copy of all personal data we hold about you.</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold">✓ Right to Rectification (Art. 16)</h4>
                  <p className="text-sm">Correct inaccurate or incomplete data.</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold">✓ Right to Erasure / "Right to be Forgotten" (Art. 17)</h4>
                  <p className="text-sm">Request deletion of your data. We will comply within 30 days unless we have a legal obligation to retain it.</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold">✓ Right to Restrict Processing (Art. 18)</h4>
                  <p className="text-sm">Limit how we use your data while a complaint or correction request is being resolved.</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold">✓ Right to Data Portability (Art. 20)</h4>
                  <p className="text-sm">Receive your data in a structured, machine-readable format (JSON, CSV).</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold">✓ Right to Object (Art. 21)</h4>
                  <p className="text-sm">Object to processing based on legitimate interests or for direct marketing.</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold">✓ Right to Withdraw Consent (Art. 7(3))</h4>
                  <p className="text-sm">Withdraw consent for data processing at any time (does not affect the lawfulness of processing before withdrawal).</p>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-[#262626] rounded p-4 mt-4">
                <h4 className="text-[#00d4ff] font-semibold mb-2">How to Exercise Your Rights</h4>
                <p className="text-sm">Email us at <a href="mailto:privacy@knxw.app" className="text-[#00d4ff] underline">privacy@knxw.app</a> with your request. We will respond within 30 days.</p>
                <p className="text-sm mt-2">You also have the right to lodge a complaint with your local Data Protection Authority.</p>
              </div>
            </div>
          </section>

          {/* Section 6: Data Retention */}
          <section id="data-retention" className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              6. Data Retention
            </h2>
            
            <div className="space-y-4 text-[#a3a3a3]">
              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="pt-6">
                  <table className="w-full text-sm">
                    <thead className="border-b border-[#262626]">
                      <tr>
                        <th className="text-left py-2 text-white">Data Type</th>
                        <th className="text-left py-2 text-white">Retention Period</th>
                        <th className="text-left py-2 text-white">Rationale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]">
                      <tr>
                        <td className="py-2">Account Information</td>
                        <td className="py-2">Duration of account + 90 days</td>
                        <td className="py-2">Service provision, recovery period</td>
                      </tr>
                      <tr>
                        <td className="py-2">Behavioral Event Data</td>
                        <td className="py-2">90 days (configurable up to 365 days)</td>
                        <td className="py-2">Real-time analytics, trend analysis</td>
                      </tr>
                      <tr>
                        <td className="py-2">Psychographic Profiles</td>
                        <td className="py-2">Duration of account + 30 days</td>
                        <td className="py-2">Service continuity, profile accuracy</td>
                      </tr>
                      <tr>
                        <td className="py-2">Audit Logs</td>
                        <td className="py-2">7 years</td>
                        <td className="py-2">Legal/regulatory compliance</td>
                      </tr>
                      <tr>
                        <td className="py-2">Billing Records</td>
                        <td className="py-2">7 years</td>
                        <td className="py-2">Tax and accounting requirements</td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="text-xs mt-4">
                    After the retention period, data is securely deleted (overwrite + cryptographic erasure). 
                    Anonymized, aggregated data used for research may be retained indefinitely.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 7: Cookies */}
          <section id="cookies" className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              7. Cookies & Tracking Technologies
            </h2>
            
            <div className="space-y-4 text-[#a3a3a3]">
              <p>We use cookies and similar technologies for:</p>

              <Card className="bg-[#111111] border-[#262626]">
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <h4 className="text-white font-semibold">Essential Cookies</h4>
                    <p className="text-sm">Required for authentication, session management, and security. Cannot be disabled.</p>
                    <ul className="list-disc list-inside text-sm mt-1">
                      <li><code>session_id</code> - User session tracking</li>
                      <li><code>csrf_token</code> - Security protection</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold">Analytics Cookies</h4>
                    <p className="text-sm">Used to understand platform usage and improve features. Requires consent.</p>
                    <ul className="list-disc list-inside text-sm mt-1">
                      <li><code>knxw_analytics</code> - Anonymous usage tracking</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold">Preference Cookies</h4>
                    <p className="text-sm">Remember your settings and preferences.</p>
                    <ul className="list-disc list-inside text-sm mt-1">
                      <li><code>theme</code> - UI theme preference</li>
                      <li><code>sidebar_collapsed</code> - Layout preference</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <p className="text-sm">
                You can manage cookie preferences via your browser settings. Disabling essential cookies may impact functionality.
              </p>
            </div>
          </section>

          {/* Section 8: Contact */}
          <section id="contact" className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-[#00d4ff]" />
              8. Contact Us
            </h2>
            
            <Card className="bg-[#111111] border-[#262626]">
              <CardContent className="pt-6 space-y-4 text-[#a3a3a3]">
                <p>For privacy-related inquiries, data requests, or to exercise your rights:</p>
                
                <div className="bg-[#0a0a0a] border border-[#262626] rounded p-4">
                  <p className="text-white font-semibold mb-2">Data Protection Officer (DPO)</p>
                  <p className="text-sm">Email: <a href="mailto:privacy@knxw.app" className="text-[#00d4ff] underline">privacy@knxw.app</a></p>
                  <p className="text-sm mt-1">Mailing Address: knXw, Inc., 548 Market St, PMB 66133, San Francisco, CA 94104-5401</p>
                </div>

                <p className="text-sm">
                  We aim to respond to all requests within 30 days. For urgent security or privacy concerns, 
                  please mark your email as "URGENT."
                </p>

                <div className="flex gap-4 mt-4">
                  <Link to={createPageUrl('Terms')}>
                    <button className="text-[#00d4ff] hover:underline text-sm">View Terms of Service →</button>
                  </Link>
                  <Link to={createPageUrl('Support')}>
                    <button className="text-[#00d4ff] hover:underline text-sm">Contact Support →</button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              Changes to This Privacy Policy
            </h2>
            
            <div className="bg-[#111111] border border-[#262626] rounded-lg p-6 text-[#a3a3a3]">
              <p className="mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices, 
                technology, legal requirements, or other factors.
              </p>
              <p className="mb-4">
                <strong className="text-white">Material changes</strong> (e.g., changes in data sharing practices) will be communicated via:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Email notification to all users</li>
                <li>Prominent notice on the knXw dashboard</li>
                <li>30-day notice period before changes take effect</li>
              </ul>
              <p>
                Continued use of the Service after changes take effect constitutes acceptance of the updated policy. 
                If you do not agree, you may delete your account before the effective date.
              </p>
            </div>
          </section>

          {/* Footer Note */}
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 text-center">
            <p className="text-[#a3a3a3] text-sm">
              This Privacy Policy was last updated on <strong className="text-white">January 1, 2025</strong>. 
              Version 1.3. Previous versions available upon request.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}