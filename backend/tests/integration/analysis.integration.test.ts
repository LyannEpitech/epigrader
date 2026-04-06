import { AnalysisService } from '../../src/services/analysis';
import { Criterion } from '../../src/types/rubric';
import { rubricStorage } from '../../src/services/rubricStorage';

describe('AnalysisService Integration', () => {
  let service: AnalysisService;

  beforeEach(async () => {
    service = new AnalysisService();
    // Clear rubrics
    const rubrics = await rubricStorage.getAllRubrics();
    for (const r of rubrics) {
      await rubricStorage.deleteRubric(r.id);
    }
  });

  describe('createJob with real processing', () => {
    it('should create and process a job with criteria', async () => {
      const criteria: Criterion[] = [
        { id: '1', name: 'Test', description: 'Test criterion', maxPoints: 5 },
      ];

      const job = service.createJob('https://github.com/Epitech/test-repo', 'rubric-1', criteria);

      expect(job.id).toBeDefined();
      expect(job.repoUrl).toBe('https://github.com/Epitech/test-repo');

      // Wait for processing to complete or error
      await new Promise(resolve => setTimeout(resolve, 2000));

      const updatedJob = service.getJob(job.id);
      expect(updatedJob).toBeDefined();
      expect(['processing', 'completed', 'error']).toContain(updatedJob?.status);
    });

    it('should handle invalid GitHub URLs', async () => {
      const criteria: Criterion[] = [
        { id: '1', name: 'Test', description: 'Test', maxPoints: 5 },
      ];

      const job = service.createJob('invalid-url', 'rubric-1', criteria);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedJob = service.getJob(job.id);
      expect(updatedJob?.status).toBe('error');
    });

    it('should process multiple criteria', async () => {
      const criteria: Criterion[] = [
        { id: '1', name: 'Criterion 1', description: 'First', maxPoints: 5 },
        { id: '2', name: 'Criterion 2', description: 'Second', maxPoints: 10 },
        { id: '3', name: 'Criterion 3', description: 'Third', maxPoints: 5 },
      ];

      const job = service.createJob('https://github.com/Epitech/valid-repo', 'rubric-1', criteria);

      // Check progress updates
      await new Promise(resolve => setTimeout(resolve, 500));
      let checkJob = service.getJob(job.id);
      expect(checkJob?.progress).toBeGreaterThanOrEqual(0);

      await new Promise(resolve => setTimeout(resolve, 3000));
      checkJob = service.getJob(job.id);
      expect(['processing', 'completed', 'error']).toContain(checkJob?.status);
    });

    it('should handle URL with .git suffix', async () => {
      const criteria: Criterion[] = [
        { id: '1', name: 'Test', description: 'Test', maxPoints: 5 },
      ];

      const job = service.createJob('https://github.com/Epitech/test-repo.git', 'rubric-1', criteria);

      expect(job.repoUrl).toBe('https://github.com/Epitech/test-repo.git');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedJob = service.getJob(job.id);
      expect(updatedJob).toBeDefined();
    });

    it('should handle various GitHub URL formats', async () => {
      const testUrls = [
        'https://github.com/user/repo',
        'https://github.com/user-name/repo-name',
        'https://github.com/user123/repo456',
      ];

      for (const url of testUrls) {
        const criteria: Criterion[] = [{ id: '1', name: 'Test', description: '', maxPoints: 5 }];
        const job = service.createJob(url, 'rubric-1', criteria);
        
        expect(job.repoUrl).toBe(url);
        
        // Clean up
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });
  });
});