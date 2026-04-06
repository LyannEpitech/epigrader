import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRubricParser } from '../src/hooks/useRubricParser';
import { rubricApi } from '../src/services/rubric';

vi.mock('../src/services/rubric', () => ({
  rubricApi: {
    parseRubric: vi.fn(),
  },
}));

describe('useRubricParser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useRubricParser());

    expect(result.current.criteria).toEqual([]);
    expect(result.current.totalPoints).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should parse rubric successfully', async () => {
    const mockResponse = {
      success: true,
      criteria: [
        { id: '1', name: 'Test', description: 'Desc', maxPoints: 5 },
      ],
      totalPoints: 5,
      count: 1,
    };
    vi.mocked(rubricApi.parseRubric).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useRubricParser());

    let success = false;
    await act(async () => {
      success = await result.current.parseRubric('## Test (5 pts)');
    });

    expect(success).toBe(true);
    expect(result.current.criteria).toHaveLength(1);
    expect(result.current.totalPoints).toBe(5);
    expect(result.current.error).toBeNull();
  });

  it('should handle parse error', async () => {
    vi.mocked(rubricApi.parseRubric).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRubricParser());

    let success = true;
    await act(async () => {
      success = await result.current.parseRubric('content');
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Network error');
    expect(result.current.criteria).toHaveLength(0);
  });

  it('should clear state', async () => {
    const mockResponse = {
      success: true,
      criteria: [{ id: '1', name: 'Test', description: '', maxPoints: 5 }],
      totalPoints: 5,
      count: 1,
    };
    vi.mocked(rubricApi.parseRubric).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useRubricParser());

    await act(async () => {
      await result.current.parseRubric('content');
    });

    expect(result.current.criteria).toHaveLength(1);

    act(() => {
      result.current.clear();
    });

    expect(result.current.criteria).toHaveLength(0);
    expect(result.current.totalPoints).toBe(0);
    expect(result.current.error).toBeNull();
  });
});