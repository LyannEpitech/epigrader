import { useState, useEffect, useCallback } from 'react';
import { rubricApi } from '../services/rubric';
import { Criterion } from '../types/rubric';

interface Rubric {
  id: string;
  name: string;
  criteria: Criterion[];
  totalPoints: number;
  createdAt: string;
}

interface UseRubricsReturn {
  rubrics: Rubric[];
  isLoading: boolean;
  error: string | null;
  fetchRubrics: () => Promise<void>;
  saveRubric: (name: string, criteria: Criterion[]) => Promise<string | null>;
  deleteRubric: (id: string) => Promise<boolean>;
}

export const useRubrics = (): UseRubricsReturn => {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRubrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await rubricApi.getAllRubrics();
      setRubrics(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch rubrics';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveRubric = useCallback(async (name: string, criteria: Criterion[]): Promise<string | null> => {
    try {
      const id = await rubricApi.saveRubric(name, criteria);
      await fetchRubrics();
      return id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save rubric';
      setError(message);
      return null;
    }
  }, [fetchRubrics]);

  const deleteRubric = useCallback(async (id: string): Promise<boolean> => {
    try {
      await rubricApi.deleteRubric(id);
      await fetchRubrics();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete rubric';
      setError(message);
      return false;
    }
  }, [fetchRubrics]);

  useEffect(() => {
    fetchRubrics();
  }, [fetchRubrics]);

  return {
    rubrics,
    isLoading,
    error,
    fetchRubrics,
    saveRubric,
    deleteRubric,
  };
};