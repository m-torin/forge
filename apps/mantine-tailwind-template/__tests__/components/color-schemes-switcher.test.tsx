import { ColorSchemesSwitcher } from '#/components/color-schemes-switcher';
import { MantineProvider, createTheme } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

const theme = createTheme({});

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider theme={theme}>{ui}</MantineProvider>);
}

describe('colorSchemesSwitcher', () => {
  test('renders theme switcher buttons', () => {
    renderWithMantine(<ColorSchemesSwitcher />);

    expect(screen.getByLabelText('Switch to light theme')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch to dark theme')).toBeInTheDocument();
    expect(screen.getByLabelText('Use system theme')).toBeInTheDocument();
  });

  test('shows all three theme options', () => {
    renderWithMantine(<ColorSchemesSwitcher />);

    const lightButton = screen.getByLabelText('Switch to light theme');
    const darkButton = screen.getByLabelText('Switch to dark theme');
    const systemButton = screen.getByLabelText('Use system theme');

    expect(lightButton).toBeInTheDocument();
    expect(darkButton).toBeInTheDocument();
    expect(systemButton).toBeInTheDocument();
  });

  test('has accessible labels', () => {
    renderWithMantine(<ColorSchemesSwitcher />);

    expect(screen.getByLabelText('Switch to light theme')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch to dark theme')).toBeInTheDocument();
    expect(screen.getByLabelText('Use system theme')).toBeInTheDocument();
  });
});
