import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { Header } from '../src/components/Header';
import { useGitHubAuth } from '../src/hooks/useGitHubAuth';

vi.mock('../src/hooks/useGitHubAuth', () => ({
  useGitHubAuth: vi.fn(),
}));

describe('Header', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when not authenticated', () => {
    vi.mocked(useGitHubAuth).mockReturnValue({
      isAuthenticated: false,
      token: null,
      user: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: mockLogout,
    });

    renderWithProviders(<Header />, { withRouter: true });
    // Header returns null when not authenticated
    expect(document.body.textContent).not.toContain('EpiGrader');
  });

  it('renders header when authenticated', () => {
    vi.mocked(useGitHubAuth).mockReturnValue({
      isAuthenticated: true,
      token: 'test-token',
      user: { login: 'testuser', name: 'Test User', avatar_url: 'https://example.com/avatar.png', html_url: 'https://github.com/testuser' },
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: mockLogout,
    });

    renderWithProviders(<Header />, { withRouter: true });
    
    expect(screen.getByText('EpiGrader')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Rubrics')).toBeInTheDocument();
    expect(screen.getByText('Analyze')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('displays user info when authenticated', () => {
    vi.mocked(useGitHubAuth).mockReturnValue({
      isAuthenticated: true,
      token: 'test-token',
      user: { login: 'testuser', name: 'Test User', avatar_url: 'https://example.com/avatar.png', html_url: 'https://github.com/testuser' },
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: mockLogout,
    });

    renderWithProviders(<Header />, { withRouter: true });
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('calls logout when logout button clicked', () => {
    vi.mocked(useGitHubAuth).mockReturnValue({
      isAuthenticated: true,
      token: 'test-token',
      user: { login: 'testuser', name: 'Test User', avatar_url: 'https://example.com/avatar.png', html_url: 'https://github.com/testuser' },
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: mockLogout,
    });

    renderWithProviders(<Header />, { withRouter: true });
    
    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('has navigation links', () => {
    vi.mocked(useGitHubAuth).mockReturnValue({
      isAuthenticated: true,
      token: 'test-token',
      user: { login: 'testuser', name: 'Test User', avatar_url: 'https://example.com/avatar.png', html_url: 'https://github.com/testuser' },
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: mockLogout,
    });

    renderWithProviders(<Header />, { withRouter: true });
    
    // Check that navigation text is present
    expect(document.body.textContent).toContain('Dashboard');
    expect(document.body.textContent).toContain('Rubrics');
    expect(document.body.textContent).toContain('Analyze');
    expect(document.body.textContent).toContain('History');
  });
});