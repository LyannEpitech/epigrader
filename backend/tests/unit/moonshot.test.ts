import { MoonshotService } from '../../src/services/moonshot';

describe('MoonshotService', () => {
  let service: MoonshotService;

  beforeEach(() => {
    service = new MoonshotService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have analyzeCriterion method', () => {
    expect(typeof service.analyzeCriterion).toBe('function');
  });
});