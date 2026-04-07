export interface GitHubUser {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
    html_url: string;
}
export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    default_branch: string;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    created_at: string;
    updated_at: string;
    pushed_at: string;
}
export interface TreeItem {
    path: string;
    mode: string;
    type: 'blob' | 'tree';
    sha: string;
    size?: number;
    url: string;
}
export interface GitHubCommit {
    sha: string;
    message: string;
    author: {
        name: string;
        email: string;
        date: string;
    };
    committer: {
        name: string;
        email: string;
        date: string;
    };
}
//# sourceMappingURL=github.d.ts.map