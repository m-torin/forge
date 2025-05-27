'use client';

import { captureException } from '@sentry/nextjs';
import { useEffect } from 'react';

import { Button } from '@repo/design-system/components/ui/button';
import { fonts } from '@repo/design-system/lib/fonts';

import type NextError from 'next/error';

interface GlobalErrorProperties {
  readonly error: NextError & { digest?: string };
  readonly reset: () => void;
}

const GlobalError = ({ error, reset }: GlobalErrorProperties) => {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html className={fonts} lang="en">
      <body>
        <h1>Oops, something went wrong</h1>
        <Button onClick={() => reset()}>Try again</Button>
      </body>
    </html>
  );
};

export default GlobalError;
