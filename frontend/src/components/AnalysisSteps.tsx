import { CheckCircle, XCircle, Loader2, Circle, AlertCircle } from 'lucide-react';

interface AnalysisStep {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  timestamp: string;
}

interface AnalysisStepsProps {
  steps: AnalysisStep[];
}

export const AnalysisSteps = ({ steps }: AnalysisStepsProps) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        Waiting for analysis to start...
      </div>
    );
  }

  const getIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-900 mb-3">Analysis Steps</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getStatusColor(step.status)} transition-all`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(step.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {index + 1}. {step.name}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {step.message && (
                <p className="text-sm text-gray-600 mt-1 break-words">
                  {step.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      {steps.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {steps.filter(s => s.status === 'completed').length} of {steps.length} steps completed
            </span>
            {steps.some(s => s.status === 'error') && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                {steps.filter(s => s.status === 'error').length} error(s)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};