import { GitHubService } from '../../src/services/github';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GitHubService', () => {
  let service: GitHubService;
  const mockToken = 'ghp_test_token';

  beforeEach(() => {
    service = new GitHubService(mockToken);
    jest.clearAllMocks();
  });

  describe('validateToken', () => {
    it('should return user data for valid token', async () => {
      const mockUser = {
        id: 123,
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: 'https://avatar.url',
        html_url: 'https://github.com/testuser',
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockUser }),
        interceptors: {
          response: { use: jest.fn() },
        },
      } as any);

      // Recreate service with mocked axios
      service = new GitHubService(mockToken);
      
      // Mock the actual call
      const mockClient = (service as any).client;
      mockClient.get = jest.fn().mockResolvedValue({ data: mockUser });

      const result = await service.validateToken();

      expect(result).toEqual(mockUser);
    });

    it('should throw error for invalid token', async () => {
      const mockClient = (service as any).client;
      mockClient.get = jest.fn().mockRejectedValue({
        response: { status: 401 },
        isAxiosError: true,
      });

      await expect(service.validateToken()).rejects.toThrow('Invalid token');
    });
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