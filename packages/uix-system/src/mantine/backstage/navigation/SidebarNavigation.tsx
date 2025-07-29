'use client';

import { Stack } from '@mantine/core';
import { NavigationGroup } from './NavigationGroup';
import { NavigationItem } from './NavigationItem';
import { NavigationProps } from './types';

export function SidebarNavigation({
  items,
  groups,
  className,
  'data-testid': testId,
}: NavigationProps) {
  return (
    <Stack gap="md" className={className} data-testid={testId || 'sidebar-navigation'}>
      {/* Render individual items */}
      {items?.map(item => (
        <NavigationItem key={item.id} {...item} />
      ))}

      {/* Render groups */}
      {groups?.map(group => (
        <NavigationGroup key={group.id} {...group} />
      ))}
    </Stack>
  );
}
