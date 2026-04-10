import { describe, it, expect } from 'vitest';
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
    
    expect(document.body.textContent).toContain('Configuration');
    expect(document.body.textContent).toContain('GitHub Auth');
    expect(document.body.textContent).toContain('Repository Parsing');
    expect(document.body.textContent).toContain('Analysis');
  });

  it('shows completed status for completed steps', () => {
    renderWithProviders(<AnalysisSteps steps={mockSteps} currentStatus="processing" />);
    
    expect(document.body.textContent).toContain('Config loaded');
    expect(document.body.textContent).toContain('Authenticated');
  });

  it('shows processing status for current step', () => {
    renderWithProviders(<AnalysisSteps steps={mockSteps} currentStatus="processing" />);
    
    expect(document.body.textContent).toContain('Parsing...');
  });
});