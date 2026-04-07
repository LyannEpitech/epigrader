import { CheckCircle, XCircle, Loader2, Circle, AlertCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnalysisStep {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  timestamp: string;
}

interface AnalysisStepsProps {
  steps: AnalysisStep[];
  currentStatus?: string;
}

export const AnalysisSteps = ({ steps, currentStatus }: AnalysisStepsProps) => {
  const [visibleSteps, setVisibleSteps] = useState<AnalysisStep[]>([]);
  
  useEffect(() => {
    // Animate steps appearing
    if (steps.length > visibleSteps.length) {
      setVisibleSteps(steps);
    }
  }, [steps, visibleSteps.length]);

  if (!steps || steps.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-3" />
        <span>Initializing analysis...</span>
      </div>
    );
  }

  const getIcon = (status: string, isLast: boolean) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'running':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      default:
        return isLast && currentStatus === 'processing' 
          ? <Loader2 className="w-6 h-6 text-blue-300 animate-spin" />
          : <Circle className="w-6 h-6 text-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      case 'running':
        return 'border-blue-500 bg-blue-50 shadow-md';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'running':
        return 'text-blue-700 font-semibold';
      default:
        return 'text-gray-500';
    }
  };

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const errorCount = steps.filter(s => s.status === 'error').length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Analysis Progress</h3>
          <span className="text-sm font-medium text-gray-600">
            {completedCount} of {steps.length} steps
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Status Summary */}
        <div className="flex items-center gap-4 text-sm">
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              {errorCount} error(s)
            </span>
          )}
          {currentStatus === 'processing' && (
            <span className="flex items-center gap-1 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </span>
          )}
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isRunning = step.status === 'running';
          
          return (
            <div
              key={step.id}
              className={`
                relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-300
                ${getStatusColor(step.status)}
                ${isRunning ? 'scale-[1.02]' : ''}
              `}
            >
              {/* Step Number & Icon */}
              <div className="flex flex-col items-center gap-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${step.status === 'completed' ? 'bg-green-500 text-white' : 
                    step.status === 'error' ? 'bg-red-500 text-white' :
                    step.status === 'running' ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-600'}
                `}>
                  {index + 1}
                </div>
                <div className="mt-1">
                  {getIcon(step.status, isLast)}
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${getTextColor(step.status)}`}>
                    {step.name}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                {step.message && (
                  <p className={`text-sm mt-1 break-words ${
                    step.status === 'error' ? 'text-red-600' : 
                    step.status === 'running' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {step.message}
                  </p>
                )}
              </div>

              {/* Running Indicator */}
              {isRunning && (
                <div className="absolute right-2 top-2">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};