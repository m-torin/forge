/**
 * Test setup file for auth package
 * Using centralized mocks from @repo/qa where possible
 */

import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Use centralized QA setup instead of manual imports
import '@repo/qa/vitest/setup/next-app';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.CI = 'true';
process.env.SKIP_ENV_VALIDATION = 'true';

// Auth package environment
process.env.BETTER_AUTH_SECRET = 'test_auth_secret_key_1234567890';
process.env.BETTER_AUTH_URL = 'http://localhost:3000';
process.env.SESSION_MAX_AGE = '2592000';
process.env.ORGANIZATION_INVITE_TTL = '86400';

// Database environment
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/auth_test';

// Email environment
process.env.RESEND_API_KEY = 're_test_1234567890';
process.env.EMAIL_FROM = 'noreply@test.example.com';
process.env.EMAIL_REPLY_TO = 'support@test.example.com';

// Auth-specific environment variables
process.env.PACKAGE_NAME = 'auth';
process.env.AUTH_TEST_MODE = 'true';
process.env.ORGANIZATION_FEATURES_ENABLED = 'true';
process.env.API_KEY_FEATURES_ENABLED = 'true';
process.env.NEXT_PUBLIC_APP_NAME = 'Auth Package Tests';

// Mock the env module to prevent client/server validation errors
vi.mock('../env', () => {
  // Use dynamically set environment values from setupDynamicEnvironment above
  let mockEnv = {
    // Server variables (using dynamic values)
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    AUTH_FEATURES_ADMIN: process.env.AUTH_FEATURES_ADMIN,
    AUTH_FEATURES_API_KEYS: process.env.AUTH_FEATURES_API_KEYS,
    AUTH_FEATURES_ORGANIZATIONS: process.env.AUTH_FEATURES_ORGANIZATIONS,
    AUTH_FEATURES_MAGIC_LINKS: process.env.AUTH_FEATURES_MAGIC_LINKS,
    AUTH_FEATURES_TWO_FACTOR: process.env.AUTH_FEATURES_TWO_FACTOR,
    // Client variables (using dynamic values)
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  };

  return {
    env: mockEnv,
    envError: null,
    safeEnv: () => mockEnv,
    safeServerEnv: () => ({
      BETTER_AUTH_SECRET: mockEnv.BETTER_AUTH_SECRET,
      AUTH_SECRET: mockEnv.AUTH_SECRET,
      DATABASE_URL: mockEnv.DATABASE_URL,
      BETTER_AUTH_URL: mockEnv.BETTER_AUTH_URL,
      NEXT_PUBLIC_APP_NAME: mockEnv.NEXT_PUBLIC_APP_NAME,
      TRUSTED_ORIGINS: mockEnv.TRUSTED_ORIGINS,
      GITHUB_CLIENT_ID: mockEnv.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: mockEnv.GITHUB_CLIENT_SECRET,
      GOOGLE_CLIENT_ID: mockEnv.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: mockEnv.GOOGLE_CLIENT_SECRET,
      AUTH_FEATURES_ADMIN: mockEnv.AUTH_FEATURES_ADMIN,
      AUTH_FEATURES_API_KEYS: mockEnv.AUTH_FEATURES_API_KEYS,
      AUTH_FEATURES_ORGANIZATIONS: mockEnv.AUTH_FEATURES_ORGANIZATIONS,
      AUTH_FEATURES_MAGIC_LINKS: mockEnv.AUTH_FEATURES_MAGIC_LINKS,
      AUTH_FEATURES_TWO_FACTOR: mockEnv.AUTH_FEATURES_TWO_FACTOR,
    }),
    safeClientEnv: () => ({
      NEXT_PUBLIC_APP_URL: mockEnv.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_APP_NAME: mockEnv.NEXT_PUBLIC_APP_NAME,
      AUTH_FEATURES_ADMIN: mockEnv.AUTH_FEATURES_ADMIN,
      AUTH_FEATURES_API_KEYS: mockEnv.AUTH_FEATURES_API_KEYS,
      AUTH_FEATURES_ORGANIZATIONS: mockEnv.AUTH_FEATURES_ORGANIZATIONS,
      AUTH_FEATURES_MAGIC_LINKS: mockEnv.AUTH_FEATURES_MAGIC_LINKS,
      AUTH_FEATURES_TWO_FACTOR: mockEnv.AUTH_FEATURES_TWO_FACTOR,
    }),
    setMockEnv: (newEnv: any) => {
      mockEnv = { ...mockEnv, ...newEnv };
    },
  };
});

// server-only mock is included in the centralized QA setup

// Mock the database prisma import specifically for auth package
// This must be hoisted before any imports that use it
vi.mock('@repo/database/prisma/server/next', async () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      session: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
      account: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      verification: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      apiKey: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      organization: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      organizationMember: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn(),
      $connect: vi.fn(),
      $disconnect: vi.fn(),
    },
  };
});

// Ensure React is available globally for JSX
global.React = React;

// Mock better-auth-harmony
vi.mock('better-auth-harmony', () => ({
  emailHarmony: vi.fn(() => ({})),
  phoneHarmony: vi.fn(() => ({})),
}));

// Centralized mocks already include:
// - server-only
// - @t3-oss/env-nextjs
// - Next.js modules (headers, navigation)
// - Database (@repo/database/prisma)
// - Analytics (@repo/analytics)
// - Email (@repo/email/server)
// - And many more...

// Next.js mocks now handled by centralized QA setup

// Import centralized Better-Auth mock from @repo/qa

// Additional app-specific mocks for analytics (extend centralized mock)
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

// Additional app-specific email mocks (extend centralized mock)
vi.mock('@repo/email/server', () => ({
  sendEmail: vi.fn(),
  sendTemplatedEmail: vi.fn(),
  createEmailTemplate: vi.fn(),
  // Auth-specific email functions
  sendApiKeyCreatedEmail: vi.fn(),
  sendMagicLinkEmail: vi.fn(),
  sendOrganizationInvitationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendTeamInvitationEmail: vi.fn().mockResolvedValue(true),
  sendVerificationEmail: vi.fn(),
  sendWelcomeEmail: vi.fn(),
}));

// Base test setup is handled by vitest config

// Feature flags are now set dynamically above based on conditional environments
// Additional auth-specific test configuration
process.env.AUTH_TEST_ISOLATION = 'true';
process.env.MOCK_EXTERNAL_AUTH_PROVIDERS = 'true';
