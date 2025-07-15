// Next.js Font mocks
import { vi } from 'vitest';

// Next.js Font
vi.mock('next/font/google', () => ({
  Inter: vi.fn(() => ({
    className: 'inter-font',
    style: {
      fontFamily: 'Inter, sans-serif',
    },
  })),
  Roboto: vi.fn(() => ({
    className: 'roboto-font',
    style: {
      fontFamily: 'Roboto, sans-serif',
    },
  })),
  // Add more Google fonts as needed
  Open_Sans: vi.fn(() => ({
    className: 'open-sans-font',
    style: {
      fontFamily: 'Open Sans, sans-serif',
    },
  })),
  Montserrat: vi.fn(() => ({
    className: 'montserrat-font',
    style: {
      fontFamily: 'Montserrat, sans-serif',
    },
  })),
}));

// Next.js Local Font
vi.mock('next/font/local', () => {
  const localFont = vi.fn((config: any) => ({
    className: config.variable || 'local-font',
    style: {
      fontFamily: config.src?.[0]?.path || 'Local Font, sans-serif',
    },
  }));

  return localFont;
});
