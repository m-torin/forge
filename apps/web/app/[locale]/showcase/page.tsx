import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconChartBar,
  IconGift,
  IconHeart,
  IconLock,
  IconPhoto,
  IconSearch,
  IconShoppingCart,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";

const features = [
  {
    badge: "Parallel Routes",
    color: "blue",
    description: "Parallel routes with filters and results",
    href: "/products",
    icon: IconShoppingCart,
    title: "Product Catalog",
  },
  {
    badge: "Intercepting Routes",
    color: "green",
    description: "Intercepting routes for modal previews",
    href: "/gallery",
    icon: IconPhoto,
    title: "Photo Gallery",
  },
  {
    badge: "Parallel Routes",
    color: "orange",
    description: "Multiple parallel routes in one view",
    href: "/dashboard",
    icon: IconChartBar,
    title: "Analytics Dashboard",
  },
  {
    badge: "Intercepting Routes",
    color: "purple",
    description: "User profiles with modal interception",
    href: "/users",
    icon: IconUsers,
    title: "Team Directory",
  },
  {
    badge: "Algolia + Analytics",
    color: "teal",
    description: "Algolia InstantSearch with analytics",
    href: "/search",
    icon: IconSearch,
    title: "Search Experience",
  },
  {
    badge: "Authentication",
    color: "red",
    description: "Protected routes with Better Auth",
    href: "/account",
    icon: IconLock,
    title: "Account Dashboard",
  },
  {
    badge: "New Feature",
    color: "pink",
    description: "Universal registry with co-owners",
    href: "/registries",
    icon: IconGift,
    title: "Gift Registries",
  },
  {
    badge: "Favorites",
    color: "red",
    description: "Wishlist with registry integration",
    href: "/favorites",
    icon: IconHeart,
    title: "My Favorites",
  },
];

export default function ShowcasePage() {
  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <div style={{ textAlign: "center" }}>
          <Title order={1} mb="md">
            Next.js Advanced Routing Showcase
          </Title>
          <Text c="dimmed" maw={600} mx="auto" size="lg">
            Explore parallel routes, intercepting routes, and integrated search
            with analytics. Press{" "}
            <Badge size="sm" variant="light">
              ⌘K
            </Badge>{" "}
            to open global search.
          </Text>
        </div>

        <Grid>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Grid.Col key={feature.href} span={{ base: 12, md: 4, sm: 6 }}>
                <Card
                  href={feature.href as any}
                  component={Link}
                  withBorder
                  style={{
                    "&:hover": {
                      transform: "translateY(-2px)",
                    },
                    cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                  padding="lg"
                  radius="md"
                >
                  <Group justify="space-between" mb="md">
                    <Icon
                      color={`var(--mantine-color-${feature.color}-6)`}
                      size={32}
                    />
                    <Badge color={feature.color} size="sm" variant="light">
                      {feature.badge}
                    </Badge>
                  </Group>

                  <Title order={3} mb="xs">
                    {feature.title}
                  </Title>

                  <Text c="dimmed" size="sm">
                    {feature.description}
                  </Text>

                  <Button
                    fullWidth
                    color={feature.color}
                    component="span"
                    mt="md"
                    variant="subtle"
                  >
                    Explore →
                  </Button>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>

        <Card withBorder style={{ textAlign: "center" }} p="xl" radius="md">
          <Title order={3} mb="md">
            Features Demonstrated
          </Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
              <Stack gap="xs">
                <Text fw={700}>🔀 Parallel Routes</Text>
                <Text c="dimmed" size="sm">
                  Multiple UI sections rendered simultaneously
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
              <Stack gap="xs">
                <Text fw={700}>🎯 Intercepting Routes</Text>
                <Text c="dimmed" size="sm">
                  Modal overlays without navigation
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
              <Stack gap="xs">
                <Text fw={700}>🔍 Algolia Search</Text>
                <Text c="dimmed" size="sm">
                  InstantSearch with autocomplete
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3, sm: 6 }}>
              <Stack gap="xs">
                <Text fw={700}>📊 Analytics</Text>
                <Text c="dimmed" size="sm">
                  Event tracking and user insights
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>
        </Card>
      </Stack>
    </Container>
  );
}
