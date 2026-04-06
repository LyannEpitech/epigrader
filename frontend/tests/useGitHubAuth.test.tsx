import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGitHubAuth } from '../src/hooks/useGitHubAuth';
import { authApi, storage } from '../src/services/auth';

// Mock the services
vi.mock('../src/services/auth', () => ({
  authApi: {
    validateToken: vi.fn(),
  },
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

describe('useGitHubAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with no auth when no stored token', () => {
    vi.mocked(storage.getToken).mockReturnValue(null);
    vi.mocked(storage.getUser).mockReturnValue(null);

    const { result } = renderHook(() => useGitHubAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('should initialize with auth when token exists', () => {
    const mockUser = { id: 1, login: 'testuser', name: 'Test', email: null, avatar_url: '', html_url: '' };
    vi.mocked(storage.getToken).mockReturnValue('valid_token');
    vi.mocked(storage.getUser).mockReturnValue(mockUser);

    const { result } = renderHook(() => useGitHubAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('valid_token');
    expect(result.current.user).toEqual(mockUser);
  });

  it('should login successfully', async () => {
    const mockUser = { id: 1, login: 'testuser', name: 'Test', email: null, avatar_url: '', html_url: '' };
    vi.mocked(authApi.validateToken).mockResolvedValue({ valid: true, user: mockUser });
    vi.mocked(storage.getToken).mockReturnValue(null);
    vi.mocked(storage.getUser).mockReturnValue(null);

    const { result } = renderHook(() => useGitHubAuth());

    let loginResult: boolean = false;
    await act(async () => {
      loginResult = await result.current.login('valid_token');
    });

    expect(loginResult).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(storage.setToken).toHaveBeenCalledWith('valid_token');
    expect(storage.setUser).toHaveBeenCalledWith(mockUser);
  });

  it('should handle login failure', async () => {
    vi.mocked(authApi.validateToken).mockResolvedValue({ valid: false, error: 'Invalid token' });
    vi.mocked(storage.getToken).mockReturnValue(null);
    vi.mocked(storage.getUser).mockReturnValue(null);

    const { result } = renderHook(() => useGitHubAuth());

    let loginResult: boolean = true;
    await act(async () => {
      loginResult = await result.current.login('invalid_token');
    });

    expect(loginResult).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Invalid token');
  });

  it('should logout successfully', async () => {
    const mockUser = { id: 1, login: 'testuser', name: 'Test', email: null, avatar_url: '', html_url: '' };
    vi.mocked(storage.getToken).mockReturnValue('token');
    vi.mocked(storage.getUser).mockReturnValue(mockUser);

    const { result } = renderHook(() => useGitHubAuth());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(storage.clear).toHaveBeenCalled();
  });

  it('should clear error on logout', async () => {
    vi.mocked(authApi.validateToken).mockResolvedValue({ valid: false, error: 'Invalid token' });
    vi.mocked(storage.getToken).mockReturnValue(null);
    vi.mocked(storage.getUser).mockReturnValue(null);

    const { result } = renderHook(() => useGitHubAuth());

    await act(async () => {
      await result.current.login('invalid_token');
    });

    expect(result.current.error).toBe('Invalid token');

    act(() => {
      result.current.logout();
    });

    expect(result.current.error).toBeNull();
  });
});