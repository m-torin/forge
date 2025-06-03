import { Container, Grid, Stack } from "@mantine/core";

import type { ReactNode } from "react";

interface DashboardLayoutProps {
  activity: ReactNode;
  analytics: ReactNode;
  children: ReactNode;
  notifications: ReactNode;
}

export default function DashboardLayout({
  activity,
  analytics,
  children,
  notifications,
}: DashboardLayoutProps) {
  return (
    <Container py="md" size="xl">
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="lg">
            {analytics}
            {activity}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>{notifications}</Grid.Col>
      </Grid>
      {children}
    </Container>
  );
}
