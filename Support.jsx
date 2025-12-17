
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  Brain,
  Shield,
  Zap,
  Settings,
  BarChart3,
  Users,
  CreditCard
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { SendEmail } from "@/api/integrations";

const FAQ_CATEGORIES = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: Zap,
    faqs: [
      {
        question: 'How do I get started with knXw?',
        answer: 'Getting started is simple! Sign up for a free account, install our JavaScript SDK on your website with one line of code, and start collecting psychographic insights immediately. Our onboarding guide will walk you through the setup process step-by-step.'
      },
      {
        question: 'What is psychographic intelligence?',
        answer: 'Psychographic intelligence goes beyond traditional demographics to understand the "why" behind user behavior. It analyzes personality traits, motivations, values, and cognitive styles to help you create more personalized and effective user experiences.'
      },
      {
        question: 'How long does it take to see results?',
        answer: 'You can start seeing basic psychographic profiles within hours of installation. More detailed insights and patterns typically emerge within 7-14 days as our AI analyzes user behavior patterns. Most customers see measurable improvements in engagement within 2-4 weeks.'
      },
      {
        question: 'Do I need technical knowledge to use knXw?',
        answer: 'No technical expertise required! While initial setup involves adding our tracking code, our platform is designed for marketers, product managers, and business users. Our visual interfaces make it easy to create segments, journeys, and analyze insights without coding.'
      }
    ]
  },
  {
    id: 'features',
    name: 'Features & Capabilities',
    icon: Settings,
    faqs: [
      {
        question: 'What features are included in each plan?',
        answer: 'Our Developer plan includes basic profiling and 1,000 monthly analyses. Growth adds advanced profiling, Journey Builder, and multi-channel engagement. Pro includes unlimited journeys, all engagement channels, and dedicated support. Enterprise offers custom features and dedicated infrastructure.'
      },
      {
        question: 'Can I create custom audience segments?',
        answer: 'Yes! Our Audience Builder lets you create precise segments using psychological traits, behavioral patterns, and motivational drivers. You can combine multiple conditions, preview segments in real-time, and use them across all engagement channels.'
      },
      {
        question: 'How does the Journey Builder work?',
        answer: 'Journey Builder is a visual drag-and-drop tool for creating automated user experiences. You can trigger journeys based on psychographic states, add conditional logic, wait periods, and multi-channel actions. Journeys adapt in real-time as user psychology evolves.'
      },
      {
        question: 'What integrations are available?',
        answer: 'knXw integrates with Google Analytics 4, HubSpot CRM, Google Ads, Meta CAPI, AWS, Azure, and more. We also provide webhook APIs and can sync psychographic data to your existing tools and databases.'
      }
    ]
  },
  {
    id: 'privacy',
    name: 'Privacy & Security',
    icon: Shield,
    faqs: [
      {
        question: 'How do you protect user privacy?',
        answer: 'Privacy is fundamental to knXw. We use privacy-first design principles, anonymize personal data, provide explainable AI, and are SOC2 ready. All data processing complies with GDPR, CCPA, and other privacy regulations.'
      },
      {
        question: 'Is the AI explainable?',
        answer: 'Absolutely! Our AI provides clear, human-readable explanations for every insight and decision. You can see exactly why a user was assigned specific traits, what evidence supports each conclusion, and how confidence scores are calculated.'
      },
      {
        question: 'Where is my data stored?',
        answer: 'Data is stored in secure, enterprise-grade infrastructure with encryption at rest and in transit. We offer data residency options and can export your data to your own AWS S3 or Azure Blob storage for maximum control.'
      },
      {
        question: 'Can users opt out of tracking?',
        answer: 'Yes, we provide comprehensive consent management tools. Users can opt out of psychographic tracking while still allowing basic functionality. We respect all privacy preferences and provide easy opt-out mechanisms.'
      }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics & Reporting',
    icon: BarChart3,
    faqs: [
      {
        question: 'What kind of reports can I generate?',
        answer: 'knXw provides executive dashboards, batch analytics reports, user segment analysis, journey performance metrics, and engagement analytics. Reports can be scheduled for automatic delivery via email or exported to S3/Azure.'
      },
      {
        question: 'How accurate are the psychological insights?',
        answer: 'Our AI models achieve high accuracy through multiple validation techniques. We provide confidence scores for all insights, use ensemble methods, and continuously improve based on behavioral outcomes. Accuracy typically ranges from 75-90% depending on data volume.'
      },
      {
        question: 'Can I export my data?',
        answer: 'Yes! You can export all your data including profiles, events, insights, and analytics. We support CSV, JSON, and direct integration with your data warehouse via AWS S3, Azure Blob, or API endpoints.'
      },
      {
        question: 'How do I measure ROI from psychographic insights?',
        answer: 'Track key metrics like conversion rate improvements, engagement lift, reduced churn, and increased customer lifetime value. Our platform provides attribution reporting to directly measure the impact of psychographically-driven campaigns and experiences.'
      }
    ]
  },
  {
    id: 'billing',
    name: 'Billing & Plans',
    icon: CreditCard,
    faqs: [
      {
        question: 'How does usage-based billing work?',
        answer: 'You pay for psychographic analyses performed. Each user interaction that generates or updates a psychological profile counts as one analysis. Your plan includes a monthly allocation, and overages are charged at $0.01-$0.02 per additional analysis.'
      },
      {
        question: 'Can I change my plan anytime?',
        answer: 'Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle. We offer prorated billing for plan changes.'
      },
      {
        question: 'Is there a free trial?',
        answer: 'Our Developer plan is free forever with 1,000 monthly analyses. For higher tiers, we offer a 14-day free trial with full access to all features. No credit card required to start.'
      },
      {
        question: 'What happens if I exceed my plan limits?',
        answer: 'Overage charges apply at $0.01-$0.02 per additional psychographic analysis. We\'ll notify you before you reach your limits and provide options to upgrade or purchase additional credits.'
      }
    ]
  },
  {
    id: 'technical',
    name: 'Technical Support',
    icon: Brain,
    faqs: [
      {
        question: 'How do I install the tracking code?',
        answer: 'Simply add our JavaScript snippet to your website\'s <head> section. The code is lightweight (~15KB) and loads asynchronously. We provide detailed installation guides for popular platforms like WordPress, Shopify, React, and more.'
      },
      {
        question: 'What if the AI insights seem incorrect?',
        answer: 'Our AI continuously learns and improves. If insights seem off, check the data quality, ensure sufficient interaction volume, and review the evidence provided. You can also provide feedback to help improve accuracy for your specific use case.'
      },
      {
        question: 'Do you provide API access?',
        answer: 'Yes! We provide REST APIs for profiles, events, insights, and segments. You can integrate knXw data into your applications, trigger engagements programmatically, and build custom analytics dashboards.'
      },
      {
        question: 'What browser compatibility is supported?',
        answer: 'Our tracking works on all modern browsers including Chrome, Firefox, Safari, and Edge. We support Internet Explorer 11+ and provide graceful degradation for older browsers without impacting user experience.'
      }
    ]
  }
];

const SUPPORT_PRIORITY = [
  { value: 'low', label: 'Low - General question', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium - Feature help', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High - Issue affecting usage', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical - Service down', color: 'bg-red-100 text-red-800' }
];

const SUPPORT_CATEGORIES = [
  { value: 'technical', label: 'Technical Issue' },
  { value: 'billing', label: 'Billing Question' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'integration', label: 'Integration Help' },
  { value: 'data', label: 'Data Question' },
  { value: 'other', label: 'Other' }
];

const FAQItem = ({ faq, isOpen, onToggle }) => (
  <Card className="border border-[#262626] bg-[#111111]">
    <CardHeader 
      className="cursor-pointer hover:bg-[#1a1a1a] transition-colors"
      onClick={onToggle}
    >
      <CardTitle className="flex items-center justify-between text-white text-base">
        {faq.question}
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </CardTitle>
    </CardHeader>
    {isOpen && (
      <CardContent className="pt-0">
        <p className="text-[#a3a3a3] leading-relaxed">{faq.answer}</p>
      </CardContent>
    )}
  </Card>
);

const generateTicketNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `KNXW-${timestamp}-${random}`;
};

export default function SupportPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('getting-started');
  const [openFAQs, setOpenFAQs] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    category: '',
    priority: 'medium',
    subject: '',
    description: ''
  });

  const toggleFAQ = (questionId) => {
    setOpenFAQs(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.description) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    const ticketNumber = generateTicketNumber();

    try {
      const priorityLabel = SUPPORT_PRIORITY.find(p => p.value === formData.priority)?.label || formData.priority;
      const categoryLabel = SUPPORT_CATEGORIES.find(c => c.value === formData.category)?.label || formData.category;

      const emailContent = `
New Support Ticket: ${ticketNumber}

Customer Information:
- Name: ${formData.name}
- Email: ${formData.email}
- Company: ${formData.company || 'Not provided'}

Ticket Details:
- Category: ${categoryLabel}
- Priority: ${priorityLabel}
- Subject: ${formData.subject}

Description:
${formData.description}

---
Ticket Number: ${ticketNumber}
Submitted: ${new Date().toLocaleString()}
      `;

      await SendEmail({
        to: 'support@knxw.app',
        subject: `[${ticketNumber}] ${formData.subject}`,
        body: emailContent
      });

      // Send confirmation email to customer
      const confirmationEmail = `
Dear ${formData.name},

Thank you for contacting knXw support. We have received your support request and assigned it ticket number: ${ticketNumber}

Your request details:
- Subject: ${formData.subject}
- Priority: ${priorityLabel}
- Category: ${categoryLabel}

Our support team will review your request and respond within:
- Critical issues: 1 hour
- High priority: 4 hours  
- Medium priority: 24 hours
- Low priority: 48 hours

You can reference this ticket number (${ticketNumber}) in any follow-up communications.

Best regards,
knXw Support Team
support@knxw.app
      `;

      await SendEmail({
        to: formData.email,
        subject: `knXw Support - Ticket ${ticketNumber} Received`,
        body: confirmationEmail
      });

      toast({
        title: "Support ticket submitted!",
        description: `Your ticket number is ${ticketNumber}. Check your email for confirmation.`
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        category: '',
        priority: 'medium',
        subject: '',
        description: ''
      });

    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast({
        title: "Error submitting ticket",
        description: "Please try again or email us directly at support@knxw.app",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFAQs = FAQ_CATEGORIES.flatMap(category => 
    category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(faq => ({ ...faq, categoryId: category.id }))
  );

  const currentCategory = FAQ_CATEGORIES.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            How can we help?
          </h1>
          <p className="text-xl text-[#a3a3a3] max-w-3xl mx-auto mb-8">
            Get support, find answers, and connect with our team. We're here to help you succeed with psychographic intelligence.
          </p>
          <div className="text-center">
            <p className="text-[#a3a3a3] text-lg">
              Responses are provided in the order requests are received within 24-48 hours.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#111111] border-[#262626] text-white"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-8">
                {FAQ_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id 
                      ? "bg-[#00d4ff] text-[#0a0a0a] hover:bg-[#38bdf8]" 
                      : "border-[#404040] text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]"
                    }
                  >
                    <category.icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* FAQs */}
              <div className="space-y-4">
                {searchQuery ? (
                  // Show filtered results
                  filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq, index) => (
                      <FAQItem
                        key={`search-${index}`}
                        faq={faq}
                        isOpen={openFAQs[`search-${index}`]}
                        onToggle={() => toggleFAQ(`search-${index}`)}
                      />
                    ))
                  ) : (
                    <Card className="border border-[#262626] bg-[#111111]">
                      <CardContent className="p-8 text-center">
                        <HelpCircle className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
                        <p className="text-[#a3a3a3]">Try different keywords or contact us directly.</p>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  // Show category FAQs
                  currentCategory?.faqs.map((faq, index) => (
                    <FAQItem
                      key={`${selectedCategory}-${index}`}
                      faq={faq}
                      isOpen={openFAQs[`${selectedCategory}-${index}`]}
                      onToggle={() => toggleFAQ(`${selectedCategory}-${index}`)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="bg-[#111111] border-[#262626] sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageSquare className="w-5 h-5" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Your Name *"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="bg-[#1a1a1a] border-[#404040] text-white"
                      required
                    />
                  </div>

                  <div>
                    <Input
                      type="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="bg-[#1a1a1a] border-[#404040] text-white"
                      required
                    />
                  </div>

                  <div>
                    <Input
                      placeholder="Company (Optional)"
                      value={formData.company}
                      onChange={(e) => handleFormChange('company', e.target.value)}
                      className="bg-[#1a1a1a] border-[#404040] text-white"
                    />
                  </div>

                  <div>
                    <Select value={formData.category} onValueChange={(value) => handleFormChange('category', value)}>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#404040] text-white">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORT_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select value={formData.priority} onValueChange={(value) => handleFormChange('priority', value)}>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#404040] text-white">
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORT_PRIORITY.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Input
                      placeholder="Subject *"
                      value={formData.subject}
                      onChange={(e) => handleFormChange('subject', e.target.value)}
                      className="bg-[#1a1a1a] border-[#404040] text-white"
                      required
                    />
                  </div>

                  <div>
                    <Textarea
                      placeholder="Describe your issue or question *"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      className="bg-[#1a1a1a] border-[#404040] text-white min-h-[120px]"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-[#0a0a0a] font-bold"
                  >
                    {isSubmitting ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Ticket
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-[#262626]">
                  <div className="flex items-center gap-2 text-sm text-[#a3a3a3] mb-2">
                    <Mail className="w-4 h-4" />
                    Direct Email
                  </div>
                  <a 
                    href="mailto:support@knxw.app" 
                    className="text-[#00d4ff] hover:text-[#38bdf8] transition-colors"
                  >
                    support@knxw.app
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
