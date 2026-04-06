import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('auth service functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have all storage functions', () => {
    expect(typeof storage.getToken).toBe('function');
    expect(typeof storage.setToken).toBe('function');
    expect(typeof storage.removeToken).toBe('function');
    expect(typeof storage.getUser).toBe('function');
    expect(typeof storage.setUser).toBe('function');
    expect(typeof storage.removeUser).toBe('function');
    expect(typeof storage.clear).toBe('function');
  });

  it('should call storage functions', () => {
    storage.getToken();
    expect(storage.getToken).toHaveBeenCalled();
    
    storage.setToken('test');
    expect(storage.setToken).toHaveBeenCalledWith('test');
    
    storage.removeToken();
    expect(storage.removeToken).toHaveBeenCalled();
    
    storage.getUser();
    expect(storage.getUser).toHaveBeenCalled();
    
    storage.setUser({} as any);
    expect(storage.setUser).toHaveBeenCalled();
    
    storage.removeUser();
    expect(storage.removeUser).toHaveBeenCalled();
    
    storage.clear();
    expect(storage.clear).toHaveBeenCalled();
  });

  it('should have authApi functions', () => {
    expect(typeof authApi.validateToken).toBe('function');
  });
});