'use client';

import { Stack, Title, Text, Button, ThemeIcon } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { TablerIconsProps } from '@tabler/icons-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.FC<TablerIconsProps>;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <Stack align="center" py="xl" gap="lg">
      <ThemeIcon size={80} variant="light" color="gray" radius="xl">
        <Icon size={40} stroke={1.5} />
      </ThemeIcon>
      
      <Stack align="center" gap="xs">
        <Title order={3}>{title}</Title>
        <Text size="sm" c="dimmed" ta="center" maw={400}>
          {description}
        </Text>
      </Stack>
      
      {actionLabel && onAction && (
        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}