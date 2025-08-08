import Home from '#/app/[locale]/page';
import { SidebarProvider } from '#/components/SidebarProvider';
import { MantineProvider, createTheme } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

const theme = createTheme({});

function renderWithMantine(ui: React.ReactElement) {
  return render(
    <MantineProvider theme={theme}>
      <SidebarProvider>{ui}</SidebarProvider>
    </MantineProvider>,
  );
}

// Mock the getDictionary function and translations
vi.mock('#/lib/i18n', () => ({
  getDictionary: vi.fn(() =>
    Promise.resolve({
      header: { title: 'Mantine + Tailwind' },
      home: {
        welcome: 'Welcome to',
        description:
          'A modern Next.js template combining the power of Mantine UI components with Tailwind CSS utilities. Get started by editing this page.',
        features: {
          nextjs: { title: 'Next.js 15', description: 'React framework' },
          mantine: { title: 'Mantine v8', description: 'React components' },
          tailwind: { title: 'Tailwind CSS', description: 'Utility classes' },
        },
      },
    }),
  ),
}));

// Mock Next.js router hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/en',
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

// Mock internationalization package hooks
vi.mock('@repo/internationalization/client/next', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/en',
  useLocale: () => 'en',
}));

// Mock Next.js components that might cause issues
vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

// Mock Next.js cookies and headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve(
      new Map([
        ['visitor-id', { value: 'test-visitor' }],
        ['user-id', { value: 'test-user' }],
      ]),
    ),
  ),
  headers: vi.fn(() =>
    Promise.resolve(
      new Map([
        ['x-country', 'US'],
        ['user-agent', 'test-agent'],
      ]),
    ),
  ),
}));

// Mock auth configuration to prevent server-side env access
vi.mock('#/lib/auth-config', () => ({
  auth: {
    api: {
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
  authConfig: {},
}));

// Mock auth context
vi.mock('#/lib/auth-context', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: null,
    isLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
  getAuthContext: vi.fn(() =>
    Promise.resolve({
      user: null,
      session: null,
      isAuthenticated: false,
    }),
  ),
}));

// Mock @repo/auth package
vi.mock('@repo/auth/client/next', () => ({
  useAuthContext: () => ({
    user: null,
    session: null,
    isLoading: false,
  }),
  useAuth: () => ({
    user: null,
    session: null,
    isLoading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock feature flags
vi.mock('#/lib/flags', () => {
  const mockShowLanguageSwitcher = vi.fn(() => Promise.resolve(true));
  const mockWelcomeMessageVariant = vi.fn(() => Promise.resolve('default'));
  const mockEnhancedFeatureCards = vi.fn(() => Promise.resolve(false));
  const mockShowBetaBanner = vi.fn(() => Promise.resolve(false));

  return {
    showLanguageSwitcher: mockShowLanguageSwitcher,
    welcomeMessageVariant: mockWelcomeMessageVariant,
    enhancedFeatureCards: mockEnhancedFeatureCards,
    showBetaBanner: mockShowBetaBanner,
  };
});

// Mock Mantine hooks
vi.mock('@mantine/hooks', () => ({
  useLocalStorage: () => [false, vi.fn()],
  useMediaQuery: () => false,
}));

// Mock the useSidebar hook directly
vi.mock('#/components/SidebarProvider', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => children,
  useSidebar: () => ({
    isOpen: false,
    toggle: vi.fn(),
    close: vi.fn(),
    open: vi.fn(),
    isLoading: false,
  }),
}));

// Mock the custom hooks
vi.mock('#/hooks/useViewTransition', () => ({
  useViewTransition: () => ({
    startTransition: (callback: () => void) => callback(),
  }),
}));

vi.mock('#/hooks/useProgressiveEnhancement', () => ({
  useProgressiveEnhancement: () => ({
    hasViewTransitions: false,
    hasContainerQueries: false,
    hasBackdropFilter: false,
    hasSubgrid: false,
    hasColorMix: false,
    hasIntersectionObserver: false,
    hasResizeObserver: false,
    hasWebShare: false,
    hasFileSystemAccess: false,
    hasPaintWorklet: false,
    prefersDarkMode: false,
    prefersReducedMotion: false,
    connectionType: 'unknown',
    isHighBandwidth: true,
  }),
}));

vi.mock('#/hooks/useWebVitals', () => ({
  useWebVitals: () => {},
}));

vi.mock('#/hooks/useBodyScrollLock', () => ({
  useBodyScrollLock: () => {},
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
