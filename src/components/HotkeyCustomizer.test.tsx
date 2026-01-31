import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HotkeyCustomizer } from './HotkeyCustomizer';
import { hotkeyConfigService } from '@/services/hotkey/HotkeyConfigService';
import { hotkeyService } from '@/services/hotkey/HotkeyService';

// Mock the services
jest.mock('@/services/hotkey/HotkeyConfigService');
jest.mock('@/services/hotkey/HotkeyService');

describe('HotkeyCustomizer', () => {
  const mockHotkeys = {
    'toggle-recording': {
      id: 'toggle-recording',
      key: ' ',
      modifiers: ['ctrl', 'shift'] as const,
      description: 'Toggle recording on/off',
      enabled: true,
      global: true,
    },
    'stop-recording': {
      id: 'stop-recording',
      key: 'escape',
      modifiers: ['ctrl'] as const,
      description: 'Stop recording',
      enabled: true,
      global: false,
    },
  };

  const mockPresets = [
    {
      name: 'Default',
      description: 'Standard hotkey configuration',
      hotkeys: {},
    },
    {
      name: 'Minimal',
      description: 'Minimal hotkeys to avoid conflicts',
      hotkeys: {},
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    (hotkeyConfigService.initialize as jest.Mock).mockResolvedValue(undefined);
    (hotkeyConfigService.getAllHotkeys as jest.Mock).mockReturnValue(mockHotkeys);
    (hotkeyConfigService.getAvailablePresets as jest.Mock).mockReturnValue(mockPresets);
    (hotkeyConfigService.getActivePreset as jest.Mock).mockReturnValue(mockPresets[0]);
    (hotkeyConfigService.isCustomized as jest.Mock).mockReturnValue(false);
    (hotkeyService.validate as jest.Mock).mockReturnValue({ valid: true, errors: [], warnings: [], conflicts: [] });
    (hotkeyService.checkConflicts as jest.Mock).mockReturnValue([]);
  });

  it('renders hotkey customizer', async () => {
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      expect(screen.getByText('Hotkey Customization')).toBeInTheDocument();
    });
  });

  it('displays all hotkeys', async () => {
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      expect(screen.getByText('Toggle recording on/off')).toBeInTheDocument();
      expect(screen.getByText('Stop recording')).toBeInTheDocument();
    });
  });

  it('displays preset selector', async () => {
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  it('allows editing a hotkey', async () => {
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    expect(screen.getByText('Modifiers')).toBeInTheDocument();
    expect(screen.getByText('Key')).toBeInTheDocument();
  });

  it('toggles modifiers when editing', async () => {
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    const ctrlButton = screen.getByRole('button', { name: /Ctrl/i });
    expect(ctrlButton).toHaveClass('bg-blue-600');
    
    fireEvent.click(ctrlButton);
    expect(ctrlButton).not.toHaveClass('bg-blue-600');
  });

  it('saves hotkey changes', async () => {
    (hotkeyConfigService.setHotkey as jest.Mock).mockResolvedValue(undefined);
    
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(hotkeyConfigService.setHotkey).toHaveBeenCalled();
    });
  });

  it('cancels editing', async () => {
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Modifiers')).not.toBeInTheDocument();
  });

  it('toggles hotkey enabled state', async () => {
    (hotkeyConfigService.setHotkeyEnabled as jest.Mock).mockResolvedValue(undefined);
    
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
    });

    await waitFor(() => {
      expect(hotkeyConfigService.setHotkeyEnabled).toHaveBeenCalled();
    });
  });

  it('changes preset', async () => {
    (hotkeyConfigService.setActivePreset as jest.Mock).mockResolvedValue(undefined);
    
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'Minimal' } });
    });

    await waitFor(() => {
      expect(hotkeyConfigService.setActivePreset).toHaveBeenCalledWith('Minimal');
    });
  });

  it('resets to defaults', async () => {
    (hotkeyConfigService.resetToDefaults as jest.Mock).mockResolvedValue(undefined);
    
    // Mock window.confirm
    global.confirm = jest.fn(() => true);
    
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      const resetButton = screen.getByText('Reset to Defaults');
      fireEvent.click(resetButton);
    });

    await waitFor(() => {
      expect(hotkeyConfigService.resetToDefaults).toHaveBeenCalled();
    });
  });

  it('displays error messages', async () => {
    (hotkeyConfigService.initialize as jest.Mock).mockRejectedValue(new Error('Test error'));
    
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load hotkey configuration')).toBeInTheDocument();
    });
  });

  it('displays success messages', async () => {
    (hotkeyConfigService.setActivePreset as jest.Mock).mockResolvedValue(undefined);
    
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'Minimal' } });
    });

    await waitFor(() => {
      expect(screen.getByText(/Switched to Minimal preset/i)).toBeInTheDocument();
    });
  });

  it('shows customized badge for custom hotkeys', async () => {
    (hotkeyConfigService.isCustomized as jest.Mock).mockReturnValue(true);
    
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Custom')[0]).toBeInTheDocument();
    });
  });

  it('shows global badge for global hotkeys', async () => {
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      expect(screen.getByText('Global')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn();
    render(<HotkeyCustomizer onClose={onClose} />);
    
    await waitFor(() => {
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('validates hotkey before saving', async () => {
    (hotkeyService.validate as jest.Mock).mockReturnValue({
      valid: false,
      errors: ['Invalid key'],
      warnings: [],
      conflicts: [],
    });
    
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid key')).toBeInTheDocument();
    });
  });

  it('warns about conflicts', async () => {
    (hotkeyService.checkConflicts as jest.Mock).mockReturnValue([
      {
        hotkeyId: 'toggle-recording',
        conflictsWith: ['stop-recording'],
        reason: 'Same key combination',
      },
    ]);
    
    render(<HotkeyCustomizer />);
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Conflicts with/i)).toBeInTheDocument();
    });
  });
});
