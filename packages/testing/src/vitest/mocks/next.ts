import { vi } from 'vitest';

// Define ReactNode type locally to avoid import errors
type ReactNode = any;

export function mockNextNavigation(): void {
  vi.mock('next/navigation', () => ({
    usePathname: () => '/',
    useRouter: () => ({
      pathname: '/',
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      push: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
  }));
}

export function mockNextThemes(): void {
  vi.mock('next-themes', () => ({
    ThemeProvider: ({ children }: { children: ReactNode }) => children,
    useTheme: () => ({
      setTheme: vi.fn(),
      systemTheme: 'light',
      theme: 'light',
      themes: ['light', 'dark', 'system'],
    }),
  }));
}

export function mockNextImage(): void {
  vi.mock('next/image', () => ({
    default: (props: any) => {
      const { alt, src, ...rest } = props;
      return {
        type: 'img',
        props: {
          alt,
          src,
          ...rest,
          'data-testid': 'next-image',
        },
      };
    },
  }));
}

export function setupNextMocks(): void {
  mockNextNavigation();
  mockNextThemes();
  mockNextImage();
}

export default setupNextMocks;
