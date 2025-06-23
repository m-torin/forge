'use client';

import {
  Box,
  Button,
  Divider,
  Grid,
  Group,
  NumberInput,
  Paper,
  Stack,
  Switch,
  Text,
  Skeleton,
  Alert,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import Image from 'next/image';
import { useState } from 'react';

import { ColorSchemesSwitcher } from '@/components/ColorSchemesSwitcher';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { logger } from '@/lib/logger';

import { useAppLayout } from './AppLayoutContext';

interface AppLayoutControlsProps {
  dict?: any;
  locale?: string;
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for AppLayoutControls
function AppLayoutControlsSkeleton({ testId }: { testId?: string }) {
  return (
    <Paper p="md" radius="sm" data-testid={testId}>
      <Stack gap="md">
        <Skeleton height={24} width="40%" />
        <Divider />
        <Grid>
          <Grid.Col span={6}>
            <Stack gap="sm">
              <Skeleton height={20} width="60%" />
              <Skeleton height={32} />
              <Skeleton height={32} />
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack gap="sm">
              <Skeleton height={20} width="60%" />
              <Skeleton height={32} />
              <Skeleton height={32} />
            </Stack>
          </Grid.Col>
        </Grid>
        <Divider />
        <Group>
          <Skeleton height={36} width={80} />
          <Skeleton height={36} width={80} />
        </Group>
      </Stack>
    </Paper>
  );
}

// Error state for AppLayoutControls
function AppLayoutControlsError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light" data-testid={testId}>
      <Text size="sm">Layout controls failed to load</Text>
      <Text size="xs" c="dimmed">
        {error}
      </Text>
    </Alert>
  );
}

export function AppLayoutControls({
  dict,
  locale,
  loading = false,
  error,
  'data-testid': testId = 'app-layout-controls',
}: AppLayoutControlsProps = {}) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const {
    asideEnabled,
    // Visibility states
    asideOpened,
    // Dimensions
    asideWidth,

    closeAll,
    footerEnabled,
    footerHeight,
    // Enabled states
    headerEnabled,

    headerHeight,
    mobileNavbarOpened,
    navbarEnabled,
    navbarOpened,

    navbarWidth,
    openAll,
    // Visibility controls
    setAside,
    setAsideEnabled,
    // Dimension controls
    setAsideWidth,
    setFooterEnabled,
    setFooterHeight,
    // Enable/disable controls
    setHeaderEnabled,

    setHeaderHeight,
    setMobileNavbar,
    setNavbar,
    setNavbarEnabled,
    setNavbarWidth,
    toggleAside: _toggleAside,
    toggleAsideEnabled: _toggleAsideEnabled,
    toggleFooterEnabled: _toggleFooterEnabled,

    toggleHeaderEnabled: _toggleHeaderEnabled,
    toggleMobileNavbar,
    toggleNavbar,
    toggleNavbarEnabled: _toggleNavbarEnabled,
  } = useAppLayout();

  // Show loading state
  if (loading) {
    return <AppLayoutControlsSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <AppLayoutControlsError error={currentError} testId={testId} />;
  }

  try {
    const handleSwitchChange = (setter: (value: boolean) => void, checked: boolean) => {
      try {
        setter(checked);
      } catch (err) {
        logger.error('Switch change error', err);
        setInternalError('Failed to update setting');
      }
    };

    const handleNumberChange = (setter: (value: number) => void, value: string | number) => {
      try {
        setter(Number(value) || 0);
      } catch (err) {
        logger.error('Number input error', err);
        setInternalError('Failed to update dimension');
      }
    };

    const handleButtonClick = (action: () => void, actionName: string) => {
      try {
        action();
      } catch (err) {
        logger.error(`${actionName} error`, err);
        setInternalError(`Failed to ${actionName}`);
      }
    };

    return (
      <ErrorBoundary
        fallback={
          <AppLayoutControlsError error="Layout controls failed to render" testId={testId} />
        }
      >
        <Paper p="sm" withBorder={true} data-testid={testId}>
          <Stack gap="sm">
            <Text fw={500} size="md">
              Layout Controls
            </Text>

            {/* Header Settings Section */}
            <Box>
              <Text c="dimmed" fw={500} mb="xs" size="xs">
                Header Settings
              </Text>
              <Group justify="space-between" mb="xs">
                <Group>
                  <Image
                    alt={dict?.app?.logoAlt || 'logo'}
                    className="dark:invert"
                    height={100}
                    src="https://nextjs.org/icons/next.svg"
                    width={100}
                  />
                </Group>
                <Group>
                  {locale && dict && (
                    <LocaleSwitcher
                      currentLocale={locale}
                      languages={{
                        de: dict.app?.l?.de || 'German',
                        en: dict.app?.l?.en || 'English',
                        esMX: dict.app?.l?.esMX || 'Spanish (Mexico)',
                        frCA: dict.app?.l?.frCA || 'Français (Canada)',
                        ptBR: dict.app?.l?.ptBR || 'Portuguese (Brazil)',
                      }}
                      selectLanguagePlaceholder={dict.app?.selectLanguage || 'Select language'}
                    />
                  )}
                  <ColorSchemesSwitcher />
                </Group>
              </Group>
            </Box>

            <Divider />

            {/* Enable/Disable Section */}
            <Box>
              <Text c="dimmed" fw={500} mb="xs" size="xs">
                Enable/Disable Components
              </Text>
              <Grid gutter="xs">
                <Grid.Col span={6}>
                  <Switch
                    checked={headerEnabled}
                    label="Header"
                    size="md"
                    onChange={(e) => handleSwitchChange(setHeaderEnabled, e.currentTarget.checked)}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Switch
                    checked={navbarEnabled}
                    label="Navbar"
                    size="md"
                    onChange={(e) => handleSwitchChange(setNavbarEnabled, e.currentTarget.checked)}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Switch
                    checked={asideEnabled}
                    label="Aside"
                    size="md"
                    onChange={(e) => handleSwitchChange(setAsideEnabled, e.currentTarget.checked)}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Switch
                    checked={footerEnabled}
                    label="Footer"
                    size="md"
                    onChange={(e) => handleSwitchChange(setFooterEnabled, e.currentTarget.checked)}
                  />
                </Grid.Col>
              </Grid>
            </Box>

            <Divider />

            {/* Show/Hide Section */}
            <Box>
              <Text c="dimmed" fw={500} mb="xs" size="xs">
                Show/Hide Components
              </Text>
              <Grid gutter="xs">
                <Grid.Col span={4}>
                  <Switch
                    checked={navbarOpened}
                    disabled={!navbarEnabled}
                    label="Navbar"
                    size="md"
                    onChange={(e) => handleSwitchChange(setNavbar, e.currentTarget.checked)}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Switch
                    checked={asideOpened}
                    disabled={!asideEnabled}
                    label="Aside"
                    size="md"
                    onChange={(e) => handleSwitchChange(setAside, e.currentTarget.checked)}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Switch
                    checked={mobileNavbarOpened}
                    disabled={!navbarEnabled}
                    label="Mobile Nav"
                    size="md"
                    onChange={(e) => handleSwitchChange(setMobileNavbar, e.currentTarget.checked)}
                  />
                </Grid.Col>
              </Grid>

              <Group gap="xs" justify="center" mt="xs">
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => handleButtonClick(openAll, 'open all')}
                >
                  Open All
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleButtonClick(closeAll, 'close all')}
                >
                  Close All
                </Button>
                <Button
                  disabled={!asideEnabled}
                  size="xs"
                  variant="light"
                  onClick={() => handleButtonClick(_toggleAside, 'toggle aside')}
                >
                  Toggle Aside
                </Button>
                <Button
                  disabled={!navbarEnabled}
                  size="xs"
                  variant="light"
                  onClick={() => handleButtonClick(toggleNavbar, 'toggle navbar')}
                >
                  Toggle Navbar
                </Button>
                <Button
                  disabled={!navbarEnabled}
                  size="xs"
                  variant="light"
                  onClick={() => handleButtonClick(toggleMobileNavbar, 'toggle mobile nav')}
                >
                  Toggle Mobile Nav
                </Button>
              </Group>
            </Box>

            <Divider />

            {/* Dimensions Section */}
            <Box>
              <Text c="dimmed" fw={500} mb="xs" size="xs">
                Dimensions
              </Text>
              <Grid gutter="xs">
                <Grid.Col span={6}>
                  <NumberInput
                    disabled={!headerEnabled}
                    label="Header Height"
                    max={120}
                    min={40}
                    size="xs"
                    step={10}
                    value={typeof headerHeight === 'number' ? headerHeight : 60}
                    onChange={(value) => handleNumberChange(setHeaderHeight, value || 60)}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    disabled={!footerEnabled}
                    label="Footer Height"
                    max={120}
                    min={40}
                    size="xs"
                    step={10}
                    value={typeof footerHeight === 'number' ? footerHeight : 60}
                    onChange={(value) => handleNumberChange(setFooterHeight, value || 60)}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    disabled={!navbarEnabled}
                    label="Navbar Width"
                    max={500}
                    min={200}
                    size="xs"
                    step={50}
                    value={typeof navbarWidth === 'number' ? navbarWidth : 300}
                    onChange={(value) => handleNumberChange(setNavbarWidth, value || 300)}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    disabled={!asideEnabled}
                    label="Aside Width"
                    max={500}
                    min={200}
                    size="xs"
                    step={50}
                    value={typeof asideWidth === 'number' ? asideWidth : 300}
                    onChange={(value) => handleNumberChange(setAsideWidth, value || 300)}
                  />
                </Grid.Col>
              </Grid>
            </Box>
          </Stack>
        </Paper>
      </ErrorBoundary>
    );
  } catch (err) {
    logger.error('AppLayoutControls error', err);
    setInternalError('Failed to render layout controls');
    return <AppLayoutControlsError error="Failed to render layout controls" testId={testId} />;
  }
}
