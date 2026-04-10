import { useState, useCallback, useEffect } from 'react';
import { analysisApi } from '../services/analysis';
import { AnalysisJob } from '../types/analysis';
import { useWebSocket } from './useWebSocket';

interface UseAnalysisReturn {
  job: AnalysisJob | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  startAnalysis: (repoUrl: string, rubricId: string, branch?: string) => Promise<void>;
  clear: () => void;
}

export const useAnalysis = (): UseAnalysisReturn => {
  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Handle job updates from WebSocket
  const handleJobUpdate = useCallback((updatedJob: AnalysisJob) => {
    setJob(updatedJob);
  }, []);

  const { subscribeToJob, unsubscribeFromJob, isConnected } = useWebSocket({
    onJobUpdate: handleJobUpdate,
  });

  const clear = useCallback(() => {
    if (currentJobId) {
      unsubscribeFromJob(currentJobId);
    }
    setJob(null);
    setError(null);
    setCurrentJobId(null);
  }, [currentJobId, unsubscribeFromJob]);

  const startAnalysis = useCallback(async (repoUrl: string, rubricId: string, branch?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Unsubscribe from previous job if any
      if (currentJobId) {
        unsubscribeFromJob(currentJobId);
      }

      // Get PAT from sessionStorage if available
      const pat = sessionStorage.getItem('github_pat') || undefined;
      
      const response = await analysisApi.startAnalysis(repoUrl, rubricId, pat, branch);
      
      // Get initial job status
      const jobStatus = await analysisApi.getJobStatus(response.jobId);
      setJob(jobStatus);
      setCurrentJobId(response.jobId);

      // Subscribe to WebSocket updates for this job
      subscribeToJob(response.jobId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start analysis';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentJobId, subscribeToJob, unsubscribeFromJob]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentJobId) {
        unsubscribeFromJob(currentJobId);
      }
    };
  }, [currentJobId, unsubscribeFromJob]);

  return {
    job,
    isLoading,
    error,
    isConnected: isConnected(),
    startAnalysis,
    clear,
  };
};
