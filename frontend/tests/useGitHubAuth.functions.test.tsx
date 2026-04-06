import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGitHubAuth } from '../src/hooks/useGitHubAuth';
import { authApi, storage } from '../src/services/auth';

vi.mock('../src/services/auth', () => ({
  authApi: { validateToken: vi.fn() },
  storage: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    removeToken: vi.fn(),
    getUser: vi.fn(),
    setUser: vi.fn(),
    removeUser: vi.fn(),
    clear: vi.fn(),
  },
}));

describe('useGitHubAuth functions coverage', () => {
  it('should expose all functions', () => {
    (storage.getToken as any).mockReturnValue(null);
    (storage.getUser as any).mockReturnValue(null);

    const { result } = renderHook(() => useGitHubAuth());

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });
});