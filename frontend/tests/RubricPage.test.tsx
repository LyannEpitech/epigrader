import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { RubricPage } from '../src/pages/RubricPage';
import { useRubricParser } from '../src/hooks/useRubricParser';
import { useRubrics } from '../src/hooks/useRubrics';

vi.mock('../src/hooks/useRubricParser', () => ({
  useRubricParser: vi.fn(),
}));

vi.mock('../src/hooks/useRubrics', () => ({
  useRubrics: vi.fn(),
}));

describe('RubricPage', () => {
  const mockParseRubric = vi.fn();
  const mockClear = vi.fn();
  const mockSaveRubric = vi.fn();
  const mockDeleteRubric = vi.fn();
  const mockFetchRubrics = vi.fn();

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

    vi.mocked(useRubrics).mockReturnValue({
      rubrics: [],
      isLoading: false,
      fetchRubrics: mockFetchRubrics,
      saveRubric: mockSaveRubric,
      deleteRubric: mockDeleteRubric,
    });
  });

  it('renders rubric parser title', () => {
    renderWithProviders(<RubricPage />, { withRouter: true });
    expect(screen.getByText('Rubric Parser')).toBeInTheDocument();
  });

  it('shows empty state when no rubrics', () => {
    renderWithProviders(<RubricPage />, { withRouter: true });
    expect(document.body.textContent).toContain('No saved rubrics yet');
  });

  it('calls parseRubric when parse button clicked', async () => {
    mockParseRubric.mockResolvedValue(true);
    
    renderWithProviders(<RubricPage />, { withRouter: true });
    
    const textarea = screen.getByPlaceholderText(/Paste your rubric here/i);
    fireEvent.change(textarea, { target: { value: '## Test (10 pts)' } });
    
    const parseButton = screen.getByRole('button', { name: /Parse Rubric/i });
    fireEvent.click(parseButton);

    await waitFor(() => {
      expect(mockParseRubric).toHaveBeenCalled();
    });
  });

  it('displays saved rubrics', () => {
    vi.mocked(useRubrics).mockReturnValue({
      rubrics: [
        { id: '1', name: 'Test Rubric', totalPoints: 20, criteria: [] },
      ],
      isLoading: false,
      fetchRubrics: mockFetchRubrics,
      saveRubric: mockSaveRubric,
      deleteRubric: mockDeleteRubric,
    });

    renderWithProviders(<RubricPage />, { withRouter: true });
    expect(screen.getByText('Test Rubric')).toBeInTheDocument();
  });

  it('calls deleteRubric when delete button clicked', async () => {
    vi.mocked(useRubrics).mockReturnValue({
      rubrics: [
        { id: '1', name: 'Test Rubric', totalPoints: 20, criteria: [] },
      ],
      isLoading: false,
      fetchRubrics: mockFetchRubrics,
      saveRubric: mockSaveRubric,
      deleteRubric: mockDeleteRubric.mockResolvedValue(true),
    });

    renderWithProviders(<RubricPage />, { withRouter: true });
    
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    
    // Mock confirm
    vi.stubGlobal('confirm', () => true);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteRubric).toHaveBeenCalledWith('1');
    });
  });

  it('shows parsed criteria after parsing', () => {
    vi.mocked(useRubricParser).mockReturnValue({
      criteria: [
        { id: '1', name: 'Code Quality', description: 'Clean code', maxPoints: 10 },
      ],
      totalPoints: 10,
      isLoading: false,
      error: null,
      parseRubric: mockParseRubric,
      clear: mockClear,
    });

    renderWithProviders(<RubricPage />, { withRouter: true });
    expect(screen.getByText('Code Quality')).toBeInTheDocument();
  });

  it('calls clear when clear button clicked', () => {
    vi.mocked(useRubricParser).mockReturnValue({
      criteria: [
        { id: '1', name: 'Code Quality', description: 'Clean code', maxPoints: 10 },
      ],
      totalPoints: 10,
      isLoading: false,
      error: null,
      parseRubric: mockParseRubric,
      clear: mockClear,
    });

    renderWithProviders(<RubricPage />, { withRouter: true });
    
    const clearButton = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearButton);

    expect(mockClear).toHaveBeenCalled();
  });

  it('shows save dialog when save button clicked', () => {
    vi.mocked(useRubricParser).mockReturnValue({
      criteria: [
        { id: '1', name: 'Code Quality', description: 'Clean code', maxPoints: 10 },
      ],
      totalPoints: 10,
      isLoading: false,
      error: null,
      parseRubric: mockParseRubric,
      clear: mockClear,
    });

    renderWithProviders(<RubricPage />, { withRouter: true });
    
    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    expect(document.body.textContent).toContain('Rubric Name');
  });

  it('loads example rubric when clicked', () => {
    renderWithProviders(<RubricPage />, { withRouter: true });
    
    const loadExampleButton = screen.getByText(/Load Example/i);
    fireEvent.click(loadExampleButton);

    const textarea = screen.getByPlaceholderText(/Paste your rubric here/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Presentation');
  });
});