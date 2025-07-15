import { getDictionary, type Locale } from '#/lib/i18n';
import { ActionIcon, Box, Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconHome, IconSettings, IconUser } from '@tabler/icons-react';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function SidebarContent({ params }: Props) {
  const { locale } = await params;
  const _dict = await getDictionary(locale);

  return (
    <Box p="md" className="harmony-bg-surface h-full">
      <Stack gap="md">
        {/* Navigation Header */}
        <div className="harmony-text-primary">
          <Text size="lg" fw={600} mb="xs">
            Navigation
          </Text>
          <Text size="sm" className="harmony-text-muted">
            Quick access to main sections
          </Text>
        </div>

        {/* Navigation Links */}
        <Stack gap="xs">
          <Button
            variant="subtle"
            leftSection={<IconHome size={18} />}
            justify="flex-start"
            fullWidth
            className="harmony-transition harmony-text-secondary hover:harmony-bg-surface"
          >
            Home
          </Button>
          <Button
            variant="subtle"
            leftSection={<IconUser size={18} />}
            justify="flex-start"
            fullWidth
            className="harmony-transition harmony-text-secondary hover:harmony-bg-surface"
          >
            Profile
          </Button>
          <Button
            variant="subtle"
            leftSection={<IconSettings size={18} />}
            justify="flex-start"
            fullWidth
            className="harmony-transition harmony-text-secondary hover:harmony-bg-surface"
          >
            Settings
          </Button>
        </Stack>

        {/* Quick Actions Card */}
        <Card className="harmony-card mt-4">
          <Text size="sm" fw={500} mb="sm" className="harmony-text-primary">
            Quick Actions
          </Text>
          <Stack gap="xs">
            <Group gap="xs">
              <ActionIcon variant="light" size="sm" color="primary">
                <IconHome size={14} />
              </ActionIcon>
              <Text size="xs" className="harmony-text-secondary">
                Dashboard Overview
              </Text>
            </Group>
            <Group gap="xs">
              <ActionIcon variant="light" size="sm" color="success">
                <IconUser size={14} />
              </ActionIcon>
              <Text size="xs" className="harmony-text-secondary">
                User Management
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* Status Card */}
        <Card className="harmony-card">
          <Text size="sm" fw={500} mb="sm" className="harmony-text-primary">
            System Status
          </Text>
          <Group gap="xs" mb="xs">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <Text size="xs" className="harmony-text-secondary">
              All systems operational
            </Text>
          </Group>
          <Text size="xs" className="harmony-text-muted">
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </Card>
      </Stack>
    </Box>
  );
}
