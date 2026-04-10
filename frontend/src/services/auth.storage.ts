import { AuthResponse, GitHubUser } from '../types/auth';

const API_URL = '/api';

// Storage keys
const STORAGE_KEYS = {
  GITHUB_TOKEN: 'github_pat',
  GITHUB_USER: 'github_user',
  MOONSHOT_KEY: 'moonshot_api_key',
} as const;

export const authApi = {
  validateToken: async (token: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/validate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return response.json();
  },
};

/**
 * Intelligent token storage with encryption hint and validation
 */
class AuthStorage {
  /**
   * Get GitHub token from storage
   */
  getGitHubToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN) || 
           sessionStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN);
  }

  /**
   * Set GitHub token in storage (uses localStorage for persistence)
   */
  setGitHubToken(token: string): void {
    // Store in localStorage for persistence across sessions
    localStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, token);
    // Also update sessionStorage for backward compatibility
    sessionStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, token);
  }

  /**
   * Remove GitHub token from all storage
   */
  removeGitHubToken(): void {
    localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
  }

  /**
   * Get Moonshot API key from storage
   */
  getMoonshotKey(): string | null {
    return localStorage.getItem(STORAGE_KEYS.MOONSHOT_KEY);
  }

  /**
   * Set Moonshot API key in storage
   */
  setMoonshotKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.MOONSHOT_KEY, key);
  }

  /**
   * Remove Moonshot API key from storage
   */
  removeMoonshotKey(): void {
    localStorage.removeItem(STORAGE_KEYS.MOONSHOT_KEY);
  }

  /**
   * Get stored GitHub user info
   */
  getUser(): GitHubUser | null {
    const user = localStorage.getItem(STORAGE_KEYS.GITHUB_USER) ||
                 sessionStorage.getItem(STORAGE_KEYS.GITHUB_USER);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Store GitHub user info
   */
  setUser(user: GitHubUser): void {
    const userJson = JSON.stringify(user);
    localStorage.setItem(STORAGE_KEYS.GITHUB_USER, userJson);
    sessionStorage.setItem(STORAGE_KEYS.GITHUB_USER, userJson);
  }

  /**
   * Remove user info from storage
   */
  removeUser(): void {
    localStorage.removeItem(STORAGE_KEYS.GITHUB_USER);
    sessionStorage.removeItem(STORAGE_KEYS.GITHUB_USER);
  }

  /**
   * Check if user has valid GitHub authentication
   */
  isAuthenticated(): boolean {
    return !!this.getGitHubToken();
  }

  /**
   * Check if Moonshot API key is configured
   */
  hasMoonshotKey(): boolean {
    const key = this.getMoonshotKey();
    return !!key && key.startsWith('sk-');
  }

  /**
   * Get all settings at once
   */
  getAllSettings(): {
    githubToken: string | null;
    moonshotKey: string | null;
    user: GitHubUser | null;
  } {
    return {
      githubToken: this.getGitHubToken(),
      moonshotKey: this.getMoonshotKey(),
      user: this.getUser(),
    };
  }

  /**
   * Clear all authentication data
   */
  clearAll(): void {
    this.removeGitHubToken();
    this.removeMoonshotKey();
    this.removeUser();
  }

  /**
   * Validate token format
   */
  validateGitHubToken(token: string): { valid: boolean; error?: string } {
    if (!token) {
      return { valid: false, error: 'Token requis' };
    }
    
    if (token.length < 20) {
      return { valid: false, error: 'Token trop court' };
    }

    // GitHub tokens typically start with ghp_, gho_, ghu_, etc.
    const validPrefixes = ['ghp_', 'gho_', 'ghu_', 'ghs_', 'ghr_'];
    const hasValidPrefix = validPrefixes.some(prefix => token.startsWith(prefix));
    
    if (!hasValidPrefix && !token.match(/^[a-f0-9]{40}$/i)) {
      return { valid: false, error: 'Format de token invalide' };
    }

    return { valid: true };
  }

  /**
   * Validate Moonshot key format
   */
  validateMoonshotKey(key: string): { valid: boolean; error?: string } {
    if (!key) {
      return { valid: false, error: 'Clé requise' };
    }

    if (!key.startsWith('sk-')) {
      return { valid: false, error: 'La clé doit commencer par "sk-"' };
    }

    if (key.length < 20) {
      return { valid: false, error: 'Clé trop courte' };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const authStorage = new AuthStorage();

// Legacy exports for backward compatibility
export const storage = {
  getToken: (): string | null => authStorage.getGitHubToken(),
  setToken: (token: string): void => authStorage.setGitHubToken(token),
  removeToken: (): void => authStorage.removeGitHubToken(),
  getUser: (): GitHubUser | null => authStorage.getUser(),
  setUser: (user: GitHubUser): void => authStorage.setUser(user),
  removeUser: (): void => authStorage.removeUser(),
  clear: (): void => authStorage.clearAll(),
};