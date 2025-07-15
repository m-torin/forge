// SecretRow.tsx
'use client';

import React, { memo, FC, ChangeEvent } from 'react';
import {
  Text,
  TextInput,
  PasswordInput,
  Badge,
  ActionIcon,
  Tooltip,
  Popover,
  Button,
  Group,
  Box,
  Kbd,
} from '@mantine/core';
import { IconCopy, IconEdit, IconTrash } from '@tabler/icons-react';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import { Secret, Prisma } from '@prisma/client';

interface SecretRowProps {
  secret: Secret;
  isLoading: boolean;
  handleEditSubmit: (
    secretId: number,
    newValues: Prisma.SecretUpdateInput,
  ) => Promise<void>;
  setEditSecretId: (value: number | null) => void;
  handleDelete: (secretId: number) => Promise<void>;
  editSecretId: number | null;
}

export const SecretRow: FC<SecretRowProps> = memo(
  ({
    secret,
    isLoading,
    handleEditSubmit,
    setEditSecretId,
    handleDelete,
    editSecretId,
  }) => {
    const [openedPopover, { open: openPopover, close: closePopover }] =
      useDisclosure(false);
    const isEditing = editSecretId === secret.id;
    const clipboard = useClipboard({ timeout: 500 });

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
      handleEditSubmit(secret.id, { name: e.currentTarget.value });
    };

    const handleSecretChange = (e: ChangeEvent<HTMLInputElement>) => {
      handleEditSubmit(secret.id, { secret: e.currentTarget.value });
    };

    const handleSave = () => {
      handleEditSubmit(secret.id, {
        name: secret.name,
        secret: secret.secret,
        shouldEncrypt: secret.shouldEncrypt,
        category: secret.category,
      });
    };

    return (
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: 'var(--mantine-spacing-sm)',
          borderBottom: '1px solid var(--mantine-color-gray-3)',
          '&:last-child': {
            borderBottom: 'none',
          },
        }}
      >
        {/* Name */}
        <Box style={{ flex: 1 }}>
          {isEditing ? (
            <TextInput
              value={secret.name ?? ''}
              onChange={handleNameChange}
              placeholder="Secret name"
              required
            />
          ) : (
            <Text fw={500}>{secret.name ?? 'Unnamed Secret'}</Text>
          )}
        </Box>

        {/* Secret Value */}
        <Box style={{ width: '150px' }}>
          {isEditing ? (
            <PasswordInput
              value={secret.secret}
              onChange={handleSecretChange}
              placeholder="Secret value"
              required
            />
          ) : secret.shouldEncrypt ? (
            <Badge color="blue" variant="light">
              Encrypted
            </Badge>
          ) : (
            <Kbd>{secret.secret}</Kbd>
          )}
        </Box>

        {/* Category */}
        <Box style={{ width: '100px' }}>
          <Text>{secret.category}</Text>
        </Box>

        {/* Actions */}
        <Box style={{ width: '120px' }}>
          <Group gap="xs" justify="flex-end">
            {isEditing ? (
              <>
                <Button
                  variant="light"
                  size="sm"
                  onClick={handleSave}
                  loading={isLoading}
                >
                  Save
                </Button>
                <Button
                  variant="subtle"
                  size="sm"
                  color="red"
                  onClick={() => setEditSecretId(null)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Tooltip label={clipboard.copied ? 'Copied!' : 'Copy'}>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="md"
                    onClick={() => clipboard.copy(secret.secret)}
                  >
                    <IconCopy
                      style={{ width: '70%', height: '70%' }}
                      stroke={1.5}
                    />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Edit">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="md"
                    onClick={() => setEditSecretId(secret.id)}
                  >
                    <IconEdit
                      style={{ width: '70%', height: '70%' }}
                      stroke={1.5}
                    />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Delete">
                  <Popover
                    opened={openedPopover}
                    onClose={closePopover}
                    position="bottom"
                    withinPortal
                  >
                    <Popover.Target>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="md"
                        onClick={openPopover}
                      >
                        <IconTrash
                          style={{ width: '70%', height: '70%' }}
                          stroke={1.5}
                        />
                      </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Text size="sm">
                        Are you sure you want to delete this secret?
                      </Text>
                      <Group justify="flex-end" mt="md">
                        <Button
                          variant="outline"
                          color="red"
                          size="sm"
                          onClick={() => {
                            handleDelete(secret.id);
                            closePopover();
                          }}
                          loading={isLoading}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={closePopover}
                        >
                          Cancel
                        </Button>
                      </Group>
                    </Popover.Dropdown>
                  </Popover>
                </Tooltip>
              </>
            )}
          </Group>
        </Box>
      </Box>
    );
  },
);
