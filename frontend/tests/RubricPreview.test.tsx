import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RubricPreview } from '../src/components/RubricPreview';

describe('RubricPreview', () => {
  it('renders empty state when no criteria', () => {
    render(<RubricPreview criteria={[]} totalPoints={0} />);
    
    expect(screen.getByText(/No criteria parsed yet/i)).toBeInTheDocument();
  });

  it('renders criteria list', () => {
    const criteria = [
      { id: '1', name: 'Presentation', description: 'README complete', maxPoints: 5 },
      { id: '2', name: 'Features', description: 'Error handling', maxPoints: 10 },
    ];

    render(<RubricPreview criteria={criteria} totalPoints={15} />);
    
    expect(screen.getByText('Presentation')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('README complete')).toBeInTheDocument();
    expect(screen.getByText('2 criteria • 15 points total')).toBeInTheDocument();
  });

  it('displays points for each criterion', () => {
    const criteria = [
      { id: '1', name: 'Test', description: '', maxPoints: 5 },
    ];

    render(<RubricPreview criteria={criteria} totalPoints={5} />);
    
    expect(screen.getByText('5 pts')).toBeInTheDocument();
  });

  it('displays criterion number', () => {
    const criteria = [
      { id: '1', name: 'First', description: '', maxPoints: 5 },
      { id: '2', name: 'Second', description: '', maxPoints: 10 },
    ];

    render(<RubricPreview criteria={criteria} totalPoints={15} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});