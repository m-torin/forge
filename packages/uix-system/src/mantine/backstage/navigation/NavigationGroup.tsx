'use client';

import { Divider, Stack, Text } from '@mantine/core';
import { NavigationItem } from './NavigationItem';
import { NavigationGroup as INavigationGroup } from './types';

interface NavigationGroupProps extends INavigationGroup {
  onItemClick?: (itemId: string) => void;
}

export function NavigationGroup({
  id,
  label,
  items,
  collapsed,
  onItemClick,
  'data-testid': testId,
}: NavigationGroupProps) {
  if (collapsed) {
    return null;
  }

  return (
    <Stack gap="xs" data-testid={testId || `nav-group-${id}`}>
      <Text size="xs" fw={500} c="dimmed" tt="uppercase" px="md">
        {label}
      </Text>
      <Stack gap={0}>
        {items.map(item => (
          <NavigationItem key={item.id} {...item} onClick={() => onItemClick?.(item.id)} />
        ))}
      </Stack>
      <Divider my="sm" />
    </Stack>
  );
}
