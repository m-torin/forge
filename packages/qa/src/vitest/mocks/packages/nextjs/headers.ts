// Next.js Headers, Cookies, and Request Data mocks
import { vi } from 'vitest';
import { createMockCookies, createMockHeaders } from './shared';

// Next.js Headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(createMockHeaders())),
  cookies: vi.fn(() => Promise.resolve(createMockCookies())),
  draftMode: vi.fn(() => ({
    isEnabled: false,
    enable: vi.fn(),
    disable: vi.fn(),
  })),
}));
