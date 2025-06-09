'use client';

import { Alert, Badge, Group, Loader, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';

import { getCascadeInfo } from '../lib/relationship-utils';

interface DeleteConfirmationProps {
  modelName: string;
  recordId: string;
  recordName?: string;
}

export function DeleteConfirmation({ modelName, recordId, recordName }: DeleteConfirmationProps) {
  const [cascadeInfo, setCascadeInfo] = useState<
    {
      model: string;
      count: number;
      action: 'delete' | 'nullify' | 'restrict';
    }[]
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
        <Text c="dimmed" size="sm">
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
                    <Badge color="red" size="sm" variant="light">
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
                    <Badge color="yellow" size="sm" variant="light">
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
        <Text c="dimmed" size="sm">
          No related records will be affected.
        </Text>
      )}
    </Stack>
  );
}
