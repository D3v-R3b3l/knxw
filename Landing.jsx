import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroShader from '@/components/landing/HeroShader';
import SEOHead from '@/components/system/SEOHead';
import { ArrowDown } from 'lucide-react';
import PhilosophySection from '@/components/landing/PhilosophySection';
import PlatformFeatures from '@/components/landing/PlatformFeatures';
import IntegrationsMarquee from '@/components/landing/IntegrationsMarquee';
import UseCasesGrid from '@/components/landing/UseCasesGrid';
import AnimatedStats from '@/components/landing/AnimatedStats';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import FooterSection from '@/components/landing/FooterSection';
import CustomCursor from '@/components/ui/CustomCursor';
import { ConsentProvider } from '@/components/privacy/ConsentManager';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { base44 } from "@/api/base44Client";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { HelmetProvider } from 'react-helmet-async';

function HeroContent({ heroRef }) {
  const contentRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const heroSection = heroRef?.current;
    const content = contentRef.current;

    if (heroSection && content) {
      // Hero content parallax with scale and opacity
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 0.5
        }
      });

      // Layer 1 - Title (slowest, scales down)
      tl.to(content.querySelectorAll('[data-parallax-layer="1"]'), {
        yPercent: 50,
        scale: 0.9,
        opacity: 0,
        ease: "none"
      }, 0);

      // Layer 2 - Description
      tl.to(content.querySelectorAll('[data-parallax-layer="2"]'), {
        yPercent: 70,
        scale: 0.85,
        opacity: 0,
        ease: "none"
      }, 0);

      // Layer 3 - Buttons
      tl.to(content.querySelectorAll('[data-parallax-layer="3"]'), {
        yPercent: 90,
        scale: 0.8,
        opacity: 0,
        ease: "none"
      }, 0);

      // Layer 4 - Tags (fastest)
      tl.to(content.querySelectorAll('[data-parallax-layer="4"]'), {
        yPercent: 120,
        scale: 0.75,
        opacity: 0,
        ease: "none"
      }, 0);
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [heroRef]);

  return (
    <div ref={contentRef} className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto w-full">
      {/* Title - Layer 1 (Slowest) */}
      <motion.div
        data-parallax-layer="1"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 text-white mix-blend-difference leading-tight md:leading-none break-words">
          The Universal <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
            Intelligence Layer
          </span>
        </h1>
      </motion.div>
      
      {/* Description - Layer 2 */}
      <motion.div
        data-parallax-layer="2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
      >
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed mb-12">
          Psychographic intelligence that understands <span className="text-white font-medium">why</span> users do what they do—across web, mobile, games, and any digital environment.
        </p>
      </motion.div>

      {/* Buttons - Layer 3 */}
      <motion.div
        data-parallax-layer="3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
      >
        <button onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] w-full sm:w-auto">
          Get Started
        </button>
        <button onClick={() => window.location.href = '/Documentation'} className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto">
          API Docs
        </button>
      </motion.div>

      {/* Tags - Layer 4 (Fastest) */}
      <motion.div
        data-parallax-layer="4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500 font-mono uppercase tracking-widest"
      >
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>Web & Mobile</span>
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>Game Engines</span>
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>REST API</span>
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>Any Platform</span>
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  const heroSectionRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    try {
      if (!gsap || !ScrollTrigger) return;
      
      gsap.registerPlugin(ScrollTrigger);

      // Initialize Lenis for smooth scrolling
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      
      lenis.on('scroll', ScrollTrigger.update);
      
      // Use requestAnimationFrame for Lenis updates (more reliable)
      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      // Page-wide scroll animations for sections
      const sections = mainRef.current?.querySelectorAll('[data-scroll-section]');
      sections?.forEach((section) => {
        gsap.fromTo(section, 
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 50%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });

      return () => {
        ScrollTrigger.getAll().forEach(st => st.kill());
        lenis.destroy();
      };
    } catch (error) {
      console.error('Error initializing scroll animations:', error);
    }
  }, []);

  return (
    <HelmetProvider>
      <ConsentProvider>
        <SEOHead 
        title="knXw - Universal Intelligence Layer for Digital Environments"
        description="Psychographic intelligence that understands why users do what they do—across web, mobile, games, and any digital environment. Real-time behavioral analysis powered by AI."
        keywords="psychographic intelligence, user analytics, behavioral analysis, AI insights, customer intelligence, user profiling, adaptive experiences"
      />
      
      {/* Noscript fallback for search engines and no-JS browsers */}
      <noscript>
        <div style={{ backgroundColor: '#000', color: '#fff', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <header style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>knXw - The Universal Intelligence Layer</h1>
            <p style={{ fontSize: '20px', color: '#9ca3af', maxWidth: '800px', margin: '0 auto 40px' }}>
              Psychographic intelligence that understands why users do what they do—across web, mobile, games, and any digital environment.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/Dashboard" style={{ padding: '16px 32px', backgroundColor: '#fff', color: '#000', borderRadius: '9999px', fontWeight: 'bold', textDecoration: 'none' }}>Get Started</a>
              <a href="/Documentation" style={{ padding: '16px 32px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '9999px', fontWeight: 'bold', textDecoration: 'none' }}>API Docs</a>
            </div>
          </header>
          
          <section style={{ maxWidth: '1200px', margin: '0 auto 80px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' }}>From Data to Understanding</h2>
            <p style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '20px' }}>
              Redefine engagement across every domain: marketing becomes intuitive, education adapts to every learner, communication grows more empathetic, and decision-making becomes informed by understanding rather than assumption.
            </p>
          </section>
          
          <section style={{ maxWidth: '1200px', margin: '0 auto 80px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' }}>Built as Universal Infrastructure</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Event Ingestion</h3>
                <p style={{ color: '#9ca3af' }}>Real-time data capture from any source with sub-100ms latency.</p>
              </div>
              <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>AI Intelligence</h3>
                <p style={{ color: '#9ca3af' }}>Multi-layer inference engine for psychographic profiling.</p>
              </div>
              <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Developer APIs</h3>
                <p style={{ color: '#9ca3af' }}>RESTful APIs and SDKs for seamless integration.</p>
              </div>
              <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Activation</h3>
                <p style={{ color: '#9ca3af' }}>Turn insights into adaptive experiences instantly.</p>
              </div>
            </div>
          </section>
          
          <section style={{ maxWidth: '1200px', margin: '0 auto 80px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center' }}>Enterprise-Grade Infrastructure</h2>
            <ul style={{ fontSize: '18px', color: '#9ca3af', lineHeight: '2' }}>
              <li>Encryption at rest & transit, GDPR Ready, Data ownership</li>
              <li>99.9% uptime SLA, Real-time health checks, Auto-scaling</li>
              <li>SAML/OIDC SSO, Data warehouse sync, SIEM integration</li>
            </ul>
          </section>
          
          <footer style={{ textAlign: 'center', padding: '40px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color: '#9ca3af', marginBottom: '20px' }}>Join developers deploying psychographic intelligence at scale</p>
            <a href="/Dashboard" style={{ padding: '16px 32px', backgroundColor: '#06b6d4', color: '#000', borderRadius: '9999px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' }}>Start Building Free</a>
          </footer>
        </div>
      </noscript>
      
      <div className="bg-black min-h-screen text-white cursor-none selection:bg-cyan-500/30">
        <CustomCursor />
        <Navbar />
        
        <main ref={mainRef} className="relative z-10">
          {/* Hero Section with Shader - Fixed Background */}
          <section ref={heroSectionRef} className="relative h-screen w-full overflow-hidden bg-[#050505] pt-20 md:pt-0">
            {/* Fixed shader background - stays in place while content scrolls */}
            <div className="fixed inset-0 h-screen w-full" style={{ zIndex: 1 }}>
              <HeroShader />
              {/* Gradient fade at bottom for smooth transition */}
              <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            </div>
            
            {/* Hero content container - scrolls with parallax */}
            <div className="relative h-full flex items-center justify-center pt-16 md:pt-0" style={{ zIndex: 5 }}>
              <HeroContent heroRef={heroSectionRef} />
            </div>

            <motion.div 
              className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/50"
              style={{ zIndex: 6 }}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowDown className="w-6 h-6" />
            </motion.div>
          </section>
          
          {/* Content sections container - sits above the fixed shader */}
          <div className="relative bg-black" style={{ zIndex: 10 }}>

          <div data-scroll-section>
            <PhilosophySection />
          </div>

          {/* Infrastructure Section - Enhanced */}
          <div data-scroll-section>
          <section id="features" className="py-16 md:py-20 bg-[#050505] border-b border-white/5 overflow-hidden relative">
             {/* Background Effects */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.03),transparent_70%)]" />
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100px]" />
             
             <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="mb-16 text-center"
                >
                   <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
                      Architecture
                   </span>
                   <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Built as Universal Infrastructure</h2>
                   <p className="text-xl text-gray-400 max-w-2xl mx-auto">Foundational cognitive layer for human understanding across every digital touchpoint</p>
                </motion.div>
                <div className="grid md:grid-cols-4 gap-6">
                   {[
                     { title: "Event Ingestion", desc: "Real-time data capture from any source with sub-100ms latency.", num: "01" },
                     { title: "AI Intelligence", desc: "Multi-layer inference engine for psychographic profiling.", num: "02" },
                     { title: "Developer APIs", desc: "RESTful APIs and SDKs for seamless integration.", num: "03" },
                     { title: "Activation", desc: "Turn insights into adaptive experiences instantly.", num: "04" }
                   ].map((item, i) => (
                      <motion.div 
                         key={i} 
                         initial={{ opacity: 0, y: 30 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ delay: i * 0.1 }}
                         className="group relative p-6 rounded-xl bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5 hover:border-cyan-500/30 transition-all duration-500"
                      >
                         <div className="absolute top-4 right-4 text-4xl font-bold text-white/5 group-hover:text-cyan-500/10 transition-colors">{item.num}</div>
                         <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-transparent rounded-full mb-4" />
                         <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                         <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                      </motion.div>
                   ))}
                </div>
             </div>
          </section>
          </div>

          <div data-scroll-section>
            <PlatformFeatures />
          </div>
          
          {/* Enterprise Section - Enhanced */}
          <div data-scroll-section>
          <section className="py-24 md:py-32 bg-black border-y border-white/10 overflow-hidden relative">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.05),transparent_60%)]" />
            
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
               <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
               >
                  <span className="text-xs font-mono text-purple-400 uppercase tracking-[0.3em] bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 inline-block mb-6">
                     Enterprise
                  </span>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Enterprise-Grade Infrastructure</h2>
                  <p className="text-xl text-gray-400 mb-10">Security, reliability, and compliance built for mission-critical deployments</p>
                  
                  <div className="space-y-6">
                     {[
                       { title: "Data Protection", items: ["Encryption at rest & transit", "GDPR Ready", "Data ownership"], color: "#8b5cf6" },
                       { title: "System Monitoring", items: ["99.9% uptime SLA", "Real-time health checks", "Auto-scaling"], color: "#06b6d4" },
                       { title: "Enterprise Integration", items: ["SAML/OIDC SSO", "Data warehouse sync", "SIEM integration"], color: "#10b981" }
                     ].map((grp, i) => (
                        <motion.div 
                           key={i}
                           initial={{ opacity: 0, y: 20 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           viewport={{ once: true }}
                           transition={{ delay: 0.1 + i * 0.1 }}
                           className="group"
                        >
                           <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ background: grp.color }} />
                              {grp.title}
                           </h4>
                           <div className="flex gap-3 flex-wrap">
                              {grp.items.map((it, j) => (
                                 <span 
                                    key={j} 
                                    className="text-sm text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-colors cursor-default"
                                 >
                                    {it}
                                 </span>
                              ))}
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </motion.div>
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative hidden md:block"
                >
                   {/* Enterprise Infrastructure Grid */}
                   <div className="aspect-square relative">
                      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-4">
                         {Array.from({ length: 16 }).map((_, i) => (
                            <motion.div
                               key={i}
                               initial={{ opacity: 0, scale: 0 }}
                               whileInView={{ opacity: 1, scale: 1 }}
                               viewport={{ once: true }}
                               transition={{ delay: i * 0.05 }}
                               className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 rounded-lg border border-white/10 relative overflow-hidden group"
                            >
                               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-cyan-500/0 group-hover:from-purple-500/20 group-hover:to-cyan-500/20 transition-all duration-500" />

                               {/* Animated pulse */}
                               <motion.div
                                  className="absolute inset-0 bg-cyan-500/20 rounded-lg"
                                  animate={{
                                     opacity: [0, 0.3, 0],
                                     scale: [0.8, 1, 0.8],
                                  }}
                                  transition={{
                                     duration: 3,
                                     delay: i * 0.2,
                                     repeat: Infinity,
                                     ease: "easeInOut"
                                  }}
                               />

                               {/* Status indicator */}
                               <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            </motion.div>
                         ))}
                      </div>

                      {/* Connecting lines animation */}
                      <svg className="absolute inset-0 pointer-events-none">
                         <motion.line
                            x1="25%" y1="25%" x2="75%" y2="75%"
                            stroke="rgba(6,182,212,0.3)"
                            strokeWidth="1"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                         />
                         <motion.line
                            x1="75%" y1="25%" x2="25%" y2="75%"
                            stroke="rgba(139,92,246,0.3)"
                            strokeWidth="1"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.7 }}
                         />
                      </svg>
                   </div>
               </motion.div>
            </div>
          </section>
          </div>

          <div data-scroll-section>
            <IntegrationsMarquee />
          </div>

          {/* Interactive Demo Teaser - Enhanced */}
          <div data-scroll-section>
          <section id="demo-section" className="py-24 md:py-32 bg-[#080808] text-center overflow-hidden relative">
             {/* Background */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.05),transparent_50%)]" />
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
             
             <div className="max-w-5xl mx-auto px-6 relative z-10">
                <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                >
                   <span className="text-xs font-mono text-cyan-400 uppercase tracking-[0.3em] bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 inline-block mb-6">
                      Experience
                   </span>
                   <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">Intuitive Intelligence</h2>
                   <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto">Complex psychological analytics made beautifully simple</p>
                </motion.div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-16 text-left">
                   {[
                      { title: "Real-Time Dashboard", desc: "Live psychographic insights with actionable metrics at a glance.", gradient: "from-cyan-500/20 to-blue-500/20" },
                      { title: "Deep User Profiles", desc: "Understand individual psychology, motivations, and cognitive patterns.", gradient: "from-purple-500/20 to-pink-500/20" }
                   ].map((item, i) => (
                      <motion.div 
                         key={i}
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ delay: 0.1 + i * 0.1 }}
                         className={`group bg-gradient-to-br ${item.gradient} p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-500 relative overflow-hidden`}
                      >
                         <div className="absolute inset-0 bg-[#111] opacity-80 group-hover:opacity-70 transition-opacity" />
                         <div className="relative z-10">
                            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-gray-400">{item.desc}</p>
                         </div>
                      </motion.div>
                   ))}
                </div>

                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  onClick={() => window.location.href = '/InteractiveDemo'}
                  className="group px-10 py-5 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)]"
                >
                   Try Interactive Demo
                   <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </motion.button>
             </div>
          </section>
          </div>

          <div data-scroll-section>
            <UseCasesGrid />
          </div>
          <div data-scroll-section>
            <AnimatedStats />
          </div>
          <div data-scroll-section>
            <PricingSection />
          </div>
          
          {/* Vision Text - Enhanced */}
          <div data-scroll-section>
          <section className="py-24 md:py-32 bg-black text-center px-6 overflow-hidden relative">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.03),transparent_60%)]" />
             <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative z-10"
             >
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-12" />
                <p className="text-2xl md:text-4xl lg:text-5xl font-light text-gray-400 max-w-5xl mx-auto leading-relaxed">
                  "knXw is not just another analytics tool or AI assistant; it is the framework for a more{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400">
                     connected, intelligent, and human-centered
                  </span>{' '}
                  digital world."
                </p>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mt-12" />
             </motion.div>
          </section>
          </div>

          <div data-scroll-section>
            <FAQSection />
          </div>

          {/* Final CTA - Enhanced */}
          <div data-scroll-section>
          <section className="py-28 md:py-40 bg-gradient-to-b from-black via-[#080808] to-[#111] text-center border-t border-white/10 overflow-hidden relative">
             {/* Background Effects */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.1),transparent_60%)]" />
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />
             
             <div className="max-w-5xl mx-auto px-6 relative z-10">
                <motion.div
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                >
                   <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight">
                      Start Building{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Today</span>
                   </h2>
                   <p className="text-xl md:text-2xl text-gray-400 mb-14 max-w-2xl mx-auto">Join developers deploying psychographic intelligence at scale</p>
                </motion.div>
                
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.2 }}
                   className="flex flex-col sm:flex-row gap-5 justify-center mb-14"
                >
                   <button 
                      onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))} 
                      className="group px-12 py-6 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-xl rounded-full hover:shadow-[0_0_60px_-10px_rgba(6,182,212,0.7)] transition-all duration-300 transform hover:scale-105"
                   >
                      Start Building Free
                      <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                   </button>
                   <button 
                      onClick={() => window.location.href = '/Documentation'} 
                      className="px-12 py-6 bg-transparent border-2 border-white/20 text-white font-bold text-xl rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                   >
                      View Docs
                   </button>
                </motion.div>
                
                <motion.div 
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.4 }}
                   className="flex flex-wrap gap-6 md:gap-10 justify-center text-sm text-gray-500 font-mono uppercase tracking-wider"
                >
                   <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      No credit card required
                   </span>
                   <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                      Full API access
                   </span>
                   <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full" />
                      Free forever plan
                   </span>
                </motion.div>
             </div>
          </section>
          </div>
          </div>
        </main>

        <div className="relative" style={{ zIndex: 20 }}>
          <FooterSection />
        </div>
      </div>
      </ConsentProvider>
    </HelmetProvider>
  );
}