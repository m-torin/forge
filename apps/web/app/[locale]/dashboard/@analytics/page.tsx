"use client";

import {
  Card,
  Grid,
  Group,
  RingProgress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "Mon", sales: 2400, users: 400 },
  { name: "Tue", sales: 1398, users: 300 },
  { name: "Wed", sales: 9800, users: 200 },
  { name: "Thu", sales: 3908, users: 278 },
  { name: "Fri", sales: 4800, users: 189 },
  { name: "Sat", sales: 3800, users: 239 },
  { name: "Sun", sales: 4300, users: 349 },
];

export default function AnalyticsParallel() {
  return (
    <Stack gap="lg">
      <Card withBorder>
        <Title order={2} mb="lg">
          Analytics Overview
        </Title>

        <Grid mb="lg">
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder>
              <Text c="dimmed" fw={700} size="sm" tt="uppercase">
                Total Users
              </Text>
              <Text fw={700} size="xl">
                12,345
              </Text>
              <Text c="green" mt="sm" size="sm">
                +12.5% from last month
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder>
              <Text c="dimmed" fw={700} size="sm" tt="uppercase">
                Revenue
              </Text>
              <Text fw={700} size="xl">
                $45,678
              </Text>
              <Text c="green" mt="sm" size="sm">
                +8.2% from last month
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder>
              <Text c="dimmed" fw={700} size="sm" tt="uppercase">
                Conversion Rate
              </Text>
              <Text fw={700} size="xl">
                3.45%
              </Text>
              <Text c="red" mt="sm" size="sm">
                -2.1% from last month
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        <Title order={3} mb="md">
          Weekly Trends
        </Title>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                stroke="#8884d8"
                dataKey="users"
                fill="#8884d8"
                stackId="1"
                type="monotone"
              />
              <Area
                stroke="#82ca9d"
                dataKey="sales"
                fill="#82ca9d"
                stackId="1"
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Grid>
        <Grid.Col span={6}>
          <Card withBorder>
            <Title order={3} mb="md">
              Traffic Sources
            </Title>
            <Group justify="center">
              <RingProgress
                sections={[
                  { color: "blue", value: 40 },
                  { color: "orange", value: 30 },
                  { color: "green", value: 20 },
                  { color: "pink", value: 10 },
                ]}
                size={150}
                thickness={20}
              />
            </Group>
            <Stack gap="xs" mt="md">
              <Group justify="space-between">
                <Text size="sm">Direct</Text>
                <Text fw={700} size="sm">
                  40%
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Social</Text>
                <Text fw={700} size="sm">
                  30%
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Search</Text>
                <Text fw={700} size="sm">
                  20%
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Other</Text>
                <Text fw={700} size="sm">
                  10%
                </Text>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card withBorder>
            <Title order={3} mb="md">
              Device Usage
            </Title>
            <Group justify="center">
              <RingProgress
                sections={[
                  { color: "indigo", value: 60 },
                  { color: "cyan", value: 30 },
                  { color: "violet", value: 10 },
                ]}
                size={150}
                thickness={20}
              />
            </Group>
            <Stack gap="xs" mt="md">
              <Group justify="space-between">
                <Text size="sm">Desktop</Text>
                <Text fw={700} size="sm">
                  60%
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Mobile</Text>
                <Text fw={700} size="sm">
                  30%
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Tablet</Text>
                <Text fw={700} size="sm">
                  10%
                </Text>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
