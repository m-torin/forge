import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconGift,
  IconHeart,
  IconPlus,
  IconShield,
} from "@tabler/icons-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthFlags, getUIFlags } from "@repo/analytics";
import { getSession } from "@repo/auth/server";
import { OrganizationSwitcher, UserButton } from "@repo/design-system/uix";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Get feature flags for the user
  const [authFlags, uiFlags] = await Promise.all([
    getAuthFlags(session.user.id),
    getUIFlags(session.user.id),
  ]);

  // Mock data for registries and favorites
  const mockRegistries = [
    {
      id: "1",
      name: "Wedding Registry",
      type: "wedding",
      itemCount: 45,
      purchasedCount: 12,
    },
    {
      id: "2",
      name: "Baby Shower",
      type: "baby",
      itemCount: 32,
      purchasedCount: 8,
    },
  ];

  const mockFavoritesCount = 7;

  return (
    <Container py="xl" size="lg">
      <Group justify="space-between" mb="xl">
        <Title order={1}>My Account</Title>
        <Group>
          {authFlags.organizationsEnabled && <OrganizationSwitcher />}
          <UserButton showName />
        </Group>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="lg">
            <Card withBorder p="lg">
              <Title order={2} mb="md">
                Welcome, {session.user.name || session.user.email}!
              </Title>
              <Text c="dimmed">
                You're signed in and can access protected content.
              </Text>
            </Card>

            <Card withBorder p="lg">
              <Title order={3} mb="md">
                Your Account Details
              </Title>
              <Stack gap="xs">
                <Text>
                  <strong>Email:</strong> {session.user.email}
                </Text>
                <Text>
                  <strong>Name:</strong> {session.user.name || "Not set"}
                </Text>
                <Text>
                  <strong>User ID:</strong> {session.user.id}
                </Text>
                <Text>
                  <strong>Created:</strong>{" "}
                  {new Date(session.user.createdAt).toLocaleDateString()}
                </Text>
              </Stack>
            </Card>

            {(uiFlags.betaComponents ||
              Object.values(authFlags).some((flag) => flag)) && (
              <Card withBorder p="lg">
                <Title order={3} mb="md">
                  Available Features
                </Title>
                <Group gap="xs">
                  {authFlags.organizationsEnabled && (
                    <Badge color="blue">Organizations</Badge>
                  )}
                  {authFlags.apiKeysEnabled && (
                    <Badge color="green">API Keys</Badge>
                  )}
                  {authFlags.twoFactorOptional && (
                    <Badge color="orange">2FA Available</Badge>
                  )}
                  {authFlags.passkeyEnabled && (
                    <Badge color="purple">Passkeys</Badge>
                  )}
                  {authFlags.magicLinkEnabled && (
                    <Badge color="teal">Magic Links</Badge>
                  )}
                  {uiFlags.betaComponents && (
                    <Badge color="pink">Beta UI</Badge>
                  )}
                  {uiFlags.darkModeEnabled && (
                    <Badge variant="outline">Dark Mode</Badge>
                  )}
                </Group>
              </Card>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            {/* Registries Card */}
            <Card withBorder p="lg">
              <Group justify="space-between" mb="md">
                <Group>
                  <IconGift size={24} />
                  <Title order={3}>My Registries</Title>
                </Group>
                <Badge>{mockRegistries.length}</Badge>
              </Group>

              {mockRegistries.length > 0 ? (
                <Stack gap="sm">
                  {mockRegistries.map((registry) => {
                    const progress =
                      registry.itemCount > 0
                        ? Math.round(
                            (registry.purchasedCount / registry.itemCount) *
                              100,
                          )
                        : 0;

                    return (
                      <Card key={registry.id} withBorder p="sm">
                        <Text fw={500} size="sm">
                          {registry.name}
                        </Text>
                        <Group justify="space-between" mt="xs">
                          <Text c="dimmed" size="xs">
                            {registry.purchasedCount}/{registry.itemCount} items
                          </Text>
                          <Text fw={500} size="xs">
                            {progress}%
                          </Text>
                        </Group>
                        <Progress mt="xs" size="xs" value={progress} />
                      </Card>
                    );
                  })}

                  <Button
                    fullWidth
                    href="/registries"
                    component={Link as any}
                    rightSection={<IconArrowRight size={16} />}
                    variant="light"
                  >
                    View All Registries
                  </Button>
                </Stack>
              ) : (
                <Stack>
                  <Text c="dimmed" size="sm" ta="center">
                    No registries yet
                  </Text>
                  <Button
                    fullWidth
                    href="/registries/create"
                    component={Link as any}
                    leftSection={<IconPlus size={16} />}
                  >
                    Create Registry
                  </Button>
                </Stack>
              )}
            </Card>

            {/* Favorites Card */}
            <Card withBorder p="lg">
              <Group justify="space-between" mb="md">
                <Group>
                  <IconHeart size={24} />
                  <Title order={3}>My Favorites</Title>
                </Group>
                <Badge>{mockFavoritesCount}</Badge>
              </Group>

              <Stack gap="sm">
                <Text c="dimmed" size="sm">
                  {mockFavoritesCount > 0
                    ? `You have ${mockFavoritesCount} items in your favorites`
                    : "No favorites yet"}
                </Text>

                <Button
                  fullWidth
                  href="/favorites"
                  component={Link as any}
                  rightSection={<IconArrowRight size={16} />}
                  variant="light"
                >
                  View Favorites
                </Button>
              </Stack>
            </Card>

            {/* Security Card */}
            <Card withBorder p="lg">
              <Group justify="space-between" mb="md">
                <Group>
                  <IconShield size={24} />
                  <Title order={3}>Security</Title>
                </Group>
              </Group>

              <Stack gap="sm">
                <Text c="dimmed" size="sm">
                  Manage your account, security, and sessions
                </Text>

                <Button
                  fullWidth
                  href="/account/profile"
                  component={Link as any}
                  rightSection={<IconArrowRight size={16} />}
                  variant="light"
                >
                  Edit Profile
                </Button>

                <Button
                  fullWidth
                  href="/account/security"
                  component={Link as any}
                  rightSection={<IconArrowRight size={16} />}
                  variant="light"
                >
                  Login Methods
                </Button>

                <Button
                  fullWidth
                  href="/account/sessions"
                  component={Link as any}
                  rightSection={<IconArrowRight size={16} />}
                  variant="light"
                >
                  Active Sessions
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
