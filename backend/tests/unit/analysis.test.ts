import { AnalysisService } from '../../src/services/analysis';
import { Criterion } from '../../src/types/rubric';

// Mock dependencies
jest.mock('../../src/services/moonshot', () => ({
  MoonshotService: jest.fn().mockImplementation(() => ({
    analyzeCriterion: jest.fn().mockResolvedValue({
      score: 5,
      status: 'passed',
      justification: 'Test passed',
    }),
  })),
}));

jest.mock('../../src/services/github', () => ({
  GitHubService: jest.fn().mockImplementation(() => ({
    getRepoTree: jest.fn().mockResolvedValue([]),
    getFileContent: jest.fn().mockResolvedValue(''),
  })),
}));

jest.mock('../../src/services/cache', () => ({
  AnalysisCache: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockReturnValue(null),
    set: jest.fn(),
    clear: jest.fn(),
    delete: jest.fn(),
    getStats: jest.fn().mockReturnValue({ size: 0, entries: [] }),
  })),
}));

describe('AnalysisService', () => {
  let service: AnalysisService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AnalysisService();
  });

  describe('createJob', () => {
    it('should create a new job with correct properties', () => {
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      
      const job = service.createJob('https://github.com/Epitech/test', 'rubric-1', criteria);
      
      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.repoUrl).toBe('https://github.com/Epitech/test');
      expect(job.rubricId).toBe('rubric-1');
      expect(job.progress).toBe(0);
      expect(Array.isArray(job.steps)).toBe(true);
    });

    it('should create job with PAT', () => {
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      
      const job = service.createJob('https://github.com/Epitech/test', 'rubric-1', criteria, 'pat-token');
      
      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
    });

    it('should create unique job IDs', () => {
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      
      const job1 = service.createJob('https://github.com/Epitech/test1', 'rubric-1', criteria);
      const job2 = service.createJob('https://github.com/Epitech/test2', 'rubric-1', criteria);
      
      expect(job1.id).not.toBe(job2.id);
    });
  });

  describe('getJob', () => {
    it('should return job by id', () => {
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      const job = service.createJob('https://github.com/Epitech/test', 'rubric-1', criteria);
      
      const foundJob = service.getJob(job.id);
      
      expect(foundJob).toBeDefined();
      expect(foundJob?.id).toBe(job.id);
      expect(foundJob?.repoUrl).toBe('https://github.com/Epitech/test');
    });

    it('should return undefined for non-existent job', () => {
      const foundJob = service.getJob('non-existent-id');
      
      expect(foundJob).toBeUndefined();
    });
  });

  describe('getAllJobs', () => {
    it('should return jobs array', () => {
      const jobs = service.getAllJobs();
      
      expect(Array.isArray(jobs)).toBe(true);
    });

    it('should include created jobs', () => {
      const initialJobs = service.getAllJobs();
      const initialCount = initialJobs.length;
      
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      service.createJob('https://github.com/Epitech/test1', 'rubric-1', criteria);
      
      const jobs = service.getAllJobs();
      expect(jobs.length).toBe(initialCount + 1);
    });
  });

  describe('Cache operations', () => {
    it('should return cache stats', () => {
      const stats = service.getCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('entries');
    });

    it('should clear cache without error', () => {
      expect(() => service.clearCache()).not.toThrow();
    });

    it('should clear specific cache entry without error', () => {
      expect(() => service.clearCacheEntry('https://github.com/Epitech/test')).not.toThrow();
    });
  });
});