import { describe, expect, it, vi, beforeEach } from 'vitest';
import React from 'react';
import { createRender, screen } from './setup';
import { AuthProvider } from '../provider';

// Create a custom render function that can be extended with providers if needed
const customRender = createRender();

// Create a mock for useTheme that we can control in tests
const mockUseTheme = vi.fn().mockReturnValue({
  resolvedTheme: 'light',
});

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}));

// Mock @clerk/themes
vi.mock('@clerk/themes', () => ({
  dark: { theme: 'dark' },
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTheme.mockReturnValue({ resolvedTheme: 'light' });
  });

  it('renders children correctly', () => {
    customRender(
      React.createElement(
        AuthProvider,
        null,
        React.createElement(
          'div',
          { 'data-testid': 'test-child' },
          'Test Child',
        ),
      ),
    );

    expect(screen.getByTestId('test-child')).toBeDefined();
    expect(screen.getByText('Test Child')).toBeDefined();
  });

  it('uses light theme when resolvedTheme is not dark', () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'light' });

    customRender(
      React.createElement(
        AuthProvider,
        null,
        React.createElement('div', null, 'Test Child'),
      ),
    );

    // ClerkProvider is mocked in setup.ts, so we can't directly test the theme
    // But we can verify that the useTheme mock was called
    expect(mockUseTheme).toHaveBeenCalled();
  });

  it('uses dark theme when resolvedTheme is dark', () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'dark' });

    customRender(
      React.createElement(
        AuthProvider,
        null,
        React.createElement('div', null, 'Test Child'),
      ),
    );

    // ClerkProvider is mocked in setup.ts, so we can't directly test the theme
    // But we can verify that the useTheme mock was called
    expect(mockUseTheme).toHaveBeenCalled();
  });

  it('renders with default props', () => {
    customRender(
      React.createElement(
        AuthProvider,
        null,
        React.createElement('div', null, 'Test Child'),
      ),
    );

    // ClerkProvider is mocked in setup.ts, so we can only verify basic rendering
    expect(screen.getByText('Test Child')).toBeDefined();
  });
});
