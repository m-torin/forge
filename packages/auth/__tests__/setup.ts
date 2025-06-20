/**
 * Test setup file for auth package
 */

// Ensure React is available globally for JSX
import React from 'react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
global.React = React;

// Mock server-only module
vi.mock('server-only', () => ({}));

// Mock @t3-oss/env-nextjs to avoid server-side restrictions
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn(() => {
    // Return a mock environment object that doesn't enforce server-side restrictions
    // This will be accessed dynamically when the config is created
    return new Proxy(
      {},
      {
        get(target, prop) {
          // Return the actual process.env value or a default
          const envValue = process.env[prop as string];
          if (envValue !== undefined) {
            return envValue;
          }

          // Provide defaults for specific environment variables
          switch (prop) {
            case 'BETTER_AUTH_SECRET':
              return 'development-secret';
            case 'DATABASE_URL':
              return 'postgresql://localhost:5432/dev';
            case 'NEXT_PUBLIC_APP_URL':
              return 'http://localhost:3000';
            case 'GITHUB_CLIENT_ID':
            case 'GITHUB_CLIENT_SECRET':
            case 'GOOGLE_CLIENT_ID':
            case 'GOOGLE_CLIENT_SECRET':
              return '';
            default:
              return undefined;
          }
        },
      },
    );
  }),
}));

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
      banUser: vi.fn(() => Promise.resolve({ success: true })),
      createApiKey: vi.fn(() => Promise.resolve({ id: 'test-key', key: 'test-key-value' })),
      createOrganization: vi.fn(() =>
        Promise.resolve({
          id: 'org-123',
          name: 'Test Organization',
          createdAt: new Date(),
          slug: 'test-organization',
          updatedAt: new Date(),
        }),
      ),
      deleteApiKey: vi.fn(() => Promise.resolve({ success: true })),
      deleteOrganization: vi.fn(() => Promise.resolve({ success: true })),
      deleteSession: vi.fn(() => Promise.resolve({ success: true })),
      deleteUser: vi.fn(() => Promise.resolve({ success: true })),
      getSession: vi.fn(() => Promise.resolve(null)),
      impersonateUser: vi.fn(() => Promise.resolve({ success: true })),
      inviteUser: vi.fn(() => Promise.resolve({ success: true })),
      listApiKeys: vi.fn(() => Promise.resolve([])),
      listOrganizations: vi.fn(() => Promise.resolve([])),
      listSessions: vi.fn(() => Promise.resolve([])),
      listUsers: vi.fn(() => Promise.resolve([])),
      signIn: vi.fn(() => Promise.resolve({ success: true })),
      signOut: vi.fn(() => Promise.resolve({ success: true })),
      signUp: vi.fn(() => Promise.resolve({ success: true })),
      unbanUser: vi.fn(() => Promise.resolve({ success: true })),
      updateApiKey: vi.fn(() => Promise.resolve({ success: true })),
      updateOrganization: vi.fn(() => Promise.resolve({ success: true })),
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
  identify: vi.fn(),
  createServerAnalytics: vi.fn(() =>
    Promise.resolve({
      identify: vi.fn(),
      emit: vi.fn(),
      initialize: vi.fn().mockResolvedValue(undefined),
      track: vi.fn(),
    }),
  ),
  track: vi.fn(),
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

// Mock email functions
vi.mock('@repo/email', () => ({
  sendApiKeyCreatedEmail: vi.fn(),
  sendMagicLinkEmail: vi.fn(),
  sendOrganizationInvitationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendTeamInvitationEmail: vi.fn().mockResolvedValue(true),
  sendVerificationEmail: vi.fn(),
  sendWelcomeEmail: vi.fn(),
}));

// Set up environment variables for tests
(process.env as any).NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Additional env vars for auth config
process.env.GITHUB_CLIENT_ID = '';
process.env.GITHUB_CLIENT_SECRET = '';
process.env.GOOGLE_CLIENT_ID = '';
process.env.GOOGLE_CLIENT_SECRET = '';
