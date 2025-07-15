'use client';

import { Grid, SimpleGrid, Skeleton, rem } from '@mantine/core';
import MonitoringCard from './MonitoringCard';
import RunsOverTimeChart from './RunsOverTimeChart';
import { StatsGrid } from './StatsGrid';

const PRIMARY_COL_HEIGHT = rem(300);
const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - var(--mantine-spacing-md) / 2)`;

export const MonitoringUI = () => {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      <MonitoringCard title="Runs over time">
        <RunsOverTimeChart />
      </MonitoringCard>

      <Grid gutter="md">
        <StatsGrid />

        <Grid.Col>
          <Skeleton height={SECONDARY_COL_HEIGHT} radius="md" animate={false} />
        </Grid.Col>
      </Grid>
    </SimpleGrid>
  );
};
