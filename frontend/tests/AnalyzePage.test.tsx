import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyzePage } from '../src/pages/AnalyzePage';
import { useAnalysis } from '../src/hooks/useAnalysis';
import { rubricStorage } from '../src/services/rubric';

vi.mock('../src/hooks/useAnalysis', () => ({
  useAnalysis: vi.fn(),
}));

vi.mock('../src/services/rubric', () => ({
  rubricStorage: {
    getAllRubrics: vi.fn(() => [
      { id: 'rubric-1', name: 'Test Rubric', totalPoints: 15, criteria: [] },
    ]),
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
  });

  it('renders page title', () => {
    render(<AnalyzePage />);
    expect(screen.getByText('Analyze Repository')).toBeInTheDocument();
  });

  it('has repo URL input', () => {
    render(<AnalyzePage />);
    expect(screen.getByPlaceholderText(/github.com\/Epitech/i)).toBeInTheDocument();
  });

  it('has rubric select dropdown', () => {
    render(<AnalyzePage />);
    expect(screen.getByText(/Choose a rubric/i)).toBeInTheDocument();
  });

  it('shows error when present', () => {
    vi.mocked(useAnalysis).mockReturnValue({
      job: null,
      isLoading: false,
      error: 'Test error',
      startAnalysis: mockStartAnalysis,
      clear: mockClear,
    });

    render(<AnalyzePage />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('calls startAnalysis when button clicked with valid data', async () => {
    render(<AnalyzePage />);
    
    const urlInput = screen.getByPlaceholderText(/github.com\/Epitech/i);
    fireEvent.change(urlInput, { target: { value: 'https://github.com/Epitech/test' } });
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'rubric-1' } });
    
    const button = screen.getByRole('button', { name: /Start Analysis/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockStartAnalysis).toHaveBeenCalledWith('https://github.com/Epitech/test', 'rubric-1');
    });
  });

  it('displays results when job is completed', () => {
    vi.mocked(useAnalysis).mockReturnValue({
      job: {
        id: 'job-1',
        status: 'completed' as const,
        repoUrl: 'https://github.com/test/repo',
        rubricId: 'rubric-1',
        progress: 100,
        result: {
          criteria: [
            { id: '1', name: 'Test Criterion', description: '', maxPoints: 5, score: 4, status: 'passed' as const, justification: 'Good work', references: [] },
          ],
          totalScore: 4,
          maxScore: 5,
          globalComment: 'Analysis complete',
          analyzedAt: '2024-01-01',
        },
        createdAt: '',
        updatedAt: '',
      },
      isLoading: false,
      error: null,
      startAnalysis: mockStartAnalysis,
      clear: mockClear,
    });

    render(<AnalyzePage />);
    expect(screen.getByText('Test Criterion')).toBeInTheDocument();
    expect(screen.getByText('Good work')).toBeInTheDocument();
  });

  it('calls clear when clear button clicked', () => {
    vi.mocked(useAnalysis).mockReturnValue({
      job: { id: 'job-1', status: 'completed', repoUrl: '', rubricId: '', progress: 100, createdAt: '', updatedAt: '' },
      isLoading: false,
      error: null,
      startAnalysis: mockStartAnalysis,
      clear: mockClear,
    });

    render(<AnalyzePage />);
    const button = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(button);
    
    expect(mockClear).toHaveBeenCalled();
  });
});