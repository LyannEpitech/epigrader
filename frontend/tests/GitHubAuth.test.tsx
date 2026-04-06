import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GitHubAuth } from '../src/components/GitHubAuth';
import { useGitHubAuth } from '../src/hooks/useGitHubAuth';

// Mock the hook
vi.mock('../src/hooks/useGitHubAuth', () => ({
  useGitHubAuth: vi.fn(),
}));

describe('GitHubAuth', () => {
  it('renders login form when not authenticated', () => {
    (useGitHubAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<GitHubAuth />);
    
    expect(screen.getByText('Connexion GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('Personal Access Token')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });

  it('shows user info when authenticated', () => {
    (useGitHubAuth as any).mockReturnValue({
      isAuthenticated: true,
      user: {
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://avatar.url',
      },
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<GitHubAuth />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Déconnexion/i })).toBeInTheDocument();
  });

  it('calls login with token when form submitted', async () => {
    const mockLogin = vi.fn().mockResolvedValue(true);
    (useGitHubAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: mockLogin,
      logout: vi.fn(),
    });

    render(<GitHubAuth />);
    
    const input = screen.getByLabelText('Personal Access Token');
    fireEvent.change(input, { target: { value: 'ghp_test_token' } });
    
    const button = screen.getByRole('button', { name: /Se connecter/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('ghp_test_token');
    });
  });

  it('displays error message when error exists', () => {
    (useGitHubAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: 'Invalid token',
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<GitHubAuth />);
    
    expect(screen.getByText('Invalid token')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useGitHubAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<GitHubAuth />);
    
    expect(screen.getByRole('button', { name: /Connexion/i })).toBeDisabled();
  });

  it('toggles password visibility', () => {
    (useGitHubAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<GitHubAuth />);
    
    const input = screen.getByLabelText('Personal Access Token');
    expect(input).toHaveAttribute('type', 'password');
    
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button
    fireEvent.click(toggleButton);
    
    expect(input).toHaveAttribute('type', 'text');
  });

  it('calls logout when logout button clicked', () => {
    const mockLogout = vi.fn();
    (useGitHubAuth as any).mockReturnValue({
      isAuthenticated: true,
      user: {
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://avatar.url',
      },
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: mockLogout,
    });

    render(<GitHubAuth />);
    
    const logoutButton = screen.getByRole('button', { name: /Déconnexion/i });
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });
});