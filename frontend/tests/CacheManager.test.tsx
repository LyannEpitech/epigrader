import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { CacheManager } from '../src/components/CacheManager';
import { analysisApi } from '../src/services/analysis';

vi.mock('../src/services/analysis', () => ({
  analysisApi: {
    getCacheEntries: vi.fn(),
    clearCache: vi.fn(),
    clearCacheEntry: vi.fn(),
  },
}));

describe('CacheManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders cache manager', () => {
    vi.mocked(analysisApi.getCacheEntries).mockResolvedValue({
      success: true,
      entries: [],
      totalEntries: 0,
    });

    renderWithProviders(<CacheManager />);
    
    // Component renders
    expect(document.body.textContent).toContain('Cached Repositories');
  });

  it('shows empty state when no cached entries', async () => {
    vi.mocked(analysisApi.getCacheEntries).mockResolvedValue({
      success: true,
      entries: [],
      totalEntries: 0,
    });

    renderWithProviders(<CacheManager />);
    
    await waitFor(() => {
      expect(document.body.textContent).toContain('No cached repositories');
    });
  });

  it('displays cached repositories', async () => {
    vi.mocked(analysisApi.getCacheEntries).mockResolvedValue({
      success: true,
      entries: [
        { repoUrl: 'https://github.com/Epitech/test1', cachedAt: Date.now() },
        { repoUrl: 'https://github.com/Epitech/test2', cachedAt: Date.now() },
      ],
      totalEntries: 2,
    });

    renderWithProviders(<CacheManager />);
    
    await waitFor(() => {
      expect(document.body.textContent).toContain('Epitech/test1');
      expect(document.body.textContent).toContain('Epitech/test2');
    });
  });
});