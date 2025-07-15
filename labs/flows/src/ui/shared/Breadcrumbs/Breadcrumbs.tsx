import React from 'react';
import {
  Breadcrumbs as MantineBreadcrumbs,
  Button,
  Text,
  rem,
} from '@mantine/core';
import { IconSlashes } from '@tabler/icons-react';
import Link from 'next/link';

export const Breadcrumbs: React.FC<{
  items: { title: string; href?: string }[];
}> = ({ items }) => (
  <MantineBreadcrumbs
    separator={
      <IconSlashes
        color="var(--mantine-color-gray-6)"
        style={{ width: rem(16), height: rem(16) }}
      />
    }
    separatorMargin={rem(2)}
  >
    {items.map((item, _index) =>
      item.href ? (
        <Button
          variant="subtle"
          color="cyan"
          px={rem(5)}
          size="compact-md"
          component={Link}
          fw={500}
          href={item.href}
          key={`breadcrumb-button-${item.href}-${item.title}`}
        >
          {item.title}
        </Button>
      ) : (
        <Text
          variant="transparent"
          c="gray"
          px={rem(5)}
          size="compact-md"
          fw={500}
          key={`breadcrumb-text-${item.title}`}
        >
          {item.title}
        </Text>
      ),
    )}
  </MantineBreadcrumbs>
);
