"use client";

import {
  Button,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Switch,
  Grid,
  Divider,
  Box,
} from "@mantine/core";

import { useAppLayout } from "./AppLayoutContext";

export function AppLayoutControls() {
  const {
    // Visibility states
    asideOpened,
    navbarOpened,
    mobileNavbarOpened,

    // Enabled states
    headerEnabled,
    navbarEnabled,
    asideEnabled,
    footerEnabled,

    // Dimensions
    asideWidth,
    navbarWidth,
    headerHeight,
    footerHeight,

    // Visibility controls
    setAside,
    setNavbar,
    setMobileNavbar,
    toggleAside,
    toggleNavbar,
    toggleMobileNavbar,
    closeAll,
    openAll,

    // Enable/disable controls
    setHeaderEnabled,
    setNavbarEnabled,
    setAsideEnabled,
    setFooterEnabled,
    toggleHeaderEnabled,
    toggleNavbarEnabled,
    toggleAsideEnabled,
    toggleFooterEnabled,

    // Dimension controls
    setAsideWidth,
    setNavbarWidth,
    setHeaderHeight,
    setFooterHeight,
  } = useAppLayout();

  return (
    <Paper withBorder p="sm">
      <Stack gap="sm">
        <Text fw={500} size="sm">
          Layout Controls
        </Text>

        {/* Enable/Disable Section */}
        <Box>
          <Text fw={500} size="xs" mb="xs" c="dimmed">
            Enable/Disable Components
          </Text>
          <Grid gutter="xs">
            <Grid.Col span={6}>
              <Switch
                checked={headerEnabled}
                onChange={(e) => setHeaderEnabled(e.currentTarget.checked)}
                label="Header"
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Switch
                checked={navbarEnabled}
                onChange={(e) => setNavbarEnabled(e.currentTarget.checked)}
                label="Navbar"
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Switch
                checked={asideEnabled}
                onChange={(e) => setAsideEnabled(e.currentTarget.checked)}
                label="Aside"
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Switch
                checked={footerEnabled}
                onChange={(e) => setFooterEnabled(e.currentTarget.checked)}
                label="Footer"
                size="sm"
              />
            </Grid.Col>
          </Grid>
        </Box>

        <Divider />

        {/* Show/Hide Section */}
        <Box>
          <Text fw={500} size="xs" mb="xs" c="dimmed">
            Show/Hide Components
          </Text>
          <Grid gutter="xs">
            <Grid.Col span={4}>
              <Switch
                checked={navbarOpened}
                onChange={(e) => setNavbar(e.currentTarget.checked)}
                label="Navbar"
                size="sm"
                disabled={!navbarEnabled}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Switch
                checked={asideOpened}
                onChange={(e) => setAside(e.currentTarget.checked)}
                label="Aside"
                size="sm"
                disabled={!asideEnabled}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Switch
                checked={mobileNavbarOpened}
                onChange={(e) => setMobileNavbar(e.currentTarget.checked)}
                label="Mobile Nav"
                size="sm"
                disabled={!navbarEnabled}
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
          <Text fw={500} size="xs" mb="xs" c="dimmed">
            Dimensions
          </Text>
          <Grid gutter="xs">
            <Grid.Col span={6}>
              <NumberInput
                onChange={(value) => setHeaderHeight(Number(value) || 60)}
                label="Header Height"
                max={120}
                min={40}
                step={10}
                value={typeof headerHeight === "number" ? headerHeight : 60}
                size="xs"
                disabled={!headerEnabled}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                onChange={(value) => setFooterHeight(Number(value) || 60)}
                label="Footer Height"
                max={120}
                min={40}
                step={10}
                value={typeof footerHeight === "number" ? footerHeight : 60}
                size="xs"
                disabled={!footerEnabled}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                onChange={(value) => setNavbarWidth(Number(value) || 300)}
                label="Navbar Width"
                max={500}
                min={200}
                step={50}
                value={typeof navbarWidth === "number" ? navbarWidth : 300}
                size="xs"
                disabled={!navbarEnabled}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                onChange={(value) => setAsideWidth(Number(value) || 300)}
                label="Aside Width"
                max={500}
                min={200}
                step={50}
                value={typeof asideWidth === "number" ? asideWidth : 300}
                size="xs"
                disabled={!asideEnabled}
              />
            </Grid.Col>
          </Grid>
        </Box>
      </Stack>
    </Paper>
  );
}
