import Home from '#/app/page';
import { MantineProvider, createTheme } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

const theme = createTheme({});

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider theme={theme}>{ui}</MantineProvider>);
}

describe('home Page', () => {
  test('renders welcome message', () => {
    renderWithMantine(<Home />);

    expect(
      screen.getByText((content, element) => {
        return element?.textContent === 'Welcome to Mantine + Tailwind';
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Mantine + Tailwind')).toBeInTheDocument();
  });

  test('renders app title in header', () => {
    renderWithMantine(<Home />);

    expect(screen.getByText('Mantine + Tailwind')).toBeInTheDocument();
  });

  test('renders technology cards', () => {
    renderWithMantine(<Home />);

    expect(screen.getByText('Next.js 15')).toBeInTheDocument();
    expect(screen.getByText('Mantine v8')).toBeInTheDocument();
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
  });

  test('renders color scheme switcher', () => {
    renderWithMantine(<Home />);

    expect(screen.getByLabelText('Switch to light theme')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch to dark theme')).toBeInTheDocument();
    expect(screen.getByLabelText('Use system theme')).toBeInTheDocument();
  });
});
