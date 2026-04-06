import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useHistory } from '../src/hooks/useHistory';
import { historyApi } from '../src/services/history';

vi.mock('../src/services/history', () => ({
  historyApi: {
    getHistory: vi.fn(),
  },
}));

describe('useHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    vi.mocked(historyApi.getHistory).mockResolvedValue([]);

    const { result } = renderHook(() => useHistory());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.history).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should load history successfully', async () => {
    const mockHistory = [
      {
        jobId: 'job-1',
        repoUrl: 'https://github.com/test/repo',
        rubricId: 'rubric-1',
        status: 'completed',
        progress: 100,
        totalScore: 15,
        maxScore: 20,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:01:00Z',
      },
    ];
    vi.mocked(historyApi.getHistory).mockResolvedValue(mockHistory);

    const { result } = renderHook(() => useHistory());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].jobId).toBe('job-1');
    expect(result.current.error).toBeNull();
  });

  it('should handle error when loading history', async () => {
    vi.mocked(historyApi.getHistory).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useHistory());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.history).toEqual([]);
  });

  it('should refresh history', async () => {
    vi.mocked(historyApi.getHistory)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          jobId: 'job-2',
          repoUrl: 'https://github.com/test/repo2',
          rubricId: 'rubric-2',
          status: 'processing',
          progress: 50,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:30Z',
        },
      ]);

    const { result } = renderHook(() => useHistory());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.history).toHaveLength(0);

    // Refresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].jobId).toBe('job-2');
  });
});