'use client';

import { Button, Center, Container, MantineProvider, Stack, Text, Title } from '@mantine/core';
import { useObservability } from '@repo/observability/client/next';
import React, { useEffect } from 'react';

import type NextError from 'next/error';

interface GlobalErrorProperties {
  readonly error: NextError & { digest?: string };
  readonly reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProperties): React.ReactElement {
  const observability = useObservability();

  useEffect(() => {
    // Capture the error in Sentry with full context
    if (observability) {
      // Create a proper Error object from the NextError
      const errorObj = error instanceof Error ? error : new Error(String(error));

      observability.captureException(errorObj, {
        level: 'error',
        tags: {
          errorBoundary: 'global',
          component: 'GlobalError',
          source: 'client',
          app: 'backstage',
        },
        extra: {
          digest: error.digest,
          errorMessage: String(error),
          errorStack: errorObj.stack,
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
        },
        fingerprint: ['backstage-global-error', errorObj.name, error.digest].filter(
          Boolean,
        ) as string[],
      });

      // Also log a debug message for context
      observability.debug('Backstage global error boundary triggered', {
        errorName: errorObj.name,
        errorMessage: String(error),
        digest: error.digest,
        app: 'backstage',
      });
    } else {
      // Fallback logging if observability is not available
      console.error('Backstage global error (observability not available):', error);
    }
  }, [error, observability]);

  const handleTryAgain = () => {
    // Log user action for debugging
    if (observability) {
      observability.debug('User clicked "Try again" button in global error', {
        action: 'retry',
        component: 'GlobalError',
        app: 'backstage',
      });
    }
    reset();
  };

  return (
    <html lang="en">
      <body>
        <MantineProvider>
          <Center style={{ minHeight: '100vh' }}>
            <Container size="sm">
              <Stack align="center" gap="lg">
                <div style={{ textAlign: 'center' }}>
                  <svg
                    style={{
                      width: '64px',
                      height: '64px',
                      margin: '0 auto 16px',
                      color: 'var(--mantine-color-red-6)',
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>

                <Title order={1} ta="center">
                  Oops, something went wrong
                </Title>

                <Text c="dimmed" ta="center" size="lg">
                  An unexpected error occurred in the backstage application. We apologize for the
                  inconvenience.
                </Text>

                <Stack gap="sm" align="center">
                  <Button onClick={handleTryAgain} size="lg" variant="filled">
                    Try again
                  </Button>

                  <Button
                    component="a"
                    href="/dashboard"
                    size="md"
                    variant="light"
                    onClick={() => {
                      if (observability) {
                        observability.debug('User navigated to dashboard from global error', {
                          action: 'navigate-dashboard',
                          component: 'GlobalError',
                          app: 'backstage',
                        });
                      }
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </Stack>

                {error.digest && (
                  <Text size="xs" c="dimmed" ta="center">
                    Error ID: {error.digest}
                  </Text>
                )}

                {process.env.NODE_ENV === 'development' && (
                  <details style={{ marginTop: '24px', width: '100%' }}>
                    <summary
                      style={{
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: 'var(--mantine-color-dimmed)',
                        marginBottom: '8px',
                      }}
                    >
                      Development Error Details
                    </summary>
                    <pre
                      style={{
                        overflow: 'auto',
                        padding: '16px',
                        backgroundColor: 'var(--mantine-color-gray-1)',
                        border: '1px solid var(--mantine-color-gray-3)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--mantine-color-gray-9)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {JSON.stringify(error, null, 2)}
                    </pre>
                  </details>
                )}
              </Stack>
            </Container>
          </Center>
        </MantineProvider>
      </body>
    </html>
  );
}
