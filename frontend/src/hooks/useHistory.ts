import { useState, useEffect } from 'react';
import { historyApi } from '../services/history';

interface HistoryItem {
  jobId: string;
  repoUrl: string;
  rubricId: string;
  status: string;
  progress: number;
  totalScore?: number;
  maxScore?: number;
  createdAt: string;
  updatedAt: string;
}

interface UseHistoryReturn {
  history: HistoryItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useHistory = (): UseHistoryReturn => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const jobs = await historyApi.getHistory(20);
      setHistory(jobs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load history';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return {
    history,
    isLoading,
    error,
    refresh: fetchHistory,
  };
};