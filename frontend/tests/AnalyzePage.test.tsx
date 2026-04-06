import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { AnalyzePage } from '../src/pages/AnalyzePage';
import { useAnalysis } from '../src/hooks/useAnalysis';
import { rubricApi } from '../src/services/rubric';

vi.mock('../src/hooks/useAnalysis', () => ({
  useAnalysis: vi.fn(),
}));

vi.mock('../src/services/rubric', () => ({
  rubricApi: {
    getAllRubrics: vi.fn(),
  },
}));

describe('AnalyzePage', () => {
  const mockStartAnalysis = vi.fn();
  const mockClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useAnalysis).mockReturnValue({
      job: null,
      isLoading: false,
      error: null,
      startAnalysis: mockStartAnalysis,
      clear: mockClear,
    });

    vi.mocked(rubricApi.getAllRubrics).mockResolvedValue([]);
  });

  it('renders analyze page title', () => {
    renderWithProviders(<AnalyzePage />, { withRouter: true });
    expect(screen.getByText('Analyze Repository')).toBeInTheDocument();
  });

  it('displays analysis results when completed', () => {
    vi.mocked(useAnalysis).mockReturnValue({
      job: {
        id: 'job-1',
        status: 'completed',
        repoUrl: 'https://github.com/Epitech/test',
        rubricId: '1',
        progress: 100,
        result: {
          criteria: [
            { id: '1', name: 'Code Quality', score: 8, maxPoints: 10, status: 'passed', justification: 'Good', references: [] },
          ],
          totalScore: 8,
          maxScore: 10,
          globalComment: 'Well done',
          analyzedAt: new Date().toISOString(),
        },
        steps: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
      error: null,
      startAnalysis: mockStartAnalysis,
      clear: mockClear,
    });

    renderWithProviders(<AnalyzePage />, { withRouter: true });
    
    expect(screen.getByText('Total Score')).toBeInTheDocument();
    expect(screen.getByText('Well done')).toBeInTheDocument();
    expect(screen.getByText('Code Quality')).toBeInTheDocument();
  });

  it('calls clear when clear button clicked', () => {
    vi.mocked(useAnalysis).mockReturnValue({
      job: {
        id: 'job-1',
        status: 'completed',
        repoUrl: 'https://github.com/Epitech/test',
        rubricId: '1',
        progress: 100,
        result: {
          criteria: [],
          totalScore: 0,
          maxScore: 0,
          globalComment: '',
          analyzedAt: new Date().toISOString(),
        },
        steps: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
      error: null,
      startAnalysis: mockStartAnalysis,
      clear: mockClear,
    });

    renderWithProviders(<AnalyzePage />, { withRouter: true });
    
    const clearButton = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearButton);

    expect(mockClear).toHaveBeenCalled();
  });
});