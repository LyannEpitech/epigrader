import { useEffect, useRef } from 'react';
import type { AnalysisStep, AnalysisStatus } from '../types/analysis';
import { 
  Settings, Shield, Search, GitBranch, Brain, FileCheck, 
  CheckCircle2, Circle, Loader2, AlertCircle 
} from 'lucide-react';

interface AnalysisStepsProps {
  steps: AnalysisStep[];
  currentStatus: AnalysisStatus;
}

const stepIcons: Record<string, React.ElementType> = {
  'Configuration': Settings,
  'GitHub Auth': Shield,
  'Repository Fetch': Search,
  'Code Analysis': GitBranch,
  'AI Processing': Brain,
  'Report Generation': FileCheck,
};

// Step color gradients (for future use with custom step styling)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stepColors: Record<string, string> = {
  'Configuration': 'from-blue-500 to-blue-600',
  'GitHub Auth': 'from-purple-500 to-purple-600',
  'Repository Fetch': 'from-cyan-500 to-cyan-600',
  'Code Analysis': 'from-emerald-500 to-emerald-600',
  'AI Processing': 'from-amber-500 to-amber-600',
  'Report Generation': 'from-rose-500 to-rose-600',
};

export function AnalysisSteps({ steps, currentStatus }: AnalysisStepsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentStepRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current step
  useEffect(() => {
    if (currentStepRef.current && containerRef.current) {
      // Check if scrollIntoView is available (not in test environment)
      if (typeof currentStepRef.current.scrollIntoView === 'function') {
        currentStepRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [steps]);

  const getStepStatus = (step: AnalysisStep, index: number) => {
    if (step.status === 'completed') return 'completed';
    if (step.status === 'error') return 'error';
    if (step.status === 'processing' || 
        (index === steps.findIndex(s => s.status === 'pending') && currentStatus === 'processing')) {
      return 'processing';
    }
    return 'pending';
  };

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  // Show loading state if no steps yet
  if (steps.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Initialisation de l'analyse...</span>
          </div>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] rounded-full transition-all duration-500 ease-out"
            style={{ width: '10%' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progression de l'analyse
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {completedCount} / {steps.length} étapes
          </span>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Steps Timeline */}
      <div ref={containerRef} className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        {/* Animated progress line */}
        <div 
          className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-[#1e3a5f] to-[#2d5a87] transition-all duration-500"
          style={{ height: `${progress}%` }}
        />

        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step, index);
            const Icon = stepIcons[step.name] || Circle;
            const isCurrent = status === 'processing';
            
            return (
              <div
                key={step.name}
                ref={isCurrent ? currentStepRef : null}
                className={`relative flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-md' 
                    : status === 'completed'
                    ? 'bg-gray-50/50'
                    : 'opacity-60'
                }`}
              >
                {/* Step Icon */}
                <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  status === 'completed'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                    : status === 'processing'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 animate-pulse'
                    : status === 'error'
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : status === 'processing' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : status === 'error' ? (
                    <AlertCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold transition-colors ${
                      status === 'processing' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {step.name}
                    </h4>
                    
                    {/* Status Badge */}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : status === 'processing'
                        ? 'bg-blue-100 text-blue-700 animate-pulse'
                        : status === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {status === 'completed' ? 'Terminé' 
                        : status === 'processing' ? 'En cours...'
                        : status === 'error' ? 'Erreur'
                        : 'En attente'}
                    </span>
                  </div>
                  
                  <p className={`mt-1 text-sm ${
                    status === 'processing' ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {step.message}
                  </p>

                  {/* Timestamp */}
                  {step.timestamp && (
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(step.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </p>
                  )}
                </div>

                {/* Step Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      {currentStatus === 'completed' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-emerald-900">Analyse terminée !</h4>
              <p className="text-sm text-emerald-700">
                Toutes les étapes ont été complétées avec succès
              </p>
            </div>
          </div>
        </div>
      )}

      {currentStatus === 'error' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-red-900">Analyse échouée</h4>
              <p className="text-sm text-red-700">
                Une erreur est survenue pendant l'analyse
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}