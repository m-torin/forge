'use client';

import { Button, Card, Code, Container, Stack, Title } from '@mantine/core';
import { useState } from 'react';

export default function DebugOrgsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testListOrgs = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Mock response since auth is removed
      const mockResponse = {
        data: [
          { id: '1', name: 'Demo Organization', slug: 'demo-org' },
          { id: '2', name: 'Test Company', slug: 'test-company' },
        ],
        success: true,
      };
      setResult(mockResponse);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseDirect = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/debug-orgs');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container py="xl" size="lg">
      <Stack gap="lg">
        <Title order={1}>Debug Organizations API</Title>

        <Stack gap="md">
          <Button loading={loading} onClick={testListOrgs}>
            Test listOrganizations (Better Auth API)
          </Button>

          <Button loading={loading} onClick={testDatabaseDirect} variant="outline">
            Test Direct Database Query
          </Button>
        </Stack>

        {error && (
          <Card withBorder>
            <Title order={4} c="red">
              Error
            </Title>
            <pre>{error}</pre>
          </Card>
        )}

        {result && (
          <Card withBorder>
            <Title order={4}>Result</Title>
            <Code block>{JSON.stringify(result, null, 2)}</Code>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
