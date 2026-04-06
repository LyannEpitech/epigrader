import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HistoryPage } from '../src/pages/HistoryPage';
import { useHistory } from '../src/hooks/useHistory';
import { analysisApi } from '../src/services/analysis';
import { exportPdf } from '../src/services/history';

vi.mock('../src/hooks/useHistory', () => ({
  useHistory: vi.fn(),
}));

vi.mock('../src/services/analysis', () => ({
  analysisApi: {
    getJobStatus: vi.fn(),
  },
}));

vi.mock('../src/services/history', () => ({
  exportPdf: vi.fn(),
  historyApi: {
    getHistory: vi.fn(),
  },
}));

describe('HistoryPage', () => {
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', () => {
    vi.mocked(useHistory).mockReturnValue({
      history: [],
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<HistoryPage />);
    expect(screen.getByText('Analysis History')).toBeInTheDocument();
  });

  it('shows empty state when no history', () => {
    vi.mocked(useHistory).mockReturnValue({
      history: [],
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<HistoryPage />);
    expect(screen.getByText(/No analyses yet/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(useHistory).mockReturnValue({
      history: [],
      isLoading: true,
      error: null,
      refresh: mockRefresh,
    });

    render(<HistoryPage />);
    expect(screen.getByRole('button', { name: /Refresh/i })).toBeDisabled();
  });

  it('shows error message', () => {
    vi.mocked(useHistory).mockReturnValue({
      history: [],
      isLoading: false,
      error: 'Failed to load',
      refresh: mockRefresh,
    });

    render(<HistoryPage />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });



  it('calls refresh when button clicked', () => {
    vi.mocked(useHistory).mockReturnValue({
      history: [],
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<HistoryPage />);
    const button = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(button);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('loads job details when clicked', async () => {
    const mockJobDetails = {
      id: 'job-1',
      status: 'completed',
      repoUrl: 'https://github.com/Epitech/test',
      rubricId: 'rubric-1',
      progress: 100,
      result: {
        criteria: [
          { id: '1', name: 'Test Criterion', description: '', maxPoints: 10, score: 8, status: 'passed', justification: 'Good work', references: [] },
        ],
        totalScore: 8,
        maxScore: 10,
        globalComment: 'Well done',
        analyzedAt: '2024-01-01T00:01:00Z',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:01:00Z',
    };

    vi.mocked(useHistory).mockReturnValue({
      history: [
        {
          jobId: 'job-1',
          repoUrl: 'https://github.com/Epitech/test',
          rubricId: 'rubric-1',
          status: 'completed',
          progress: 100,
          totalScore: 8,
          maxScore: 10,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:01:00Z',
        },
      ],
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    });

    vi.mocked(analysisApi.getJobStatus).mockResolvedValue(mockJobDetails);

    render(<HistoryPage />);
    const historyItem = screen.getByText('Epitech/test');
    fireEvent.click(historyItem);

    await waitFor(() => {
      expect(screen.getByText('Well done')).toBeInTheDocument();
    });
  });
});