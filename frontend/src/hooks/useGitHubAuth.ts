import { useState, useEffect, useCallback } from 'react';
import { authApi, storage } from '../services/auth';
import { GitHubUser } from '../types/auth';

interface UseGitHubAuthReturn {
  token: string | null;
  user: GitHubUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
}

export const useGitHubAuth = (): UseGitHubAuthReturn => {
  const [token, setToken] = useState<string | null>(storage.getToken());
  const [user, setUser] = useState<GitHubUser | null>(storage.getUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!token && !!user;

  const login = useCallback(async (newToken: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.validateToken(newToken);

      if (response.valid && response.user) {
        storage.setToken(newToken);
        storage.setUser(response.user);
        setToken(newToken);
        setUser(response.user);
        return true;
      } else {
        setError(response.error || 'Invalid token');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    storage.clear();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = storage.getToken();
      if (storedToken) {
        setIsLoading(true);
        try {
          const response = await authApi.validateToken(storedToken);
          if (!response.valid) {
            logout();
          }
        } catch {
          logout();
        } finally {
          setIsLoading(false);
        }
      }
    };

    verifyToken();
  }, [logout]);

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
};