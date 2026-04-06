import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi, storage } from '../src/services/auth';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('storage functions', () => {
    it('getToken should call sessionStorage.getItem', () => {
      mockSessionStorage.getItem.mockReturnValue('test_token');
      const result = storage.getToken();
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('github_pat');
      expect(result).toBe('test_token');
    });

    it('setToken should call sessionStorage.setItem', () => {
      storage.setToken('test_token');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('github_pat', 'test_token');
    });

    it('removeToken should call sessionStorage.removeItem', () => {
      storage.removeToken();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('github_pat');
    });

    it('getUser should parse JSON from sessionStorage', () => {
      const mockUser = { id: 1, login: 'test', name: 'Test', email: null, avatar_url: '', html_url: '' };
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
      const result = storage.getUser();
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('github_user');
      expect(result).toEqual(mockUser);
    });

    it('getUser should return null if no user', () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      const result = storage.getUser();
      expect(result).toBeNull();
    });

    it('setUser should stringify and store', () => {
      const mockUser = { id: 1, login: 'test', name: 'Test', email: null, avatar_url: '', html_url: '' };
      storage.setUser(mockUser);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('github_user', JSON.stringify(mockUser));
    });

    it('removeUser should call sessionStorage.removeItem', () => {
      storage.removeUser();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('github_user');
    });

    it('clear should remove both items', () => {
      storage.clear();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('github_pat');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('github_user');
    });
  });

  describe('authApi functions', () => {
    it('should have validateToken function', () => {
      expect(typeof authApi.validateToken).toBe('function');
    });
  });
});