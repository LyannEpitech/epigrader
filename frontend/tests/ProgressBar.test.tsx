import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../src/components/ProgressBar';

describe('ProgressBar', () => {
  it('renders with pending status', () => {
    render(<ProgressBar progress={0} status="pending" />);
    expect(screen.getByText('Waiting to start...')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders with processing status', () => {
    render(<ProgressBar progress={50} status="processing" />);
    expect(screen.getByText('Analyzing... 50%')).toBeInTheDocument();
  });

  it('renders with completed status', () => {
    render(<ProgressBar progress={100} status="completed" />);
    expect(screen.getByText('Analysis complete!')).toBeInTheDocument();
  });

  it('renders with error status', () => {
    render(<ProgressBar progress={0} status="error" />);
    expect(screen.getByText('Analysis failed')).toBeInTheDocument();
  });

  it('displays correct progress percentage', () => {
    render(<ProgressBar progress={75} status="processing" />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});