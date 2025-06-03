'use client';

import { Anchor, Box, Container, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { type ReactNode } from 'react';

interface AuthLayoutProps {
  alternativeAction?: {
    text: string;
    linkText: string;
    href: string;
  };
  children: ReactNode;
  showBranding?: boolean;
  subtitle?: string;
  title: string;
}

export const AuthLayout = ({
  alternativeAction,
  children,
  showBranding = true,
  subtitle,
  title,
}: AuthLayoutProps) => {
  return (
    <Container
      style={{ alignItems: 'center', display: 'flex', minHeight: '100vh' }}
      py="xl"
      size="sm"
    >
      <Box style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
        {showBranding && (
          <Box mb="xl" ta="center">
            <Title order={2} style={{ fontWeight: 600 }} mb="xs">
              Forge Ahead
            </Title>
            <Text c="dimmed" size="sm">
              Build something amazing
            </Text>
          </Box>
        )}

        <Box mb="xl" ta="center">
          <Title order={1} style={{ fontSize: '2rem', fontWeight: 600 }} mb="sm">
            {title}
          </Title>
          {subtitle && (
            <Text c="dimmed" size="md">
              {subtitle}
            </Text>
          )}
        </Box>

        <Box mb="lg">{children}</Box>

        {alternativeAction && (
          <Text c="dimmed" size="sm" ta="center">
            {alternativeAction.text}{' '}
            <Anchor href={alternativeAction.href as any} component={Link} fw={500}>
              {alternativeAction.linkText}
            </Anchor>
          </Text>
        )}
      </Box>
    </Container>
  );
};
