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
} from '@mantine/core';
import Image from 'next/image';

import { ColorSchemesSwitcher } from '@/components/ColorSchemesSwitcher';
import LocaleSwitcher from '@/components/LocaleSwitcher';

import { useAppLayout } from './AppLayoutContext';

interface AppLayoutControlsProps {
  dict?: any;
  locale?: string;
}

export function AppLayoutControls({ dict, locale }: AppLayoutControlsProps = {}) {
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

  return (
    <Paper p="sm" withBorder={true}>
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
                onChange={(e) => setHeaderEnabled(e.currentTarget.checked)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Switch
                checked={navbarEnabled}
                label="Navbar"
                size="md"
                onChange={(e) => setNavbarEnabled(e.currentTarget.checked)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Switch
                checked={asideEnabled}
                label="Aside"
                size="md"
                onChange={(e) => setAsideEnabled(e.currentTarget.checked)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Switch
                checked={footerEnabled}
                label="Footer"
                size="md"
                onChange={(e) => setFooterEnabled(e.currentTarget.checked)}
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
                onChange={(e) => setNavbar(e.currentTarget.checked)}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Switch
                checked={asideOpened}
                disabled={!asideEnabled}
                label="Aside"
                size="md"
                onChange={(e) => setAside(e.currentTarget.checked)}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Switch
                checked={mobileNavbarOpened}
                disabled={!navbarEnabled}
                label="Mobile Nav"
                size="md"
                onChange={(e) => setMobileNavbar(e.currentTarget.checked)}
              />
            </Grid.Col>
          </Grid>

          <Group gap="xs" justify="center" mt="xs">
            <Button size="xs" variant="light" onClick={openAll}>
              Open All
            </Button>
            <Button size="xs" variant="outline" onClick={closeAll}>
              Close All
            </Button>
            <Button disabled={!asideEnabled} size="xs" variant="light" onClick={_toggleAside}>
              Toggle Aside
            </Button>
            <Button disabled={!navbarEnabled} size="xs" variant="light" onClick={toggleNavbar}>
              Toggle Navbar
            </Button>
            <Button
              disabled={!navbarEnabled}
              size="xs"
              variant="light"
              onClick={toggleMobileNavbar}
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
                onChange={(value) => setHeaderHeight(Number(value) || 60)}
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
                onChange={(value) => setFooterHeight(Number(value) || 60)}
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
                onChange={(value) => setNavbarWidth(Number(value) || 300)}
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
                onChange={(value) => setAsideWidth(Number(value) || 300)}
              />
            </Grid.Col>
          </Grid>
        </Box>
      </Stack>
    </Paper>
  );
}
