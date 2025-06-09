'use client';

import { Button } from '@mantine/core';

export default function TestClientErrorPage() {
  const triggerError = () => {
    throw new Error('Test client-side error for Sentry debugging');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test Client Error</h1>
      <Button onClick={triggerError}>
        Trigger Client Error
      </Button>
      <p>This button will throw a client-side error to test Sentry integration.</p>
    </div>
  );
}