import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, CheckCircle2, TrendingUp, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSanitize } from '@/components/utils/useSanitize';
import { createPageUrl } from '@/utils';
import SEOHead from '@/components/system/SEOHead';
import { logError } from '@/components/config/sentry';

const categoryColors = {
  "E-commerce": { from: "#06b6d4", to: "#0891b2" },
  "SaaS": { from: "#8b5cf6", to: "#7c3aed" },
  "Gaming": { from: "#f59e0b", to: "#d97706" },
  "EdTech": { from: "#10b981", to: "#059669" },
  "Healthcare": { from: "#ec4899", to: "#db2777" },
  "Marketing": { from: "#3b82f6", to: "#2563eb" },
  "Customer Service": { from: "#f97316", to: "#ea580c" },
  "Media": { from: "#a855f7", to: "#9333ea" },
};

export default function CaseStudyPage() {
  const location = useLocation();
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const slug = new URLSearchParams(location.search).get('slug');
  
  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    
    base44.entities.CaseStudy.filter({ slug, published: true })
      .then(studies => {
        if (studies.length > 0) {
          setCaseStudy(studies[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        logError(err, { context: 'Loading case study', slug });
        setLoading(false);
      });
  }, [slug]);
  
  const sanitizedChallenge = useSanitize(caseStudy?.challenge || '');
  const sanitizedSolution = useSanitize(caseStudy?.solution || '');
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!caseStudy) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Case Study Not Found</h1>
          <Link to={createPageUrl('Landing')}>
            <Button className="bg-cyan-500 hover:bg-cyan-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const colors = categoryColors[caseStudy.category] || { from: "#06b6d4", to: "#0891b2" };
  
  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead
        title={caseStudy ? `${caseStudy.title} - Case Study` : 'Case Study'}
        description={caseStudy?.challenge || 'Real-world case study showcasing the impact of psychographic intelligence'}
        keywords={`case study, ${caseStudy?.category || 'business intelligence'}, psychographic analysis, ${caseStudy?.company_name || 'customer success'}`}
      />
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1),transparent_60%)]" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Link to={createPageUrl('Landing')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span 
              className="text-sm font-mono uppercase tracking-wider mb-4 inline-block"
              style={{ color: colors.from }}
            >
              {caseStudy.category}
            </span>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">{caseStudy.title}</h1>
            
            <div className="flex items-baseline gap-4 mb-8">
              <span 
                className="text-6xl md:text-8xl font-bold"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {caseStudy.hero_stat}
              </span>
              <span className="text-2xl text-gray-400">{caseStudy.hero_stat_label}</span>
            </div>
            
            {caseStudy.company_name && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl">
                <h2 className="text-xl font-bold mb-2">{caseStudy.company_name}</h2>
                <p className="text-gray-400">{caseStudy.company_description}</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>
      
      {/* Challenge Section */}
      <section className="py-16 md:py-24 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-red-500" />
              <h2 className="text-3xl font-bold">The Challenge</h2>
            </div>
            <div 
              className="text-lg text-gray-300 leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedChallenge }}
            />
          </motion.div>
        </div>
      </section>
      
      {/* Solution Section */}
      <section className="py-16 md:py-24 bg-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <h2 className="text-3xl font-bold">The Solution</h2>
            </div>
            <div 
              className="text-lg text-gray-300 leading-relaxed prose prose-invert max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: sanitizedSolution }}
            />
            
            {caseStudy.implementation && caseStudy.implementation.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Implementation Highlights</h3>
                <ul className="space-y-3">
                  {caseStudy.implementation.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </section>
      
      {/* Results Section */}
      {caseStudy.results && caseStudy.results.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-12">
                <TrendingUp className="w-6 h-6 text-cyan-500" />
                <h2 className="text-3xl font-bold">The Results</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {caseStudy.results.map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="text-4xl font-bold mb-2" style={{ color: colors.from }}>
                      {result.value}
                    </div>
                    <div className="text-lg font-semibold mb-2 text-white">{result.metric}</div>
                    <p className="text-sm text-gray-400">{result.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Testimonial Section */}
      {caseStudy.testimonial && (
        <section className="py-16 md:py-24 bg-white/5">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Users className="w-8 h-8 text-cyan-500 mx-auto mb-6" />
              <blockquote className="text-2xl md:text-3xl font-light text-gray-300 mb-8 leading-relaxed">
                "{caseStudy.testimonial.quote}"
              </blockquote>
              <div>
                <div className="text-lg font-semibold text-white">{caseStudy.testimonial.author}</div>
                <div className="text-gray-400">{caseStudy.testimonial.role}</div>
              </div>
            </motion.div>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      <section className="py-24 md:py-32 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join companies seeing real results with psychographic intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = createPageUrl('Dashboard')}
              className="bg-cyan-500 hover:bg-cyan-600 text-black px-8 py-6 text-lg"
            >
              Get Started Free
            </Button>
            <Button 
              onClick={() => window.location.href = createPageUrl('Documentation')}
              className="bg-transparent border border-white/20 hover:bg-white/10 px-8 py-6 text-lg"
            >
              View Documentation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}