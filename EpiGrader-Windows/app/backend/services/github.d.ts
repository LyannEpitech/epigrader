import { GitHubUser, GitHubRepo, TreeItem, GitHubCommit } from '../types/github.js';
export declare class GitHubService {
    private token;
    private client;
    constructor(token: string);
    validateToken(): Promise<GitHubUser>;
    getRepo(owner: string, repo: string): Promise<GitHubRepo>;
    getFileContent(owner: string, repo: string, path: string): Promise<string>;
    getRepoTree(owner: string, repo: string, sha?: string): Promise<TreeItem[]>;
    getCommits(owner: string, repo: string, limit?: number): Promise<GitHubCommit[]>;
    parseRepoUrl(url: string): {
        owner: string;
        repo: string;
    };
}
export default GitHubService;
//# sourceMappingURL=github.d.ts.map