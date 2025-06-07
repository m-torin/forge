'use client';

import { ActionIcon, Badge, Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconPlus, IconRefresh } from '@tabler/icons-react';

import type { ReactNode } from 'react';

interface PageHeaderProps {
  actions?: {
    primary?: {
      label: string;
      icon?: ReactNode;
      onClick: () => void;
    };
    secondary?: {
      label: string;
      icon?: ReactNode;
      onClick: () => void;
    }[];
  };
  badge?: {
    label: string;
    color?: string;
  };
  description?: string;
  onRefresh?: () => void;
  stats?: {
    label: string;
    value: string | number;
    color?: string;
  }[];
  title: string;
}

export function PageHeader({
  actions,
  badge,
  description,
  onRefresh,
  stats,
  title,
}: PageHeaderProps) {
  return (
    <Stack gap="md" mb="xl">
      <Group align="flex-start" justify="space-between">
        <div>
          <Group gap="sm" mb={description ? 'xs' : 0}>
            <Title order={1}>{title}</Title>
            {badge && (
              <Badge color={badge.color || 'blue'} size="lg" variant="light">
                {badge.label}
              </Badge>
            )}
          </Group>
          {description && (
            <Text c="dimmed" size="lg">
              {description}
            </Text>
          )}
        </div>

        <Group gap="sm">
          {onRefresh && (
            <ActionIcon color="gray" onClick={onRefresh} size="lg" variant="subtle">
              <IconRefresh size={20} />
            </ActionIcon>
          )}

          {actions?.secondary?.map((action) => (
            <Button
              key={action.label}
              leftSection={action.icon}
              onClick={action.onClick}
              variant="subtle"
            >
              {action.label}
            </Button>
          ))}

          {actions?.primary && (
            <Button
              leftSection={actions.primary.icon || <IconPlus size={16} />}
              onClick={actions.primary.onClick}
            >
              {actions.primary.label}
            </Button>
          )}
        </Group>
      </Group>

      {stats && stats.length > 0 && (
        <Group gap="xl">
          {stats.map((stat) => (
            <div key={stat.label}>
              <Text c="dimmed" fw={500} size="sm">
                {stat.label}
              </Text>
              <Text c={stat.color} fw={700} size="xl">
                {stat.value}
              </Text>
            </div>
          ))}
        </Group>
      )}
    </Stack>
  );
}
