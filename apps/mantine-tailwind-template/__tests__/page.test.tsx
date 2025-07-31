import Home from '#/app/[locale]/page';
import { MantineProvider, createTheme } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

const theme = createTheme({});

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider theme={theme}>{ui}</MantineProvider>);
}

// Mock the getDictionary function and translations
vi.mock('#/lib/i18n', () => ({
  getDictionary: vi.fn(() => Promise.resolve({
    header: { title: 'Mantine + Tailwind' },
    home: {
      welcome: 'Welcome to',
      description: 'A modern Next.js template combining the power of Mantine UI components with Tailwind CSS utilities. Get started by editing this page.',
      features: {
        nextjs: { title: 'Next.js 15', description: 'React framework' },
        mantine: { title: 'Mantine v8', description: 'React components' },
        tailwind: { title: 'Tailwind CSS', description: 'Utility classes' }
      }
    }
  }))
}));

// Mock Next.js router hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/en'
}));

describe('home Page', () => {
  test('renders welcome message', async () => {
    const HomeComponent = await Home({ params: Promise.resolve({ locale: 'en' }) });
    renderWithMantine(HomeComponent);

    expect(
      screen.getAllByText((content, element) => {
        return element?.textContent?.includes('Welcome to') || false;
      })[0],
    ).toBeInTheDocument();
  });

  test('renders app title in header', async () => {
    const HomeComponent = await Home({ params: Promise.resolve({ locale: 'en' }) });
    renderWithMantine(HomeComponent);

    expect(screen.getByText('Mantine + Tailwind')).toBeInTheDocument();
  });

  test('renders technology cards', async () => {
    const HomeComponent = await Home({ params: Promise.resolve({ locale: 'en' }) });
    renderWithMantine(HomeComponent);

    expect(screen.getByText('Next.js 15')).toBeInTheDocument();
    expect(screen.getByText('Mantine v8')).toBeInTheDocument();
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
  });

  test('renders color scheme switcher', async () => {
    const HomeComponent = await Home({ params: Promise.resolve({ locale: 'en' }) });
    renderWithMantine(HomeComponent);

    expect(screen.getByLabelText('Switch to light theme')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch to dark theme')).toBeInTheDocument();
    expect(screen.getByLabelText('Use system theme')).toBeInTheDocument();
  });
});
