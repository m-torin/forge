'use client';

import { Anchor, Breadcrumbs as MantineBreadcrumbs, Text } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import Link from 'next/link';

interface BreadcrumbItem {
  href?: string;
  title: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems = [{ href: '/admin', icon: <IconHome size={16} />, title: 'Admin' }, ...items];

  return (
    <MantineBreadcrumbs separator="→" mb="md">
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;

        if (isLast || !item.href) {
          return (
            <Text key={index} c={isLast ? undefined : 'dimmed'} size="sm">
              {index === 0 && 'icon' in item && item.icon}
              {item.title}
            </Text>
          );
        }

        return (
          <Anchor
            key={index}
            href={item.href}
            component={Link}
            style={{ alignItems: 'center', display: 'flex', gap: 4 }}
            size="sm"
          >
            {index === 0 && 'icon' in item && item.icon}
            {item.title}
          </Anchor>
        );
      })}
    </MantineBreadcrumbs>
  );
}
