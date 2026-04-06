// Direct import test
import { GitHubService } from '../../src/services/github';

describe('GitHubService', () => {
  describe('constructor', () => {
    it('should instantiate with token', () => {
      const service = new GitHubService('test_token');
      expect(service).toBeInstanceOf(GitHubService);
    });
  });

  describe('parseRepoUrl', () => {
    it('should parse valid repo URL', () => {
      const service = new GitHubService('test_token');
      const result = service.parseRepoUrl('https://github.com/Epitech/my_project');
      expect(result).toEqual({ owner: 'Epitech', repo: 'my_project' });
    });

    it('should parse URL with .git suffix', () => {
      const service = new GitHubService('test_token');
      const result = service.parseRepoUrl('https://github.com/Epitech/my_project.git');
      expect(result).toEqual({ owner: 'Epitech', repo: 'my_project' });
    });

    it('should throw for invalid URL', () => {
      const service = new GitHubService('test_token');
      expect(() => service.parseRepoUrl('invalid')).toThrow('Invalid GitHub URL');
    });

    it('should throw for non-GitHub URL', () => {
      const service = new GitHubService('test_token');
      expect(() => service.parseRepoUrl('https://gitlab.com/user/repo')).toThrow('Invalid GitHub URL');
    });
  });
});