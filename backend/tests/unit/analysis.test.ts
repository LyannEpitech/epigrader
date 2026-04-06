import { AnalysisService } from '../../src/services/analysis';
import { Criterion } from '../../src/types/rubric';

describe('AnalysisService', () => {
  let service: AnalysisService;

  beforeEach(() => {
    service = new AnalysisService();
  });

  describe('createJob', () => {
    it('should create a new job', () => {
      const criteria: Criterion[] = [
        { id: '1', name: 'Test', description: 'Desc', maxPoints: 5 },
      ];

      const job = service.createJob('https://github.com/test/repo', 'rubric-1', criteria);

      expect(job).toBeDefined();
      expect(job.repoUrl).toBe('https://github.com/test/repo');
      expect(job.rubricId).toBe('rubric-1');
      expect(job.id).toBeDefined();
      expect(['pending', 'processing']).toContain(job.status);
    });

    it('should generate unique job IDs', () => {
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];

      const job1 = service.createJob('url1', 'rubric-1', criteria);
      const job2 = service.createJob('url2', 'rubric-2', criteria);

      expect(job1.id).not.toBe(job2.id);
    });
  });

  describe('getJob', () => {
    it('should return job by ID', () => {
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      const job = service.createJob('url', 'rubric-1', criteria);

      const found = service.getJob(job.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(job.id);
    });

    it('should return undefined for non-existent job', () => {
      const found = service.getJob('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('getAllJobs', () => {
    it('should return all jobs sorted by date', () => {
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      
      // Create multiple jobs
      const job1 = service.createJob('https://github.com/user/repo1', 'rubric-1', criteria);
      const job2 = service.createJob('https://github.com/user/repo2', 'rubric-1', criteria);
      const job3 = service.createJob('https://github.com/user/repo3', 'rubric-1', criteria);

      const allJobs = service.getAllJobs();
      
      expect(allJobs.length).toBeGreaterThanOrEqual(3);
      expect(allJobs[0].id).toBe(job3.id); // Most recent first
    });
  });

  describe('getRecentJobs', () => {
    it('should return limited number of jobs', () => {
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      
      // Create multiple jobs
      for (let i = 0; i < 5; i++) {
        service.createJob(`https://github.com/user/repo${i}`, 'rubric-1', criteria);
      }

      const recentJobs = service.getRecentJobs(3);
      
      expect(recentJobs.length).toBeLessThanOrEqual(3);
    });

    it('should use default limit of 10', () => {
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      
      // Create multiple jobs
      for (let i = 0; i < 15; i++) {
        service.createJob(`https://github.com/user/repo${i}`, 'rubric-1', criteria);
      }

      const recentJobs = service.getRecentJobs();
      
      expect(recentJobs.length).toBeLessThanOrEqual(10);
    });
  });
});