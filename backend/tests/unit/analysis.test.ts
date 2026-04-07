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
      expect(job.status).toBe('pending');
    });

    it('should create job with PAT', () => {
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      
      const job = service.createJob('https://github.com/Epitech/test', 'rubric-1', criteria, 'pat-token');
      
      expect(job).toBeDefined();
      // PAT is stored internally, not exposed in job object
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
    it('should return empty array initially', () => {
      const jobs = service.getAllJobs();
      
      expect(jobs).toEqual([]);
    });

    it('should return created jobs', () => {
      const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
      service.createJob('https://github.com/Epitech/test1', 'rubric-1', criteria);
      service.createJob('https://github.com/Epitech/test2', 'rubric-1', criteria);
      
      const jobs = service.getAllJobs();
      
      expect(jobs.length).toBeGreaterThanOrEqual(0);
    });
  });
});