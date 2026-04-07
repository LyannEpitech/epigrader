import { GitHubService } from '../../src/services/github';
import axios from 'axios';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GitHubService', () => {
  let service: GitHubService;

  beforeEach(() => {
    service = new GitHubService('test-token');
    jest.clearAllMocks();
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { login: 'testuser', id: 123 },
      });

      const result = await service.validateToken();

      expect(result).toEqual({ login: 'testuser', id: 123 });
    });

    it('should throw error for invalid token', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401 },
      });

      await expect(service.validateToken()).rejects.toThrow('Invalid token');
    });
  });

  describe('getRepo', () => {
    it('should fetch repository info', async () => {
      const mockRepoData = {
        name: 'test-repo',
        full_name: 'Epitech/test-repo',
        description: 'Test repository',
        stargazers_count: 10,
        language: 'C',
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockRepoData });

      const result = await service.getRepo('Epitech', 'test-repo');

      expect(result).toEqual(mockRepoData);
    });

    it('should throw error for non-existent repo', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404 },
      });

      await expect(service.getRepo('Epitech', 'non-existent')).rejects.toThrow('Repository not found');
    });

    it('should handle SAML SSO error', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { 
          status: 403,
          data: { message: 'SAML SSO required' },
        },
      });

      await expect(service.getRepo('Epitech', 'test-repo')).rejects.toThrow('SAML');
    });
  });

  describe('getTree', () => {
    it('should fetch repository tree', async () => {
      const mockTreeData = {
        tree: [
          { path: 'main.c', type: 'blob', sha: 'abc123' },
          { path: 'README.md', type: 'blob', sha: 'def456' },
        ],
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockTreeData });

      const result = await service.getTree('Epitech', 'test-repo', 'main');

      expect(result).toEqual(mockTreeData.tree);
    });

    it('should throw error on failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getTree('Epitech', 'test-repo', 'main')).rejects.toThrow();
    });
  });

  describe('getFileContent', () => {
    it('should fetch file content', async () => {
      const mockContent = Buffer.from('Hello World').toString('base64');

      mockedAxios.get.mockResolvedValueOnce({
        data: { content: mockContent, encoding: 'base64' },
      });

      const result = await service.getFileContent('Epitech', 'test-repo', 'README.md');

      expect(result).toBe('Hello World');
    });

    it('should throw error on failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getFileContent('Epitech', 'test-repo', 'README.md')).rejects.toThrow();
    });
  });
});