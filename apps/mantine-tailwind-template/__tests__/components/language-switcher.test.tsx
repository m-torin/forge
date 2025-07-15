import { LanguageSwitcher } from '#/components/language-switcher';
import { MantineProvider, createTheme } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

const theme = createTheme({});

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider theme={theme}>{ui}</MantineProvider>);
}

// Mock Next.js router hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/en',
}));

describe('languageSwitcher', () => {
  test('renders language switcher menu', () => {
    renderWithMantine(<LanguageSwitcher currentLocale="en" />);

    expect(screen.getByTestId('mantine-menu')).toBeInTheDocument();
  });

  test('displays available languages', () => {
    renderWithMantine(<LanguageSwitcher currentLocale="en" />);

    expect(screen.getByText('🇺🇸 English')).toBeInTheDocument();
    expect(screen.getByText('🇪🇸 Español')).toBeInTheDocument();
    expect(screen.getByText('🇩🇪 Deutsch')).toBeInTheDocument();
    expect(screen.getByText('🇫🇷 Français')).toBeInTheDocument();
    expect(screen.getByText('🇵🇹 Português')).toBeInTheDocument();
  });

  test('has menu label', () => {
    renderWithMantine(<LanguageSwitcher currentLocale="en" />);

    expect(screen.getByText('Select Language')).toBeInTheDocument();
  });
});
