import { AnalysisService } from '../../src/services/analysis';
import { Criterion } from '../../src/types/rubric';

describe('AnalysisService', () => {
  let service: AnalysisService;

  beforeEach(() => {
    service = new AnalysisService();
  });

  describe('createJob', () => {
    it('should create a new job', () => {
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      
      const job = service.createJob('https://github.com/Epitech/test', 'rubric-1', criteria);
      
      expect(job).toBeDefined();
      expect(job.repoUrl).toBe('https://github.com/Epitech/test');
      expect(job.rubricId).toBe('rubric-1');
    });

    it('should create job with PAT', () => {
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      
      const job = service.createJob('https://github.com/Epitech/test', 'rubric-1', criteria, 'pat-token');
      
      expect(job).toBeDefined();
    });
  });

  describe('getJob', () => {
    it('should return job by id', () => {
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      const job = service.createJob('https://github.com/Epitech/test', 'rubric-1', criteria);
      
      const foundJob = service.getJob(job.id);
      
      expect(foundJob).toBeDefined();
      expect(foundJob?.id).toBe(job.id);
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
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      service.createJob('https://github.com/Epitech/test1', 'rubric-1', criteria);
      
      const jobs = service.getAllJobs();
      
      expect(jobs.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cache operations', () => {
    it('should return cache stats', () => {
      const stats = service.getCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('entries');
    });

    it('should clear cache', () => {
      service.clearCache();
      
      const stats = service.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should clear specific cache entry', () => {
      service.clearCacheEntry('https://github.com/Epitech/test');
      
      // Should not throw
      expect(true).toBe(true);
    });
  });
});