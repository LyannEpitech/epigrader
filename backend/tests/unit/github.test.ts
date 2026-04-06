import { GitHubService } from '../../src/services/github';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    interceptors: {
      response: { use: jest.fn() },
    },
  })),
}));

describe('GitHubService', () => {
  let service: GitHubService;
  const mockToken = 'ghp_test_token';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GitHubService(mockToken);
  });

  describe('parseRepoUrl', () => {
    it('should parse valid GitHub URL', () => {
      const result = service.parseRepoUrl('https://github.com/Epitech/my_project');
      expect(result).toEqual({ owner: 'Epitech', repo: 'my_project' });
    });

    it('should parse URL with .git suffix', () => {
      const result = service.parseRepoUrl('https://github.com/Epitech/my_project.git');
      expect(result).toEqual({ owner: 'Epitech', repo: 'my_project' });
    });

    it('should throw error for invalid URL', () => {
      expect(() => service.parseRepoUrl('invalid-url')).toThrow('Invalid GitHub URL');
    });
  });
});