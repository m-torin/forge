import { Card, Text, Group, RingProgress, Center, ThemeIcon } from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';
import type { Icon as TablerIcon } from '@tabler/icons-react';

interface StatsCardProps {
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
}

export function StatsCard({
  title,
  value,
  color,
  icon: Icon,
  change,
  progress,
  loading = false,
}: StatsCardProps) {
  return (
    <Card withBorder radius="md" padding="xl">
      <Group justify="space-between">
        <div>
          <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text fw={700} size="xl">
            {loading ? '...' : value}
          </Text>
          {change && (
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

        {progress ? (
          <RingProgress
            size={80}
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
          <ThemeIcon color={color} variant="light" size={38} radius="md">
            <Icon size={22} stroke={1.5} />
          </ThemeIcon>
        )}
      </Group>
    </Card>
  );
}
