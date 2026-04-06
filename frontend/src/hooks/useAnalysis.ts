import { useState, useCallback, useEffect, useRef } from 'react';
import { analysisApi } from '../services/analysis';
import { AnalysisJob } from '../types/analysis';

interface UseAnalysisReturn {
  job: AnalysisJob | null;
  isLoading: boolean;
  error: string | null;
  startAnalysis: (repoUrl: string, rubricId: string) => Promise<void>;
  clear: () => void;
}

export const useAnalysis = (): UseAnalysisReturn => {
  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setJob(null);
    setError(null);
  }, []);

  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const jobStatus = await analysisApi.getJobStatus(jobId);
      setJob(jobStatus);

      // Stop polling if job is completed or errored
      if (jobStatus.status === 'completed' || jobStatus.status === 'error') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (err) {
      // Don't set error on polling, just log it
      console.error('Polling error:', err);
    }
  }, []);

  const startAnalysis = useCallback(async (repoUrl: string, rubricId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const response = await analysisApi.startAnalysis(repoUrl, rubricId);
      
      // Get initial job status
      const jobStatus = await analysisApi.getJobStatus(response.jobId);
      setJob(jobStatus);

      // Start polling
      intervalRef.current = setInterval(() => {
        pollJobStatus(response.jobId);
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start analysis';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [pollJobStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    job,
    isLoading,
    error,
    startAnalysis,
    clear,
  };
};