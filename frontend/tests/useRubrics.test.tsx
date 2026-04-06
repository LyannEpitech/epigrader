import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRubrics } from '../src/hooks/useRubrics';
import { rubricApi } from '../src/services/rubric';
import { renderHook, act, waitFor } from '@testing-library/react';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { ReactNode } from 'react';

vi.mock('../src/services/rubric', () => ({
  rubricApi: {
    getAllRubrics: vi.fn(),
    saveRubric: vi.fn(),
    deleteRubric: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

describe('useRubrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches rubrics on mount', async () => {
    const mockRubrics = [
      { id: '1', name: 'Rubric 1', totalPoints: 20, criteria: [] },
    ];
    vi.mocked(rubricApi.getAllRubrics).mockResolvedValue(mockRubrics);

    const { result } = renderHook(() => useRubrics(), { wrapper });

    await waitFor(() => {
      expect(result.current.rubrics).toEqual(mockRubrics);
    });
  });

  it('saves a new rubric', async () => {
    vi.mocked(rubricApi.saveRubric).mockResolvedValue('new-id');
    vi.mocked(rubricApi.getAllRubrics).mockResolvedValue([]);

    const { result } = renderHook(() => useRubrics(), { wrapper });

    const criteria = [{ id: '1', name: 'Test', description: 'Test', maxPoints: 10 }];
    
    let savedId: string | null = null;
    await act(async () => {
      savedId = await result.current.saveRubric('New Rubric', criteria);
    });

    expect(savedId).toBe('new-id');
    expect(rubricApi.saveRubric).toHaveBeenCalledWith('New Rubric', criteria);
  });

  it('deletes a rubric', async () => {
    vi.mocked(rubricApi.deleteRubric).mockResolvedValue(undefined);
    vi.mocked(rubricApi.getAllRubrics).mockResolvedValue([
      { id: '1', name: 'Rubric 1', totalPoints: 20, criteria: [] },
    ]);

    const { result } = renderHook(() => useRubrics(), { wrapper });

    await waitFor(() => {
      expect(result.current.rubrics.length).toBe(1);
    });

    let deleteResult = false;
    await act(async () => {
      deleteResult = await result.current.deleteRubric('1');
    });

    expect(deleteResult).toBe(true);
    expect(rubricApi.deleteRubric).toHaveBeenCalledWith('1');
  });

  it('handles fetch error', async () => {
    vi.mocked(rubricApi.getAllRubrics).mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useRubrics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles save error', async () => {
    vi.mocked(rubricApi.saveRubric).mockRejectedValue(new Error('Save failed'));
    vi.mocked(rubricApi.getAllRubrics).mockResolvedValue([]);

    const { result } = renderHook(() => useRubrics(), { wrapper });

    const criteria = [{ id: '1', name: 'Test', description: 'Test', maxPoints: 10 }];
    
    let savedId: string | null = null;
    await act(async () => {
      savedId = await result.current.saveRubric('New Rubric', criteria);
    });

    expect(savedId).toBeNull();
  });
});