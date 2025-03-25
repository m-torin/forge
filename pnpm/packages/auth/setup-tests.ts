import { vi } from 'vitest';
import '@repo/testing/src/vitest/core/setup';
import React from 'react';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  auth: vi.fn().mockReturnValue({
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    getToken: vi.fn().mockResolvedValue('test-token'),
  }),
  currentUser: vi.fn().mockResolvedValue({
    id: 'test-user-id',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    imageUrl: 'https://example.com/avatar.png',
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignIn: () => React.createElement('div', { 'data-testid': 'clerk-sign-in' }),
  SignUp: () => React.createElement('div', { 'data-testid': 'clerk-sign-up' }),
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: ({ children }: { children: React.ReactNode }) => null,
  useAuth: vi.fn().mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
  }),
  useUser: vi.fn().mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      imageUrl: 'https://example.com/avatar.png',
    },
  }),
}));

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock environment variables
process.env.CLERK_SECRET_KEY = 'test-clerk-secret-key';
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-clerk-publishable-key';
