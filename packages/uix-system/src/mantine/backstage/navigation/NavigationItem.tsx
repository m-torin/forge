'use client';

import { Badge, Group, NavLink, Text } from '@mantine/core';
import Link from 'next/link';
import { NavigationItem as INavigationItem } from './types';

interface NavigationItemProps extends INavigationItem {
  onClick?: () => void;
}

export function NavigationItem({
  id,
  label,
  href,
  icon,
  active,
  badge,
  onClick,
  'data-testid': testId,
}: NavigationItemProps) {
  const content = (
    <Group justify="space-between" w="100%">
      <Group gap="sm">
        {icon}
        <Text size="sm">{label}</Text>
      </Group>
      {badge && (
        <Badge size="sm" variant="light" color="blue">
          {badge}
        </Badge>
      )}
    </Group>
  );

  return (
    <NavLink
      component={Link}
      href={href as any}
      label={content}
      active={active}
      onClick={onClick}
      data-testid={testId || `nav-item-${id}`}
    />
  );
}
