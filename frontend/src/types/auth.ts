export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
}

export interface AuthResponse {
  valid: boolean;
  user?: GitHubUser;
  error?: string;
}