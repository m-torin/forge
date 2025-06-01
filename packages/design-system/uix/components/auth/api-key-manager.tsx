'use client';

import { Box, Card, Group, Text, Title } from '@mantine/core';
import React from 'react';

import { ApiKeyList } from './api-key-list';
import { CreateApiKeyDialog } from './create-api-key-dialog';

export function ApiKeyManager() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Card shadow="sm" withBorder p="lg" radius="md">
      <Group justify="space-between" mb="md">
        <Box>
          <Title order={3}>API Keys</Title>
          <Text c="dimmed" size="sm">
            Manage your API keys for programmatic access to your application.
          </Text>
        </Box>
        <CreateApiKeyDialog onSuccess={handleRefresh} />
      </Group>
      <ApiKeyList key={refreshKey} />
    </Card>
  );
}

export * from './api-key-list';
export * from './create-api-key-dialog';
export * from './update-api-key-dialog';
