// Import testing-library extensions and jest-dom
import '@testing-library/jest-dom/vitest';
import { afterAll, beforeAll, vi } from 'vitest';
import * as React from 'react';
// Import core testing functionality via the vitest export
import { vitest } from '@repo/testing';

// Add TextEncoder/TextDecoder polyfill for jsdom environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Add package-specific setup here

// Mock window.matchMedia (only in browser-like environments)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock the keys module to provide test environment variables
// Allow dynamic values based on process.env for tests that manipulate the environment
vi.mock('../keys', () => ({
  keys: vi.fn().mockImplementation(() => {
    // For tests that explicitly want to test the behavior when secret is missing
    if (process.env.__TEST_FORCE_MISSING_SECRET === 'true') {
      return { LIVEBLOCKS_SECRET: undefined };
    }

    // Special case for keys.test.ts, which expects undefined when there's no env var
    // We detect it's running from the test name in the filename path
    const testFile = new Error().stack?.toString() || '';
    if (testFile.includes('keys.test.ts') && !process.env.LIVEBLOCKS_SECRET) {
      return { LIVEBLOCKS_SECRET: undefined };
    }

    // Use the actual environment variable so tests can control it
    // This makes tests deterministic for each test file
    if (process.env.LIVEBLOCKS_SECRET) {
      // Throw an error in production mode for invalid keys
      if (
        process.env.NODE_ENV === 'production' &&
        !process.env.LIVEBLOCKS_SECRET.startsWith('sk_')
      ) {
        throw new Error('Invalid LIVEBLOCKS_SECRET');
      }
      return { LIVEBLOCKS_SECRET: process.env.LIVEBLOCKS_SECRET };
    }

    // Default behavior - return a valid test secret for deterministic tests
    // Only do this if not explicitly testing the missing secret case
    return { LIVEBLOCKS_SECRET: 'sk_test_mock_secret_for_tests' };
  }),
}));

// Mock Liveblocks Node.js SDK
vi.mock('@liveblocks/node', () => {
  const mockSession = {
    allow: vi.fn().mockReturnThis(),
    deny: vi.fn().mockReturnThis(),
    authorize: vi.fn().mockReturnValue({
      status: 200,
      body: JSON.stringify({
        success: true,
        userId: 'user-123',
      }),
    }),
    toResponse: vi.fn().mockReturnValue(
      new Response(
        JSON.stringify({
          status: 'success',
          userId: 'user-123',
        }),
        { status: 200 },
      ),
    ),
    FULL_ACCESS: 'full_access',
  };

  const mockPrepareSession = vi.fn().mockReturnValue(mockSession);

  return {
    Liveblocks: vi.fn().mockReturnValue({
      prepareSession: mockPrepareSession,
    }),
  };
});

// Mock Liveblocks React components
vi.mock('@liveblocks/react', () => {
  return {
    LiveblocksProvider: ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        'div',
        { 'data-testid': 'liveblocks-provider' },
        children,
      );
    },
    RoomProvider: ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        'div',
        { 'data-testid': 'room-provider' },
        children,
      );
    },
    ClientSideSuspense: ({
      fallback,
      children,
    }: {
      fallback: React.ReactNode;
      children: React.ReactNode;
    }) => {
      return React.createElement(
        'div',
        { 'data-testid': 'client-side-suspense' },
        children,
      );
    },
    createClient: vi.fn().mockReturnValue({
      enterRoom: vi.fn(),
      leaveRoom: vi.fn(),
    }),
  };
});
