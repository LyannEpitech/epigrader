import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { AnalysisSteps } from '../src/components/AnalysisSteps';
import { AnalysisStep } from '../src/types/analysis';

describe('AnalysisSteps', () => {
  const mockSteps: AnalysisStep[] = [
    { name: 'Configuration', status: 'completed', message: 'Config loaded', timestamp: Date.now() },
    { name: 'GitHub Auth', status: 'completed', message: 'Authenticated', timestamp: Date.now() },
    { name: 'Repository Parsing', status: 'processing', message: 'Parsing...', timestamp: Date.now() },
    { name: 'Analysis', status: 'pending', message: 'Waiting', timestamp: Date.now() },
  ];

  it('renders all steps', () => {
    renderWithProviders(<AnalysisSteps steps={mockSteps} currentStatus="processing" />);
    
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('GitHub Auth')).toBeInTheDocument();
    expect(screen.getByText('Repository Parsing')).toBeInTheDocument();
    expect(screen.getByText('Analysis')).toBeInTheDocument();
  });

  it('shows processing status for current step', () => {
    renderWithProviders(<AnalysisSteps steps={mockSteps} currentStatus="processing" />);
    
    expect(screen.getByText('Parsing...')).toBeInTheDocument();
  });
});