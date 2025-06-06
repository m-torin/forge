'use client';

import { Paper, Stack, Group, Text, ThemeIcon, RingProgress, Badge, Skeleton } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import type { TablerIconsProps } from '@tabler/icons-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.FC<TablerIconsProps>;
  color?: string;
  change?: {
    value: number;
    label?: string;
  };
  progress?: {
    value: number;
    label?: string;
  };
  loading?: boolean;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  change,
  progress,
  loading = false,
  onClick,
}: StatsCardProps) {
  if (loading) {
    return (
      <Paper
        shadow="xs"
        p="md"
        radius="md"
        withBorder
        style={{ height: '100%' }}
      >
        <Stack gap="xs">
          <Group justify="space-between">
            <Skeleton height={40} width={40} radius="md" />
            <Skeleton height={20} width={60} />
          </Group>
          <Skeleton height={16} width="60%" />
          <Skeleton height={24} width="40%" />
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      shadow="xs"
      p="md"
      radius="md"
      withBorder
      style={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      styles={{
        root: onClick ? {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 'var(--mantine-shadow-sm)',
          },
        } : undefined,
      }}
      onClick={onClick}
    >
      <Stack gap="xs" style={{ height: '100%' }}>
        <Group justify="space-between" align="flex-start">
          <ThemeIcon size="lg" radius="md" variant="light" color={color}>
            <Icon size={24} />
          </ThemeIcon>
          
          {progress && (
            <RingProgress
              size={40}
              thickness={4}
              sections={[{ value: progress.value, color }]}
              label={
                <Text size="xs" ta="center" fw={700}>
                  {progress.value}%
                </Text>
              }
            />
          )}
          
          {change && !progress && (
            <Badge
              size="sm"
              variant="light"
              color={change.value >= 0 ? 'green' : 'red'}
              leftSection={
                change.value >= 0 ? (
                  <IconTrendingUp size={12} />
                ) : (
                  <IconTrendingDown size={12} />
                )
              }
            >
              {change.value >= 0 ? '+' : ''}{change.value}%
              {change.label && ` ${change.label}`}
            </Badge>
          )}
        </Group>
        
        <div style={{ flex: 1 }}>
          <Text size="sm" c="dimmed" fw={500}>
            {title}
          </Text>
          <Text size="xl" fw={700} mt={4}>
            {value}
          </Text>
        </div>
        
        {progress?.label && (
          <Text size="xs" c="dimmed">
            {progress.label}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}