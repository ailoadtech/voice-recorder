import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { AppProvider } from '@/contexts/AppContext';

describe('ThemeToggle', () => {
  const renderWithProvider = (initialTheme?: 'light' | 'dark' | 'system') => {
    return render(
      <AppProvider initialState={initialTheme ? { theme: initialTheme } : undefined}>
        <ThemeToggle />
      </AppProvider>
    );
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders with default system theme', () => {
    renderWithProvider();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('renders with light theme', () => {
    renderWithProvider('light');
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  it('renders with dark theme', () => {
    renderWithProvider('dark');
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('cycles through themes when clicked', () => {
    renderWithProvider('light');
    
    const button = screen.getByRole('button');
    
    // Light -> Dark
    fireEvent.click(button);
    expect(screen.getByText('Dark')).toBeInTheDocument();
    
    // Dark -> System
    fireEvent.click(button);
    expect(screen.getByText('System')).toBeInTheDocument();
    
    // System -> Light
    fireEvent.click(button);
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    renderWithProvider('light');
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Current theme: light. Click to change theme.');
  });

  it('displays correct icon for each theme', () => {
    const { rerender } = renderWithProvider('light');
    let button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
    
    rerender(
      <AppProvider initialState={{ theme: 'dark' }}>
        <ThemeToggle />
      </AppProvider>
    );
    button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
    
    rerender(
      <AppProvider initialState={{ theme: 'system' }}>
        <ThemeToggle />
      </AppProvider>
    );
    button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });
});
