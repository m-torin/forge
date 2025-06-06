'use client';

import { Group, Title, Text, Button, ActionIcon, Badge, Stack } from '@mantine/core';
import { IconPlus, IconDownload, IconFilter, IconRefresh } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: {
    label: string;
    color?: string;
  };
  actions?: {
    primary?: {
      label: string;
      icon?: ReactNode;
      onClick: () => void;
    };
    secondary?: Array<{
      label: string;
      icon?: ReactNode;
      onClick: () => void;
    }>;
  };
  stats?: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
  onRefresh?: () => void;
}

export function PageHeader({ 
  title, 
  description, 
  badge,
  actions, 
  stats,
  onRefresh 
}: PageHeaderProps) {
  return (
    <Stack gap="md" mb="xl">
      <Group justify="space-between" align="flex-start">
        <div>
          <Group gap="sm" mb={description ? 'xs' : 0}>
            <Title order={1}>{title}</Title>
            {badge && (
              <Badge size="lg" variant="light" color={badge.color || 'blue'}>
                {badge.label}
              </Badge>
            )}
          </Group>
          {description && (
            <Text size="lg" c="dimmed">
              {description}
            </Text>
          )}
        </div>
        
        <Group gap="sm">
          {onRefresh && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              onClick={onRefresh}
            >
              <IconRefresh size={20} />
            </ActionIcon>
          )}
          
          {actions?.secondary?.map((action, index) => (
            <Button
              key={index}
              variant="subtle"
              leftSection={action.icon}
              onClick={action.onClick}
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
          {stats.map((stat, index) => (
            <div key={index}>
              <Text size="sm" c="dimmed" fw={500}>
                {stat.label}
              </Text>
              <Text size="xl" fw={700} c={stat.color}>
                {stat.value}
              </Text>
            </div>
          ))}
        </Group>
      )}
    </Stack>
  );
}