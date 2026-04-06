import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RubricPage } from '../src/pages/RubricPage';
import { useRubricParser } from '../src/hooks/useRubricParser';

vi.mock('../src/hooks/useRubricParser', () => ({
  useRubricParser: vi.fn(),
}));

describe('RubricPage', () => {
  const mockParseRubric = vi.fn();
  const mockClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRubricParser).mockReturnValue({
      criteria: [],
      totalPoints: 0,
      isLoading: false,
      error: null,
      parseRubric: mockParseRubric,
      clear: mockClear,
    });
  });

  it('renders page title', () => {
    render(<RubricPage />);
    expect(screen.getByText('Rubric Parser')).toBeInTheDocument();
  });

  it('has textarea for input', () => {
    render(<RubricPage />);
    expect(screen.getByPlaceholderText(/Paste your rubric here/i)).toBeInTheDocument();
  });

  it('calls parseRubric when button clicked', async () => {
    render(<RubricPage />);
    
    const textarea = screen.getByPlaceholderText(/Paste your rubric here/i);
    fireEvent.change(textarea, { target: { value: '## Test (5 pts)' } });
    
    const button = screen.getByRole('button', { name: /Parse Rubric/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockParseRubric).toHaveBeenCalledWith('## Test (5 pts)');
    });
  });

  it('loads example when clicked', () => {
    render(<RubricPage />);
    
    const button = screen.getByText(/Load Example/i);
    fireEvent.click(button);
    
    const textarea = screen.getByPlaceholderText(/Paste your rubric here/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Presentation');
  });

  it('displays error when present', () => {
    vi.mocked(useRubricParser).mockReturnValue({
      criteria: [],
      totalPoints: 0,
      isLoading: false,
      error: 'Parse error',
      parseRubric: mockParseRubric,
      clear: mockClear,
    });

    render(<RubricPage />);
    expect(screen.getByText('Parse error')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(useRubricParser).mockReturnValue({
      criteria: [],
      totalPoints: 0,
      isLoading: true,
      error: null,
      parseRubric: mockParseRubric,
      clear: mockClear,
    });

    render(<RubricPage />);
    expect(screen.getByText(/Parsing/i)).toBeInTheDocument();
  });

  it('shows save and clear buttons when criteria exist', () => {
    vi.mocked(useRubricParser).mockReturnValue({
      criteria: [{ id: '1', name: 'Test', description: '', maxPoints: 5 }],
      totalPoints: 5,
      isLoading: false,
      error: null,
      parseRubric: mockParseRubric,
      clear: mockClear,
    });

    render(<RubricPage />);
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
  });

  it('calls clear when clear button clicked', () => {
    vi.mocked(useRubricParser).mockReturnValue({
      criteria: [{ id: '1', name: 'Test', description: '', maxPoints: 5 }],
      totalPoints: 5,
      isLoading: false,
      error: null,
      parseRubric: mockParseRubric,
      clear: mockClear,
    });

    render(<RubricPage />);
    const button = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(button);
    
    expect(mockClear).toHaveBeenCalled();
  });
});