import React, { useEffect, useState } from 'react';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Rocket, ArrowRight, FileText, Shield, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTour, setStartTour] = useState(false);

  const handleStartTrial = async () => {
    if (!termsAccepted) {
      alert('Please accept the Terms of Service and Performance Disclaimers to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Mark onboarding as completed and set tour preference
      await User.updateMyUserData({ 
        onboarding_completed: true,
        terms_accepted_at: new Date().toISOString(),
        onboarding_state: {
          tour_requested: startTour,
          tour_step: 0,
          tour_completed: false
        }
      });
      window.location.href = createPageUrl('Dashboard') + '?onboarding=true';
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Still redirect even if the update fails
      window.location.href = createPageUrl('Dashboard') + '?onboarding=true';
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="w-24 h-24 bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Brain className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-[#00d4ff] to-[#ec4899] bg-clip-text text-transparent">
            knXw
          </span>
        </h1>
        
        <p className="text-xl text-[#a3a3a3] mb-8 max-w-lg mx-auto leading-relaxed">
          Transform user behavior into psychological insights. Let's get you started with your free trial.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="text-center p-6 bg-[#111111] rounded-xl border border-[#262626]">
            <div className="w-12 h-12 bg-[#00d4ff]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-6 h-6 text-[#00d4ff]" />
            </div>
            <h3 className="font-semibold text-white mb-2">1,000 Free Credits</h3>
            <p className="text-[#a3a3a3] text-sm">Start analyzing user psychology immediately</p>
          </div>
          
          <div className="text-center p-6 bg-[#111111] rounded-xl border border-[#262626]">
            <div className="w-12 h-12 bg-[#10b981]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-[#10b981]" />
            </div>
            <h3 className="font-semibold text-white mb-2">AI-Powered</h3>
            <p className="text-[#a3a3a3] text-sm">Deep psychological insights in real-time</p>
          </div>
          
          <div className="text-center p-6 bg-[#111111] rounded-xl border border-[#262626]">
            <div className="w-12 h-12 bg-[#ec4899]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-6 h-6 text-[#ec4899]" />
            </div>
            <h3 className="font-semibold text-white mb-2">Quick Setup</h3>
            <p className="text-[#a3a3a3] text-sm">One-line integration, instant insights</p>
          </div>
        </div>

        {/* Interactive Tour Option */}
        <div className="bg-gradient-to-br from-[#00d4ff]/10 to-[#0ea5e9]/10 border border-[#00d4ff]/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Checkbox 
              id="tour" 
              checked={startTour}
              onCheckedChange={setStartTour}
              className="mt-1"
            />
            <div className="text-left">
              <label htmlFor="tour" className="text-base text-white font-semibold leading-relaxed cursor-pointer flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00d4ff]" />
                Start with Interactive Product Tour
              </label>
              <p className="text-sm text-[#a3a3a3] mt-1">
                Get a guided walkthrough of knXw's key features and capabilities (recommended for first-time users)
              </p>
            </div>
          </div>
        </div>

        {/* Terms Acceptance */}
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={setTermsAccepted}
              className="mt-1"
            />
            <div className="text-left">
              <label htmlFor="terms" className="text-sm text-[#e5e5e5] leading-relaxed cursor-pointer">
                I accept the{' '}
                <a 
                  href={createPageUrl('Terms')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#00d4ff] hover:underline inline-flex items-center gap-1"
                >
                  Terms of Service <FileText className="w-3 h-3" />
                </a>
                {' '}and{' '}
                <a 
                  href={createPageUrl('Privacy')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#00d4ff] hover:underline inline-flex items-center gap-1"
                >
                  Privacy Policy <Shield className="w-3 h-3" />
                </a>
                , including all performance disclaimers and understand that results may vary significantly.
              </label>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleStartTrial}
          disabled={!termsAccepted || isSubmitting}
          className="bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-[#0a0a0a] font-bold px-8 py-4 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Setting up...' : startTour ? 'Start Tour & Trial' : 'Start Your Free Trial'}
          {!isSubmitting && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>

        <p className="text-[#6b7280] text-sm mt-6">
          No credit card required • Setup in under 2 minutes
        </p>
      </div>
    </div>
  );
}