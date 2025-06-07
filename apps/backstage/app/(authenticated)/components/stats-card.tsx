'use client';

import { Badge, Group, Paper, RingProgress, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

interface StatsCardProps {
  change?: {
    value: number;
    label?: string;
  };
  color?: string;
  icon: React.FC<{ size?: string | number; stroke?: string | number }>;
  loading?: boolean;
  onClick?: () => void;
  progress?: {
    value: number;
    label?: string;
  };
  title: string;
  value: string | number;
}

export function StatsCard({
  change,
  color = 'blue',
  icon: Icon,
  loading = false,
  onClick,
  progress,
  title,
  value,
}: StatsCardProps) {
  if (loading) {
    return (
      <Paper shadow="xs" withBorder style={{ height: '100%' }} p="md" radius="md">
        <Stack gap="xs">
          <Group justify="space-between">
            <Skeleton width={40} height={40} radius="md" />
            <Skeleton width={60} height={20} />
          </Group>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={24} />
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      onClick={onClick}
      shadow="xs"
      withBorder
      style={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        transition: 'all 0.2s ease',
      }}
      styles={{
        root: onClick
          ? {
              '&:hover': {
                boxShadow: 'var(--mantine-shadow-sm)',
                transform: 'translateY(-2px)',
              },
            }
          : undefined,
      }}
      p="md"
      radius="md"
    >
      <Stack style={{ height: '100%' }} gap="xs">
        <Group align="flex-start" justify="space-between">
          <ThemeIcon color={color} radius="md" size="lg" variant="light">
            <Icon size={24} />
          </ThemeIcon>

          {progress && (
            <RingProgress
              sections={[{ color, value: progress.value }]}
              label={
                <Text fw={700} size="xs" ta="center">
                  {progress.value}%
                </Text>
              }
              size={40}
              thickness={4}
            />
          )}

          {change && !progress && (
            <Badge
              color={change.value >= 0 ? 'green' : 'red'}
              leftSection={
                change.value >= 0 ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />
              }
              size="sm"
              variant="light"
            >
              {change.value >= 0 ? '+' : ''}
              {change.value}%{change.label && ` ${change.label}`}
            </Badge>
          )}
        </Group>

        <div style={{ flex: 1 }}>
          <Text c="dimmed" fw={500} size="sm">
            {title}
          </Text>
          <Text fw={700} mt={4} size="xl">
            {value}
          </Text>
        </div>

        {progress?.label && (
          <Text c="dimmed" size="xs">
            {progress.label}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
