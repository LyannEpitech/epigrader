import axios from 'axios';
import { AuthResponse, GitHubUser } from '../types/auth';

const API_URL = '/api';

export const authApi = {
  validateToken: async (token: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/validate-token`, { token });
    return response.data;
  },
};

export const storage = {
  getToken: (): string | null => {
    return sessionStorage.getItem('github_pat');
  },
  
  setToken: (token: string): void => {
    sessionStorage.setItem('github_pat', token);
  },
  
  removeToken: (): void => {
    sessionStorage.removeItem('github_pat');
  },
  
  getUser: (): GitHubUser | null => {
    const user = sessionStorage.getItem('github_user');
    return user ? JSON.parse(user) : null;
  },
  
  setUser: (user: GitHubUser): void => {
    sessionStorage.setItem('github_user', JSON.stringify(user));
  },
  
  removeUser: (): void => {
    sessionStorage.removeItem('github_user');
  },
  
  clear: (): void => {
    sessionStorage.removeItem('github_pat');
    sessionStorage.removeItem('github_user');
  },
};