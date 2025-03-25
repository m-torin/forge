import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '@/test-utils';
import { ColorSchemesSwitcher } from '@/components/color-schemes-switcher';

// Mock the useMantineColorScheme hook
const mockSetColorScheme = vi.fn();
const mockClearColorScheme = vi.fn();

vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...(actual as any),
    useMantineColorScheme: () => ({
      setColorScheme: mockSetColorScheme,
      clearColorScheme: mockClearColorScheme,
    }),
  };
});

describe.skip('ColorSchemesSwitcher', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSetColorScheme.mockReset();
    mockClearColorScheme.mockReset();
  });

  it('renders all color scheme buttons', () => {
    render(<ColorSchemesSwitcher />);

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('Auto')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('calls setColorScheme with "light" when Light button is clicked', () => {
    render(<ColorSchemesSwitcher />);

    fireEvent.click(screen.getByText('Light'));
    expect(mockSetColorScheme).toHaveBeenCalledWith('light');
  });

  it('calls setColorScheme with "dark" when Dark button is clicked', () => {
    render(<ColorSchemesSwitcher />);

    fireEvent.click(screen.getByText('Dark'));
    expect(mockSetColorScheme).toHaveBeenCalledWith('dark');
  });

  it('calls setColorScheme with "auto" when Auto button is clicked', () => {
    render(<ColorSchemesSwitcher />);

    fireEvent.click(screen.getByText('Auto'));
    expect(mockSetColorScheme).toHaveBeenCalledWith('auto');
  });

  it('calls clearColorScheme when Clear button is clicked', () => {
    render(<ColorSchemesSwitcher />);

    fireEvent.click(screen.getByText('Clear'));
    expect(mockClearColorScheme).toHaveBeenCalled();
  });

  it('renders buttons in a Group component', () => {
    const { container } = render(<ColorSchemesSwitcher />);

    // Check that the buttons are wrapped in a Group component
    const group = container.firstChild;
    expect(group).toBeInTheDocument();
    expect(group?.childNodes.length).toBe(4); // 4 buttons
  });
});
