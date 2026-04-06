import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnalysis } from '../src/hooks/useAnalysis';
import { analysisApi } from '../src/services/analysis';

vi.mock('../src/services/analysis', () => ({
  analysisApi: {
    startAnalysis: vi.fn(),
    getJobStatus: vi.fn(),
  },
}));

// Mock setInterval/clearInterval for tests
vi.useFakeTimers();

describe('useAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null job', () => {
    const { result } = renderHook(() => useAnalysis());
    expect(result.current.job).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should start analysis and set job', async () => {
    const mockJob = {
      id: 'job-1',
      status: 'pending' as const,
      repoUrl: 'https://github.com/test/repo',
      rubricId: 'rubric-1',
      progress: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    vi.mocked(analysisApi.startAnalysis).mockResolvedValue({ jobId: 'job-1', status: 'pending' });
    vi.mocked(analysisApi.getJobStatus).mockResolvedValue(mockJob);

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      await result.current.startAnalysis('https://github.com/test/repo', 'rubric-1');
    });

    expect(result.current.job).toEqual(mockJob);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle error when starting analysis', async () => {
    vi.mocked(analysisApi.startAnalysis).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      await result.current.startAnalysis('url', 'rubric');
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear job and error', async () => {
    vi.mocked(analysisApi.startAnalysis).mockResolvedValue({ jobId: 'job-1', status: 'pending' });
    vi.mocked(analysisApi.getJobStatus).mockResolvedValue({
      id: 'job-1',
      status: 'pending' as const,
      repoUrl: 'url',
      rubricId: 'rubric',
      progress: 0,
      createdAt: '',
      updatedAt: '',
    });

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      await result.current.startAnalysis('url', 'rubric');
    });

    expect(result.current.job).not.toBeNull();

    act(() => {
      result.current.clear();
    });

    expect(result.current.job).toBeNull();
    expect(result.current.error).toBeNull();
  });
});