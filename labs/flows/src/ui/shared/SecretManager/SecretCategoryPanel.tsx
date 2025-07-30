// SecretCategoryPanel.tsx
'use client';

import React, { memo, FC, useMemo } from 'react';
import { Box, Title, Stack } from '@mantine/core';
import { Secret, SecretCategory, Prisma } from '@prisma/client';
import { SecretRow } from './SecretRow';

interface SecretCategoryPanelProps {
  secrets: Secret[];
  category: SecretCategory;
  isLoading: boolean;
  handleEditSubmit: (
    secretId: number,
    newValues: Prisma.SecretUpdateInput,
  ) => Promise<void>;
  setEditSecretId: (value: number | null) => void;
  handleDelete: (secretId: number) => Promise<void>;
  editSecretId: number | null;
}

export const SecretCategoryPanel: FC<SecretCategoryPanelProps> = memo(
  ({
    secrets,
    category,
    isLoading,
    handleEditSubmit,
    setEditSecretId,
    handleDelete,
    editSecretId,
  }) => {
    const filteredSecrets = useMemo(
      () => secrets.filter((secret) => secret.category === category),
      [secrets, category],
    );

    if (filteredSecrets.length === 0) return null;

    const capitalizedCategory =
      category.charAt(0).toUpperCase() + category.slice(1);

    return (
      <Box mb="xl">
        <Title c="dark.6" order={3} mb="xs">
          {`${capitalizedCategory} Secrets`}
        </Title>

        <Box>
          <Stack gap={0}>
            {/* Header */}
            <Box
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--mantine-color-gray-3)',
                padding: 'var(--mantine-spacing-sm)',
              }}
            >
              <Box style={{ flex: 1 }}>Name</Box>
              <Box style={{ width: '150px' }}>Secret</Box>
              <Box style={{ width: '100px' }}>Category</Box>
              <Box style={{ width: '120px' }}>Actions</Box>
            </Box>

            {/* Rows */}
            {filteredSecrets.map((secret) => (
              <SecretRow
                key={secret.id}
                secret={secret}
                isLoading={isLoading}
                handleEditSubmit={handleEditSubmit}
                setEditSecretId={setEditSecretId}
                handleDelete={handleDelete}
                editSecretId={editSecretId}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    );
  },
);
