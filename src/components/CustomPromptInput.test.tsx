import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CustomPromptInput } from './CustomPromptInput';

describe('CustomPromptInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with empty value', () => {
    render(<CustomPromptInput value="" onChange={mockOnChange} />);

    const textarea = screen.getByRole('textbox', { name: /custom instructions/i });
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('');
  });

  it('renders with initial value', () => {
    render(
      <CustomPromptInput
        value="Make it funny"
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Make it funny');
  });

  it('calls onChange when text is entered', () => {
    render(<CustomPromptInput value="" onChange={mockOnChange} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New prompt' } });

    expect(mockOnChange).toHaveBeenCalledWith('New prompt');
  });

  it('displays placeholder text', () => {
    render(<CustomPromptInput value="" onChange={mockOnChange} />);

    const textarea = screen.getByPlaceholderText(/enter your custom instructions/i);
    expect(textarea).toBeInTheDocument();
  });

  it('can use custom placeholder', () => {
    render(
      <CustomPromptInput
        value=""
        onChange={mockOnChange}
        placeholder="Custom placeholder"
      />
    );

    const textarea = screen.getByPlaceholderText('Custom placeholder');
    expect(textarea).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(
      <CustomPromptInput
        value=""
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CustomPromptInput
        value=""
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });
});
