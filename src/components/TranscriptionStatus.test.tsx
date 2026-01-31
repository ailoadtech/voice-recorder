import { render, screen, fireEvent } from '@testing-library/react';
import { TranscriptionStatus, TranscriptionStatusIndicator } from './TranscriptionStatus';

describe('TranscriptionStatus', () => {
  it('should not render when stage is idle', () => {
    const { container } = render(<TranscriptionStatus stage="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render loading model stage', () => {
    render(<TranscriptionStatus stage="loading_model" progress={0.2} />);
    
    expect(screen.getByText('Loading model')).toBeInTheDocument();
    expect(screen.getByText('Preparing Whisper model...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render processing audio stage', () => {
    render(<TranscriptionStatus stage="processing_audio" progress={0.5} />);
    
    expect(screen.getByText('Processing audio')).toBeInTheDocument();
    expect(screen.getByText('Transcribing your recording...')).toBeInTheDocument();
  });

  it('should render finalizing stage', () => {
    render(<TranscriptionStatus stage="finalizing" progress={0.8} />);
    
    expect(screen.getByText('Finalizing')).toBeInTheDocument();
    expect(screen.getByText('Almost done...')).toBeInTheDocument();
  });

  it('should render complete stage', () => {
    render(<TranscriptionStatus stage="complete" progress={1.0} />);
    
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('Transcription finished!')).toBeInTheDocument();
  });

  it('should display progress percentage', () => {
    render(<TranscriptionStatus stage="processing_audio" progress={0.65} />);
    
    // Progress should be displayed (approximately 65%)
    const progressText = screen.getByText(/\d+%/);
    expect(progressText).toBeInTheDocument();
  });

  it('should show cancel button when onCancel is provided and processing', () => {
    const handleCancel = jest.fn();
    render(
      <TranscriptionStatus
        stage="processing_audio"
        progress={0.5}
        onCancel={handleCancel}
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
    
    fireEvent.click(cancelButton);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('should not show cancel button when stage is complete', () => {
    const handleCancel = jest.fn();
    render(
      <TranscriptionStatus
        stage="complete"
        progress={1.0}
        onCancel={handleCancel}
      />
    );
    
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('should not show cancel button when onCancel is not provided', () => {
    render(<TranscriptionStatus stage="processing_audio" progress={0.5} />);
    
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    render(<TranscriptionStatus stage="processing_audio" progress={0.5} />);
    
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-label', 'Transcription status: Processing audio');
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });
});

describe('TranscriptionStatusIndicator', () => {
  it('should not render when stage is idle', () => {
    const { container } = render(<TranscriptionStatusIndicator stage="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render compact loading model indicator', () => {
    render(<TranscriptionStatusIndicator stage="loading_model" />);
    
    expect(screen.getByText('Loading model...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render compact processing indicator', () => {
    render(<TranscriptionStatusIndicator stage="processing_audio" />);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('should render compact finalizing indicator', () => {
    render(<TranscriptionStatusIndicator stage="finalizing" />);
    
    expect(screen.getByText('Finalizing...')).toBeInTheDocument();
  });

  it('should render compact complete indicator', () => {
    render(<TranscriptionStatusIndicator stage="complete" />);
    
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('should show spinner for processing stages', () => {
    const { container } = render(<TranscriptionStatusIndicator stage="processing_audio" />);
    
    // Check for spinner element (has animate-spin class)
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should show checkmark for complete stage', () => {
    render(<TranscriptionStatusIndicator stage="complete" />);
    
    expect(screen.getByText('✓')).toBeInTheDocument();
  });
});
