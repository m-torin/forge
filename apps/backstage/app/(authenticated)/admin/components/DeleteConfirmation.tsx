'use client';

import { useState, useEffect } from 'react';
import { Text, Stack, Alert, Loader, Badge, Group } from '@mantine/core';
import { getCascadeInfo } from '../lib/relationship-utils';

interface DeleteConfirmationProps {
  modelName: string;
  recordId: string;
  recordName?: string;
}

export function DeleteConfirmation({ modelName, recordId, recordName }: DeleteConfirmationProps) {
  const [cascadeInfo, setCascadeInfo] = useState<
    Array<{
      model: string;
      count: number;
      action: 'delete' | 'nullify' | 'restrict';
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCascadeInfo(modelName, recordId)
      .then(setCascadeInfo)
      .finally(() => setLoading(false));
  }, [modelName, recordId]);

  if (loading) {
    return (
      <Stack align="center" py="md">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">
          Checking dependencies...
        </Text>
      </Stack>
    );
  }

  const hasDestructiveCascades = cascadeInfo.some(
    (info) => info.action === 'delete' && info.count > 0,
  );
  const hasNullifications = cascadeInfo.some((info) => info.action === 'nullify' && info.count > 0);

  return (
    <Stack gap="md">
      <Text size="sm">
        Are you sure you want to delete {recordName ? <strong>{recordName}</strong> : 'this record'}
        ? This action cannot be undone.
      </Text>

      {hasDestructiveCascades && (
        <Alert color="red" title="Warning: Related Records Will Be Deleted">
          <Stack gap="xs">
            <Text size="sm">The following related records will also be deleted:</Text>
            {cascadeInfo
              .filter((info) => info.action === 'delete' && info.count > 0)
              .map((info) => (
                <Group key={info.model} gap="xs">
                  <Text size="sm">•</Text>
                  <Text size="sm">
                    <Badge color="red" variant="light" size="sm">
                      {info.count}
                    </Badge>{' '}
                    {info.model} record{info.count !== 1 ? 's' : ''}
                  </Text>
                </Group>
              ))}
          </Stack>
        </Alert>
      )}

      {hasNullifications && (
        <Alert color="yellow" title="Note: Some References Will Be Cleared">
          <Stack gap="xs">
            <Text size="sm">The following references will be cleared:</Text>
            {cascadeInfo
              .filter((info) => info.action === 'nullify' && info.count > 0)
              .map((info) => (
                <Group key={info.model} gap="xs">
                  <Text size="sm">•</Text>
                  <Text size="sm">
                    <Badge color="yellow" variant="light" size="sm">
                      {info.count}
                    </Badge>{' '}
                    {info.model} record{info.count !== 1 ? 's' : ''}
                  </Text>
                </Group>
              ))}
          </Stack>
        </Alert>
      )}

      {!hasDestructiveCascades && !hasNullifications && cascadeInfo.length === 0 && (
        <Text size="sm" c="dimmed">
          No related records will be affected.
        </Text>
      )}
    </Stack>
  );
}
