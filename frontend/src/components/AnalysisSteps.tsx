import { CheckCircle, XCircle, Loader2, Circle, AlertCircle, Clock, FileCode, GitBranch, Search, Brain, FileText, Settings, Shield } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface AnalysisStep {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  timestamp: string;
  details?: string;
}

interface AnalysisStepsProps {
  steps: AnalysisStep[];
  currentStatus?: string;
  progress?: number;
  currentStepName?: string;
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  'Configuration': <Settings className="w-5 h-5" />,
  'GitHub Auth': <Shield className="w-5 h-5" />,
  'Cache Check': <Search className="w-5 h-5" />,
  'Repository Parsing': <GitBranch className="w-5 h-5" />,
  'Repository Info': <FileText className="w-5 h-5" />,
  'File Discovery': <Search className="w-5 h-5" />,
  'File Filtering': <FileCode className="w-5 h-5" />,
  'LLM Analysis': <Brain className="w-5 h-5" />,
  'Report Generation': <FileText className="w-5 h-5" />,
};

export const AnalysisSteps = ({ steps, currentStatus, progress: externalProgress, currentStepName }: AnalysisStepsProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<AnalysisStep[]>([]);
  const stepsEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (steps.length > visibleSteps.length) {
      setVisibleSteps(steps);
    }
  }, [steps, visibleSteps.length]);

  // Auto-scroll to bottom when steps update
  useEffect(() => {
    if (stepsEndRef.current) {
      stepsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [steps]);

  // Animate progress bar
  useEffect(() => {
    const completedCount = steps.filter(s => s.status === 'completed').length;
    const calculatedProgress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;
    const targetProgress = externalProgress !== undefined ? externalProgress : calculatedProgress;
    
    const timer = setTimeout(() => {
      setAnimatedProgress(targetProgress);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [steps, externalProgress]);

  if (!steps || steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <span className="text-lg font-medium">Initializing analysis...</span>
        <span className="text-sm text-gray-400">Preparing the environment</span>
      </div>
    );
  }

  const getStepIcon = (stepName: string, status: string) => {
    const icon = STEP_ICONS[stepName] || <Circle className="w-5 h-5" />;
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'running':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      default:
        return <div className="text-gray-400">{icon}</div>;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          card: 'border-green-200 bg-green-50/50',
          number: 'bg-green-500 text-white',
          text: 'text-green-700',
          border: 'border-green-500',
          glow: 'shadow-green-200',
        };
      case 'error':
        return {
          card: 'border-red-200 bg-red-50/50',
          number: 'bg-red-500 text-white',
          text: 'text-red-700',
          border: 'border-red-500',
          glow: 'shadow-red-200',
        };
      case 'running':
        return {
          card: 'border-blue-300 bg-blue-50 shadow-lg shadow-blue-100',
          number: 'bg-blue-500 text-white animate-pulse',
          text: 'text-blue-700 font-bold',
          border: 'border-blue-500',
          glow: 'shadow-blue-200',
        };
      default:
        return {
          card: 'border-gray-100 bg-gray-50/50',
          number: 'bg-gray-200 text-gray-500',
          text: 'text-gray-400',
          border: 'border-gray-200',
          glow: '',
        };
    }
  };

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const errorCount = steps.filter(s => s.status === 'error').length;
  const runningCount = steps.filter(s => s.status === 'running').length;
  const currentStepIndex = steps.findIndex(s => s.status === 'running');

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Analysis Progress</h3>
            <p className="text-sm text-gray-500 mt-1">
              {currentStepName || (currentStepIndex >= 0 ? steps[currentStepIndex]?.name : 'Analysis complete')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-blue-600">{animatedProgress}%</span>
            <p className="text-sm text-gray-500">{completedCount}/{steps.length} steps</p>
          </div>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${animatedProgress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
            <div 
              className="absolute top-0 right-0 h-full w-20 bg-gradient-to-r from-transparent to-white/30 animate-shimmer"
              style={{ animation: 'shimmer 2s infinite' }}
            />
          </div>
        </div>
        
        {/* Status Pills */}
        <div className="flex items-center gap-3 mt-4">
          {runningCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              Running
            </span>
          )}
          {completedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              <CheckCircle className="w-4 h-4" />
              {completedCount} Done
            </span>
          )}
          {errorCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
              <AlertCircle className="w-4 h-4" />
              {errorCount} Error{errorCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Steps Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200">
          <div 
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-500 to-green-500 transition-all duration-500"
            style={{ height: `${animatedProgress}%` }}
          />
        </div>

        {/* Steps List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 pb-4">
          {steps.map((step, index) => {
            const styles = getStatusStyles(step.status);
            const isRunning = step.status === 'running';
            
            return (
              <div
                key={step.id}
                className={`
                  relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 ml-2
                  ${styles.card}
                  ${isRunning ? 'scale-[1.02] translate-x-2' : 'hover:translate-x-1'}
                `}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Step Number Circle */}
                <div className={`
                  relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                  transition-all duration-300 shadow-md ${styles.number}
                `}>
                  {index + 1}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getStepIcon(step.name, step.status)}
                      <span className={`font-semibold ${styles.text}`}>
                        {step.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(step.timestamp).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  {step.message && (
                    <p className={`text-sm mt-2 leading-relaxed ${
                      step.status === 'error' ? 'text-red-600 font-medium' : 
                      step.status === 'running' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      {step.message}
                    </p>
                  )}
                  
                  {step.details && (
                    <p className="text-xs text-gray-400 mt-1">
                      {step.details}
                    </p>
                  )}
                </div>

                {/* Running Pulse Indicator */}
                {isRunning && (
                  <div className="absolute -right-1 -top-1">
                    <span className="flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={stepsEndRef} />
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};