import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Zap, Database, RotateCw, AlertTriangle } from 'lucide-react';
import { traceValidator } from '@/api/functions';
import { phase2Validator } from '@/api/functions';
import { phase3Validator } from '@/api/functions';
import { motion, AnimatePresence } from 'framer-motion';

const StatusIcon = ({ status }) => {
  if (status === 'passed') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (status === 'failed') return <XCircle className="h-5 w-5 text-red-500" />;
  return <Clock className="h-5 w-5 text-gray-500" />;
};

const ResultCard = ({ result }) => {
  if (!result) return null;
  const cardColor = result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
  const iconColor = result.success ? 'text-green-600' : 'text-red-600';
  const Icon = result.success ? CheckCircle2 : AlertTriangle;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <Card className={`transition-colors ${cardColor}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon className={`h-6 w-6 ${iconColor}`} />
                <span className="capitalize">{result.type} Validation {result.success ? 'Succeeded' : 'Failed'}</span>
              </CardTitle>
              <CardDescription>
                {result.summary.passed} passed, {result.summary.failed} failed in {result.duration_ms}ms.
              </CardDescription>
            </div>
            <Badge variant={result.success ? 'default' : 'destructive'}>
              {result.success ? 'Passed' : 'Failed'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <StatusIcon status={check.status} />
                  <div>
                    <p className="font-medium text-sm">{check.name}</p>
                    <p className="text-xs text-gray-600">{check.description}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{check.duration_ms}ms</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function SystemValidationPage() {
  const [results, setResults] = useState({ trace: null, phase2: null, phase3: null });
  const [isLoading, setIsLoading] = useState(false);

  const runValidations = useCallback(async () => {
    setIsLoading(true);
    setResults({ trace: null, phase2: null, phase3: null });
    
    // Using Promise.allSettled to run them concurrently
    const [traceRes, phase2Res, phase3Res] = await Promise.allSettled([
      traceValidator(),
      phase2Validator(),
      phase3Validator(),
    ]);

    setResults({
      trace: traceRes.status === 'fulfilled' ? traceRes.value.data : { success: false, type: 'trace', summary: { passed: 0, failed: 1 }, checks: [{ name: 'Execution Error', status: 'failed', description: traceRes.reason.message }], duration_ms: 0 },
      phase2: phase2Res.status === 'fulfilled' ? phase2Res.value.data : { success: false, type: 'phase2', summary: { passed: 0, failed: 1 }, checks: [{ name: 'Execution Error', status: 'failed', description: phase2Res.reason.message }], duration_ms: 0 },
      phase3: phase3Res.status === 'fulfilled' ? phase3Res.value.data : { success: false, type: 'phase3', summary: { passed: 0, failed: 1 }, checks: [{ name: 'Execution Error', status: 'failed', description: phase3Res.reason.message }], duration_ms: 0 },
    });

    setIsLoading(false);
  }, []);

  return (
    <>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-7 h-7 text-blue-600" />
              System Validation Suite
            </h1>
            <p className="text-gray-600 mt-1">
              Run end-to-end checks on core enterprise features and system health.
            </p>
          </div>
          <Button onClick={runValidations} disabled={isLoading} className="mt-4 md:mt-0">
            <RotateCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Running Validations...' : 'Run All Validations'}
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AnimatePresence><ResultCard result={results.trace} /></AnimatePresence>
          <AnimatePresence><ResultCard result={results.phase2} /></AnimatePresence>
          <AnimatePresence><ResultCard result={results.phase3} /></AnimatePresence>
        </div>

        {/* Documentation Links */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Database className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 text-lg">Enterprise Documentation</h3>
                <p className="text-sm text-blue-700 mt-1 mb-3">
                  Comprehensive documentation for all enterprise features and operational procedures:
                </p>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <a href="/Documentation?activeSection=enterprise-security" className="font-medium text-blue-600 hover:underline">
                    Enterprise Security
                  </a>
                  <a href="/Documentation?activeSection=system-monitoring" className="font-medium text-blue-600 hover:underline">
                    System Monitoring
                  </a>
                   <a href="/Documentation?activeSection=enterprise-integrations" className="font-medium text-blue-600 hover:underline">
                    Enterprise Integrations
                  </a>
                  <a href="/Documentation?activeSection=demo-data-studio" className="font-medium text-blue-600 hover:underline">
                    Demo Data Studio
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}