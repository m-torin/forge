'use client';

import { Button, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface EmptyStateProps {
  actionLabel?: string;
  description: string;
  icon: React.FC<{ size?: string | number; stroke?: string | number }>;
  onAction?: () => void;
  title: string;
}

export function EmptyState({
  actionLabel,
  description,
  icon: Icon,
  onAction,
  title,
}: EmptyStateProps) {
  return (
    <Stack align="center" gap="lg" py="xl">
      <ThemeIcon color="gray" radius="xl" size={80} variant="light">
        <Icon stroke={1.5} size={40} />
      </ThemeIcon>

      <Stack align="center" gap="xs">
        <Title order={3}>{title}</Title>
        <Text c="dimmed" maw={400} size="sm" ta="center">
          {description}
        </Text>
      </Stack>

      {actionLabel && onAction && (
        <Button leftSection={<IconPlus size={16} />} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}
