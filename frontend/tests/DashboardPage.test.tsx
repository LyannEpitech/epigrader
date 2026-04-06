import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardPage } from '../src/pages/DashboardPage';
import { useHistory } from '../src/hooks/useHistory';
import { useGitHubAuth } from '../src/hooks/useGitHubAuth';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../src/hooks/useHistory', () => ({
  useHistory: vi.fn(),
}));

vi.mock('../src/hooks/useGitHubAuth', () => ({
  useGitHubAuth: vi.fn(),
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.mocked(useGitHubAuth).mockReturnValue({
      isAuthenticated: true,
      token: 'test-token',
      user: { login: 'testuser', name: 'Test User', avatar_url: '', html_url: '' },
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('renders dashboard title', () => {
    vi.mocked(useHistory).mockReturnValue({
      history: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    renderWithRouter(<DashboardPage />);
    expect(screen.getByText('EpiGrader')).toBeInTheDocument();
  });

  it('displays all stats cards', () => {
    vi.mocked(useHistory).mockReturnValue({
      history: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    renderWithRouter(<DashboardPage />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('shows correct stats counts', () => {
    vi.mocked(useHistory).mockReturnValue({
      history: [
        { jobId: '1', status: 'completed', repoUrl: 'test', rubricId: '1', progress: 100, totalScore: 10, maxScore: 10, createdAt: '', updatedAt: '' },
        { jobId: '2', status: 'completed', repoUrl: 'test', rubricId: '1', progress: 100, totalScore: 15, maxScore: 20, createdAt: '', updatedAt: '' },
        { jobId: '3', status: 'error', repoUrl: 'test', rubricId: '1', progress: 0, createdAt: '', updatedAt: '' },
        { jobId: '4', status: 'processing', repoUrl: 'test', rubricId: '1', progress: 50, createdAt: '', updatedAt: '' },
      ],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    renderWithRouter(<DashboardPage />);
    // Check that stats are displayed (2 completed, 1 processing, 1 failed, 4 total)
    expect(screen.getByText('Completed').nextElementSibling?.textContent).toBe('2');
    expect(screen.getByText('Failed').nextElementSibling?.textContent).toBe('1');
    expect(screen.getByText('Total').nextElementSibling?.textContent).toBe('4');
  });

  it('shows quick action cards', () => {
    vi.mocked(useHistory).mockReturnValue({
      history: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    renderWithRouter(<DashboardPage />);
    expect(screen.getByText('Manage Rubrics')).toBeInTheDocument();
    expect(screen.getByText('New Analysis')).toBeInTheDocument();
    expect(screen.getByText('View History')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(useHistory).mockReturnValue({
      history: [],
      isLoading: true,
      error: null,
      refresh: vi.fn(),
    });

    renderWithRouter(<DashboardPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays recent analyses', () => {
    vi.mocked(useHistory).mockReturnValue({
      history: [
        { jobId: '1', status: 'completed', repoUrl: 'https://github.com/Epitech/test1', rubricId: '1', progress: 100, totalScore: 15, maxScore: 20, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:01:00Z' },
        { jobId: '2', status: 'completed', repoUrl: 'https://github.com/Epitech/test2', rubricId: '1', progress: 100, totalScore: 18, maxScore: 20, createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:01:00Z' },
      ],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });

    renderWithRouter(<DashboardPage />);
    expect(screen.getByText('Recent Analyses')).toBeInTheDocument();
    expect(screen.getByText('Epitech/test1')).toBeInTheDocument();
    expect(screen.getByText('Epitech/test2')).toBeInTheDocument();
  });
});