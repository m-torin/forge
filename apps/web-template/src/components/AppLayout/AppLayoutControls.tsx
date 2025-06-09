"use client";

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
} from "@mantine/core";

import { useAppLayout } from "./AppLayoutContext";

export function AppLayoutControls() {
  const {
    // Visibility states
    asideOpened,
    mobileNavbarOpened,
    navbarOpened,

    asideEnabled,
    footerEnabled,
    // Enabled states
    headerEnabled,
    navbarEnabled,

    // Dimensions
    asideWidth,
    navbarWidth,
    footerHeight,
    headerHeight,

    // Visibility controls
    setAside,
    toggleAside,
    closeAll,
    openAll,
    setMobileNavbar,
    setNavbar,
    toggleMobileNavbar,
    toggleNavbar,

    setAsideEnabled,
    toggleAsideEnabled,
    setFooterEnabled,
    // Enable/disable controls
    setHeaderEnabled,
    setNavbarEnabled,
    toggleFooterEnabled,
    toggleHeaderEnabled,
    toggleNavbarEnabled,

    // Dimension controls
    setAsideWidth,
    setNavbarWidth,
    setFooterHeight,
    setHeaderHeight,
  } = useAppLayout();

  return (
    <Paper withBorder p="sm">
      <Stack gap="sm">
        <Text fw={500} size="sm">
          Layout Controls
        </Text>

        {/* Enable/Disable Section */}
        <Box>
          <Text c="dimmed" fw={500} mb="xs" size="xs">
            Enable/Disable Components
          </Text>
          <Grid gutter="xs">
            <Grid.Col span={6}>
              <Switch
                onChange={(e) => setHeaderEnabled(e.currentTarget.checked)}
                checked={headerEnabled}
                label="Header"
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Switch
                onChange={(e) => setNavbarEnabled(e.currentTarget.checked)}
                checked={navbarEnabled}
                label="Navbar"
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Switch
                onChange={(e) => setAsideEnabled(e.currentTarget.checked)}
                checked={asideEnabled}
                label="Aside"
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Switch
                onChange={(e) => setFooterEnabled(e.currentTarget.checked)}
                checked={footerEnabled}
                label="Footer"
                size="sm"
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
                onChange={(e) => setNavbar(e.currentTarget.checked)}
                checked={navbarOpened}
                disabled={!navbarEnabled}
                label="Navbar"
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Switch
                onChange={(e) => setAside(e.currentTarget.checked)}
                checked={asideOpened}
                disabled={!asideEnabled}
                label="Aside"
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Switch
                onChange={(e) => setMobileNavbar(e.currentTarget.checked)}
                checked={mobileNavbarOpened}
                disabled={!navbarEnabled}
                label="Mobile Nav"
                size="sm"
              />
            </Grid.Col>
          </Grid>

          <Group gap="xs" justify="center" mt="xs">
            <Button onClick={openAll} size="xs" variant="light">
              Open All
            </Button>
            <Button onClick={closeAll} size="xs" variant="outline">
              Close All
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
                onChange={(value) => setHeaderHeight(Number(value) || 60)}
                disabled={!headerEnabled}
                label="Header Height"
                max={120}
                min={40}
                size="xs"
                step={10}
                value={typeof headerHeight === "number" ? headerHeight : 60}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                onChange={(value) => setFooterHeight(Number(value) || 60)}
                disabled={!footerEnabled}
                label="Footer Height"
                max={120}
                min={40}
                size="xs"
                step={10}
                value={typeof footerHeight === "number" ? footerHeight : 60}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                onChange={(value) => setNavbarWidth(Number(value) || 300)}
                disabled={!navbarEnabled}
                label="Navbar Width"
                max={500}
                min={200}
                size="xs"
                step={50}
                value={typeof navbarWidth === "number" ? navbarWidth : 300}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                onChange={(value) => setAsideWidth(Number(value) || 300)}
                disabled={!asideEnabled}
                label="Aside Width"
                max={500}
                min={200}
                size="xs"
                step={50}
                value={typeof asideWidth === "number" ? asideWidth : 300}
              />
            </Grid.Col>
          </Grid>
        </Box>
      </Stack>
    </Paper>
  );
}
