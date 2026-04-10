import axios, { AxiosInstance } from 'axios';
import { GitHubUser, GitHubRepo, TreeItem, GitHubCommit } from '../types/github.js';

export class GitHubService {
  private client: AxiosInstance;

  constructor(private token: string) {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'EpiGrader/1.0',
    };
    if (token && token.length > 10) {
      headers.Authorization = `Bearer ${token}`;
    }
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers,
    });

    // Add rate limit monitoring
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 403 && error.response?.headers['x-ratelimit-remaining'] === '0') {
          const resetTime = error.response.headers['x-ratelimit-reset'];
          const waitMs = (parseInt(resetTime) * 1000) - Date.now();
          console.warn(`[GitHub] Rate limit exceeded. Reset in ${Math.ceil(waitMs / 1000)}s`);
        }
        return Promise.reject(error);
      }
    );
  }

  async validateToken(): Promise<GitHubUser> {
    try {
      const response = await this.client.get('/user');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid token');
        }
        throw new Error(`GitHub API error: ${error.message}`);
      }
      throw error;
    }
  }

  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Repository not found');
        }
        if (error.response?.status === 403) {
          const message = error.response?.data?.message || '';
          if (message.includes('SAML')) {
            throw new Error('SAML SSO required: ' + message);
          }
          throw new Error('Access denied: ' + message);
        }
      }
      throw error;
    }
  }

  async getFileContent(owner: string, repo: string, path: string, sha?: string): Promise<string> {
    try {
      // If sha is provided, use blobs API (for large files)
      if (sha) {
        const response = await this.client.get(`/repos/${owner}/${repo}/git/blobs/${sha}`);
        const content = response.data.content;
        if (content) {
          return Buffer.from(content, 'base64').toString('utf-8');
        }
        return '';
      }

      // Otherwise use contents API
      const response = await this.client.get(`/repos/${owner}/${repo}/contents/${path}`);
      const content = response.data.content;
      
      // Handle large files or symlinks that don't have content
      if (!content) {
        // Try to get sha and use blobs API
        const sha = response.data.sha;
        if (sha) {
          console.log(`[GitHub] File ${path} too large for contents API, using blobs API`);
          return this.getFileContent(owner, repo, path, sha);
        }
        console.warn(`[GitHub] No content for ${path} - may be a symlink or large file`);
        return '';
      }
      
      return Buffer.from(content, 'base64').toString('utf-8');
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('File not found');
      }
      // Handle 403 errors (too large)
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        console.warn(`[GitHub] File ${path} too large or access denied`);
        return '';
      }
      throw error;
    }
  }

  async getRepoTree(owner: string, repo: string, sha: string = 'HEAD'): Promise<TreeItem[]> {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/git/trees/${sha}`, {
        params: { recursive: 1 },
      });
      return response.data.tree;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      console.error('[GitHub] getRepoTree error:', error.response?.status, message);
      if (message.includes('SAML')) {
        throw new Error('SAML SSO required. Visit https://github.com/orgs/EpitechBachelorPromo2028/sso to authorize your PAT');
      }
      throw new Error('Failed to fetch repository tree: ' + message);
    }
  }

  async getCommits(owner: string, repo: string, limit: number = 30): Promise<GitHubCommit[]> {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/commits`, {
        params: { per_page: limit },
      });
      return response.data.map((commit: { sha: string; commit: { message: string; author: { name: string; email: string; date: string }; committer: { name: string; email: string; date: string } } }) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author,
        committer: commit.commit.committer,
      }));
    } catch (error) {
      throw new Error('Failed to fetch commits');
    }
  }

  async getBranches(owner: string, repo: string): Promise<Array<{ name: string; default: boolean }>> {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/branches`, {
        params: { per_page: 100 },
      });
      return response.data.map((branch: { name: string; protected: boolean }) => ({
        name: branch.name,
        default: false, // Will be updated below
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      const status = error.response?.status;
      console.error(`[GitHub] getBranches error (${status}):`, message);
      if (status === 404) {
        throw new Error('Repository not found or private');
      }
      if (status === 403) {
        throw new Error('Access denied - check your GitHub token');
      }
      throw new Error(`Failed to fetch branches: ${message}`);
    }
  }

  parseRepoUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  }
}

export default GitHubService;