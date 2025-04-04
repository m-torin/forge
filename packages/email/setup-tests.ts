import '@repo/testing/src/vitest/core/setup';
import { vi } from 'vitest';
import React from 'react';

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({
        id: 'mock-email-id',
        from: 'test@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        status: 'success',
      }),
    },
  })),
}));

// Mock environment variables
process.env.RESEND_FROM = 'test@example.com';
process.env.RESEND_TOKEN = 're_test_token';

// Mock @t3-oss/env-nextjs
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn().mockImplementation(({ server, runtimeEnv }: any) => {
    const env: Record<string, any> = {};
    Object.keys(server).forEach((key) => {
      env[key] = runtimeEnv[key];
    });
    return () => env;
  }),
}));

// Mock React Email components
vi.mock('@react-email/components', () => ({
  Body: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'email-body', ...props },
      children,
    ),
  Container: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'email-container', ...props },
      children,
    ),
  Head: () => React.createElement('div', { 'data-testid': 'email-head' }),
  Hr: (props: Record<string, any>) =>
    React.createElement('hr', { 'data-testid': 'email-hr', ...props }),
  Html: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'email-html', ...props },
      children,
    ),
  Preview: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'email-preview', ...props },
      children,
    ),
  Section: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'email-section', ...props },
      children,
    ),
  Tailwind: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'email-tailwind', ...props },
      children,
    ),
  Text: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'email-text', ...props },
      children,
    ),
}));
