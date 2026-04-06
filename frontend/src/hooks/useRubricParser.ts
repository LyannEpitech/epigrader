import { useState, useCallback } from 'react';
import { rubricApi } from '../services/rubric';
import { Criterion } from '../types/rubric';

interface UseRubricParserReturn {
  criteria: Criterion[];
  totalPoints: number;
  isLoading: boolean;
  error: string | null;
  parseRubric: (content: string) => Promise<boolean>;
  clear: () => void;
}

export const useRubricParser = (): UseRubricParserReturn => {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseRubric = useCallback(async (content: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await rubricApi.parseRubric(content);
      
      if (response.success) {
        setCriteria(response.criteria);
        setTotalPoints(response.totalPoints);
        return true;
      } else {
        setError('Failed to parse rubric');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse rubric';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setCriteria([]);
    setTotalPoints(0);
    setError(null);
  }, []);

  return {
    criteria,
    totalPoints,
    isLoading,
    error,
    parseRubric,
    clear,
  };
};