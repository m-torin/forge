'use client';

import { Badge, Card, Group, Stack, Text, Title } from '@mantine/core';

import { useFlag } from '@repo/feature-flags/client/next';

import {
  checkoutVariantFlag,
  enhancedProductCardsFlag,
  mobileFirstNavFlag,
  newHeroDesignFlag,
  themeConfigFlag,
} from '../app/lib/feature-flags';

export function FeatureFlagDemo() {
  // Use flags in client component
  const newHero = useFlag(newHeroDesignFlag, false);
  const enhancedCards = useFlag(enhancedProductCardsFlag, false);
  const mobileNav = useFlag(mobileFirstNavFlag, false);
  const checkoutVariant = useFlag(checkoutVariantFlag, 'original');
  const themeConfig = useFlag(themeConfigFlag, {
    borderRadius: 8,
    enableAnimations: true,
    primaryColor: '#0070f3',
  });

  if (
    newHero === undefined ||
    enhancedCards === undefined ||
    mobileNav === undefined ||
    checkoutVariant === undefined ||
    themeConfig === undefined
  ) {
    return <Text>Loading feature flags...</Text>;
  }

  return (
    <Card withBorder className="mx-auto max-w-4xl" p="xl">
      <Stack>
        <Title order={3}>🧪 Feature Flags Demo</Title>
        <Text c="dimmed" size="sm">
          This section demonstrates real-time feature flag integration with the Vercel Toolbar.
          Open the toolbar (bottom of page) to toggle flags and see instant changes.
        </Text>

        <Group>
          <Badge data-testid="new-hero-badge" color={newHero ? 'green' : 'gray'} variant="filled">
            New Hero: {newHero ? 'Active' : 'Default'}
          </Badge>
          <Badge data-testid="enhanced-cards-badge" color={enhancedCards ? 'blue' : 'gray'} variant="filled">
            Enhanced Cards: {enhancedCards ? 'On' : 'Off'}
          </Badge>
          <Badge data-testid="mobile-nav-badge" color={mobileNav ? 'purple' : 'gray'} variant="filled">
            Mobile Nav: {mobileNav ? 'Enabled' : 'Standard'}
          </Badge>
        </Group>

        <Group>
          <Badge data-testid="checkout-variant-badge" variant="outline">
            Checkout: {checkoutVariant}
          </Badge>
          <Badge data-testid="theme-color-badge" variant="outline">
            Theme: {themeConfig.primaryColor}
          </Badge>
          <Badge data-testid="border-radius-badge" variant="outline">
            Radius: {themeConfig.borderRadius}px
          </Badge>
          <Badge data-testid="animations-badge" variant="outline">
            Animations: {themeConfig.enableAnimations ? 'On' : 'Off'}
          </Badge>
        </Group>

        <Text c="dimmed" size="xs">
          💡 In development mode, you can toggle these flags using the Vercel Toolbar at the bottom of the page.
          This integration uses PostHog for flag management and provides real-time updates.
        </Text>
      </Stack>
    </Card>
  );
}