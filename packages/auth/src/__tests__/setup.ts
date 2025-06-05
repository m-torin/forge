/**
 * Test setup file for auth package
 */

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock server-only module
vi.mock('server-only', () => ({}));

// Mock Next.js modules
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock Better Auth
vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  })),
}));

vi.mock('better-auth/client', () => ({
  createAuthClient: vi.fn(() => ({
    forgetPassword: vi.fn(),
    getSession: vi.fn(() => Promise.resolve(null)),
    resetPassword: vi.fn(),
    signIn: {
      email: vi.fn(),
      social: vi.fn(),
    },
    signOut: vi.fn(),
    signUp: {
      email: vi.fn(),
    },
    verifyEmail: vi.fn(),
  })),
}));

// Mock database
vi.mock('@repo/database/prisma', () => ({
  prisma: {
    member: {
      findFirst: vi.fn(),
    },
  },
}));

// Mock analytics
vi.mock('@repo/analytics/server', () => ({
  createServerAnalytics: vi.fn(() => ({
    emit: vi.fn(),
    identify: vi.fn(),
    track: vi.fn(),
  })),
  track: vi.fn(),
  identify: vi.fn(),
}));

// Mock email
vi.mock('@repo/email', () => ({
  sendApiKeyCreatedEmail: vi.fn(),
  sendMagicLinkEmail: vi.fn(),
  sendOrganizationInvitationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendVerificationEmail: vi.fn(),
  sendWelcomeEmail: vi.fn(),
}));

// Set up environment variables for tests
process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
