'use client';

import { Breadcrumbs as MantineBreadcrumbs, Anchor, Text } from '@mantine/core';
import Link from 'next/link';
import { IconHome } from '@tabler/icons-react';

interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems = [{ title: 'Admin', href: '/admin', icon: <IconHome size={16} /> }, ...items];

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
            component={Link}
            href={item.href}
            size="sm"
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            {index === 0 && 'icon' in item && item.icon}
            {item.title}
          </Anchor>
        );
      })}
    </MantineBreadcrumbs>
  );
}
