interface ProgressBarProps {
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export const ProgressBar = ({ progress, status }: ProgressBarProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'processing':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Analysis complete!';
      case 'error':
        return 'Analysis failed';
      case 'processing':
        return `Analyzing... ${progress}%`;
      default:
        return 'Waiting to start...';
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{getStatusText()}</span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${getStatusColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};