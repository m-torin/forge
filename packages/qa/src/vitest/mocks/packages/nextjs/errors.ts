// Next.js Error Handling mocks
import { vi } from 'vitest';
import { React } from './shared';

// Next.js Error Boundary
vi.mock('next/error', () => ({
  default: ({ statusCode = 500, hasGetInitialProps = false, ...props }: any) => {
    return React.createElement(
      'div',
      {
        'data-testid': 'next-error',
        'data-status-code': statusCode,
        ...props,
      },
      `Error ${statusCode}`,
    );
  },
}));

// Error utilities are already mocked in navigation.ts (redirect, notFound)
// but we can add additional error handling utilities here if needed

// Custom error component for testing
export const mockErrorComponent = ({ error, reset }: { error: Error; reset: () => void }) => {
  return React.createElement(
    'div',
    {
      'data-testid': 'error-boundary',
      'data-error-message': error.message,
    },
    [
      React.createElement('h2', { key: 'title' }, 'Something went wrong!'),
      React.createElement(
        'button',
        {
          key: 'reset',
          onClick: reset,
          'data-testid': 'error-reset-button',
        },
        'Try again',
      ),
    ],
  );
};

// Global error boundary mock
export const mockGlobalError = ({ error, reset }: { error: Error; reset: () => void }) => {
  return React.createElement('html', {}, [
    React.createElement('body', { key: 'body' }, [
      React.createElement(
        'div',
        {
          key: 'error',
          'data-testid': 'global-error-boundary',
          'data-error-message': error.message,
        },
        [
          React.createElement('h2', { key: 'title' }, 'Application Error'),
          React.createElement(
            'button',
            {
              key: 'reset',
              onClick: reset,
              'data-testid': 'global-error-reset-button',
            },
            'Try again',
          ),
        ],
      ),
    ]),
  ]);
};
