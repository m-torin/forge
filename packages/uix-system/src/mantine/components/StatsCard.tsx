'use client';

import { Card, Center, Group, RingProgress, Text, ThemeIcon } from '@mantine/core';
import type { Icon as TablerIcon } from '@tabler/icons-react';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';

export interface StatsCardProps {
  title: string;
  value: string;
  color: string;
  icon: TablerIcon;
  change?: {
    value: number;
  };
  progress?: {
    value: number;
    label: string;
  };
  loading?: boolean;

  // Customization options
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  showChange?: boolean;
  showProgress?: boolean;
}

export function StatsCard({
  title,
  value,
  color,
  icon: Icon,
  change,
  progress,
  loading = false,
  size = 'md',
  variant = 'default',
  radius = 'md',
  padding = 'xl',
  showIcon = true,
  showChange = true,
  showProgress = true,
}: StatsCardProps) {
  const sizeConfig = {
    sm: { titleSize: 'xs', valueSize: 'lg', iconSize: 32, ringSize: 60 },
    md: { titleSize: 'xs', valueSize: 'xl', iconSize: 38, ringSize: 80 },
    lg: { titleSize: 'sm', valueSize: '2xl', iconSize: 44, ringSize: 100 },
  };

  const config = sizeConfig[size];

  const cardProps = {
    withBorder: variant !== 'filled',
    radius,
    padding,
    ...(variant === 'filled' && { bg: `${color}.0` }),
    ...(variant === 'outlined' && { style: { borderColor: `var(--mantine-color-${color}-4)` } }),
  };

  return (
    <Card {...cardProps}>
      <Group justify="space-between">
        <div>
          <Text c="dimmed" size={config.titleSize} tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text fw={700} size={config.valueSize}>
            {loading ? '...' : value}
          </Text>
          {showChange && change && (
            <Group gap="xs" mt={3}>
              <ThemeIcon
                color={change.value > 0 ? 'teal' : 'red'}
                variant="light"
                size="sm"
                radius="sm"
              >
                {change.value > 0 ? (
                  <IconArrowUpRight size={14} stroke={2.5} />
                ) : (
                  <IconArrowDownRight size={14} stroke={2.5} />
                )}
              </ThemeIcon>
              <Text c={change.value > 0 ? 'teal' : 'red'} size="sm" fw={500}>
                {Math.abs(change.value)}%
              </Text>
            </Group>
          )}
        </div>

        {showIcon &&
          (showProgress && progress ? (
            <RingProgress
              size={config.ringSize}
              roundCaps
              thickness={8}
              sections={[{ value: progress.value, color }]}
              label={
                <Center>
                  <Text size="xs" c="dimmed">
                    {progress.value}%
                  </Text>
                </Center>
              }
            />
          ) : (
            <ThemeIcon color={color} variant="light" size={config.iconSize} radius="md">
              <Icon size={config.iconSize * 0.6} stroke={1.5} />
            </ThemeIcon>
          ))}
      </Group>
    </Card>
  );
}
