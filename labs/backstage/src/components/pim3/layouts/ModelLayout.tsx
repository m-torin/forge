'use client';

import {
  Alert,
  Box,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { type ReactNode } from 'react';

interface ModelLayoutProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ size?: number | string }>;
  actions?: ReactNode;
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  empty?: {
    icon?: React.ComponentType<{ size?: number | string }>;
    title: string;
    description: string;
    action?: ReactNode;
  };
  showEmptyState?: boolean;
}

export function ModelLayout({
  title,
  description,
  icon: Icon,
  actions,
  children,
  loading = false,
  error = null,
  empty,
  showEmptyState = false,
}: ModelLayoutProps) {
  return (
    <Stack gap="md">
      {/* Header */}
      <Group justify="space-between">
        <Group gap="sm">
          {Icon && (
            <ThemeIcon size="xl" variant="light">
              <Icon size={24} />
            </ThemeIcon>
          )}
          <div>
            <Title order={2}>{title}</Title>
            {description && (
              <Text c="dimmed" size="sm">
                {description}
              </Text>
            )}
          </div>
        </Group>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>

      {/* Content */}
      <Box pos="relative">
        <LoadingOverlay visible={loading} zIndex={100} />

        {error ? (
          <Alert color="red" icon={<IconAlertCircle size={16} />} title="Error">
            {error}
          </Alert>
        ) : showEmptyState && empty ? (
          <Card withBorder p="xl">
            <Stack align="center" gap="md" py="xl">
              {empty.icon && (
                <ThemeIcon color="gray" size="xl" variant="light">
                  <empty.icon size={30} />
                </ThemeIcon>
              )}
              <div>
                <Text fw={500} ta="center">
                  {empty.title}
                </Text>
                <Text c="dimmed" mt="xs" size="sm" ta="center">
                  {empty.description}
                </Text>
              </div>
              {empty.action}
            </Stack>
          </Card>
        ) : (
          children
        )}
      </Box>
    </Stack>
  );
}
