import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { AuthPage } from '../src/pages/AuthPage';
import { useGitHubAuth } from '../src/hooks/useGitHubAuth';

vi.mock('../src/hooks/useGitHubAuth', () => ({
  useGitHubAuth: vi.fn(),
}));

describe('AuthPage', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useGitHubAuth).mockReturnValue({
      isAuthenticated: false,
      token: null,
      user: null,
      isLoading: false,
      error: null,
      login: mockLogin,
      logout: vi.fn(),
    });
  });

  it('renders auth page', () => {
    renderWithProviders(<AuthPage />, { withRouter: true });
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText(/Sign In with GitHub/i)).toBeInTheDocument();
  });

  it('shows error when submitting empty token', async () => {
    renderWithProviders(<AuthPage />, { withRouter: true });
    
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('calls login with token', async () => {
    mockLogin.mockResolvedValue(true);
    
    renderWithProviders(<AuthPage />, { withRouter: true });
    
    const input = screen.getByPlaceholderText(/ghp_/i);
    fireEvent.change(input, { target: { value: 'ghp_test123' } });
    
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('ghp_test123');
    });
  });

  it('toggles password visibility', () => {
    renderWithProviders(<AuthPage />, { withRouter: true });
    
    const input = screen.getByPlaceholderText(/ghp_/i) as HTMLInputElement;
    expect(input.type).toBe('password');
    
    const toggleButton = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleButton);
    
    expect(input.type).toBe('text');
  });

  it('shows loading state during authentication', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithProviders(<AuthPage />, { withRouter: true });
    
    const input = screen.getByPlaceholderText(/ghp_/i);
    fireEvent.change(input, { target: { value: 'ghp_test123' } });
    
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(document.body.textContent).toContain('Authenticating');
    });
  });
});