"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubService = void 0;
const axios_1 = __importDefault(require("axios"));
class GitHubService {
    token;
    client;
    constructor(token) {
        this.token = token;
        const headers = {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'EpiGrader/1.0',
        };
        if (token && token.startsWith('ghp_') && token.length > 10) {
            headers.Authorization = `Bearer ${token}`;
        }
        this.client = axios_1.default.create({
            baseURL: 'https://api.github.com',
            headers,
        });
        // Add rate limit monitoring
        this.client.interceptors.response.use((response) => response, async (error) => {
            if (error.response?.status === 403 && error.response?.headers['x-ratelimit-remaining'] === '0') {
                const resetTime = error.response.headers['x-ratelimit-reset'];
                const waitMs = (parseInt(resetTime) * 1000) - Date.now();
                console.warn(`[GitHub] Rate limit exceeded. Reset in ${Math.ceil(waitMs / 1000)}s`);
            }
            return Promise.reject(error);
        });
    }
    async validateToken() {
        try {
            const response = await this.client.get('/user');
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Invalid token');
                }
                throw new Error(`GitHub API error: ${error.message}`);
            }
            throw error;
        }
    }
    async getRepo(owner, repo) {
        try {
            const response = await this.client.get(`/repos/${owner}/${repo}`);
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
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
    async getFileContent(owner, repo, path) {
        try {
            const response = await this.client.get(`/repos/${owner}/${repo}/contents/${path}`);
            const content = response.data.content;
            return Buffer.from(content, 'base64').toString('utf-8');
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                throw new Error('File not found');
            }
            throw error;
        }
    }
    async getRepoTree(owner, repo, sha = 'HEAD') {
        try {
            const response = await this.client.get(`/repos/${owner}/${repo}/git/trees/${sha}`, {
                params: { recursive: 1 },
            });
            return response.data.tree;
        }
        catch (error) {
            const message = error.response?.data?.message || error.message;
            console.error('[GitHub] getRepoTree error:', error.response?.status, message);
            if (message.includes('SAML')) {
                throw new Error('SAML SSO required. Visit https://github.com/orgs/EpitechBachelorPromo2028/sso to authorize your PAT');
            }
            throw new Error('Failed to fetch repository tree: ' + message);
        }
    }
    async getCommits(owner, repo, limit = 30) {
        try {
            const response = await this.client.get(`/repos/${owner}/${repo}/commits`, {
                params: { per_page: limit },
            });
            return response.data.map((commit) => ({
                sha: commit.sha,
                message: commit.commit.message,
                author: commit.commit.author,
                committer: commit.commit.committer,
            }));
        }
        catch (error) {
            throw new Error('Failed to fetch commits');
        }
    }
    parseRepoUrl(url) {
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) {
            throw new Error('Invalid GitHub URL');
        }
        return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
}
exports.GitHubService = GitHubService;
exports.default = GitHubService;
//# sourceMappingURL=github.js.map