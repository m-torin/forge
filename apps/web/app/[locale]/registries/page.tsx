"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Progress,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconEdit,
  IconGift,
  IconPlus,
  IconSearch,
  IconShare,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { analytics } from "@repo/analytics";

// Mock registry data
const mockRegistries = [
  {
    id: "1",
    name: "Wedding Registry",
    type: "wedding",
    createdAt: "2024-01-15",
    description: "John & Jane's Wedding - June 2024",
    isPublic: true,
    itemCount: 45,
    purchasedCount: 12,
    shareUrl: "/registries/public/wedding-john-jane-2024",
  },
  {
    id: "2",
    name: "Baby Shower",
    type: "baby",
    createdAt: "2024-02-01",
    description: "Welcome Baby Smith!",
    isPublic: true,
    itemCount: 32,
    purchasedCount: 8,
    shareUrl: "/registries/public/baby-smith-2024",
  },
  {
    id: "3",
    name: "Birthday Wishlist",
    type: "birthday",
    createdAt: "2024-02-15",
    description: "My 30th Birthday Wishlist",
    isPublic: false,
    itemCount: 15,
    purchasedCount: 3,
    shareUrl: null,
  },
  {
    id: "4",
    name: "Housewarming Registry",
    type: "housewarming",
    createdAt: "2024-01-20",
    description: "New Home Essentials",
    isPublic: true,
    itemCount: 28,
    purchasedCount: 20,
    shareUrl: "/registries/public/housewarming-2024",
  },
];

const registryTypes = [
  { label: "All Types", value: "all" },
  { label: "Wedding", value: "wedding" },
  { label: "Baby Shower", value: "baby" },
  { label: "Birthday", value: "birthday" },
  { label: "Housewarming", value: "housewarming" },
  { label: "Other", value: "other" },
];

export default function RegistriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [registries, setRegistries] = useState(mockRegistries);

  useEffect(() => {
    // Track page view
    analytics.capture("page_viewed", {
      page: "registries",
      title: "My Registries",
    });
  }, []);

  useEffect(() => {
    // Filter registries based on search and type
    let filtered = mockRegistries;

    if (searchQuery) {
      filtered = filtered.filter(
        (registry) =>
          registry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          registry.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((registry) => registry.type === filterType);
    }

    setRegistries(filtered);
  }, [searchQuery, filterType]);

  const handleCreateRegistry = () => {
    analytics.capture("registry_create_started", {
      source: "registries_page",
    });
  };

  const handleShareRegistry = (registry: any) => {
    analytics.capture("registry_shared", {
      registryId: registry.id,
      registryType: registry.type,
    });
    // Copy share URL to clipboard
    if (registry.shareUrl) {
      navigator.clipboard.writeText(window.location.origin + registry.shareUrl);
    }
  };

  const getRegistryColor = (type: string) => {
    switch (type) {
      case "wedding":
        return "pink";
      case "baby":
        return "blue";
      case "birthday":
        return "yellow";
      case "housewarming":
        return "green";
      default:
        return "gray";
    }
  };

  const getCompletionPercentage = (purchased: number, total: number) => {
    return total > 0 ? Math.round((purchased / total) * 100) : 0;
  };

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={1}>My Registries</Title>
            <Text c="dimmed">Create and manage your gift registries</Text>
          </div>
          <Button
            href={"/registries/create" as any}
            component={Link}
            leftSection={<IconPlus size={20} />}
            onClick={handleCreateRegistry}
            size="md"
          >
            Create Registry
          </Button>
        </Group>

        <Group>
          <TextInput
            leftSection={<IconSearch size={18} />}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search registries..."
            style={{ maxWidth: 400, flex: 1 }}
            value={searchQuery}
          />
          <Select
            onChange={(value) => setFilterType(value || "all")}
            placeholder="Filter by type"
            style={{ width: 200 }}
            data={registryTypes}
            value={filterType}
          />
        </Group>

        {registries.length === 0 ? (
          <Card withBorder p="xl" ta="center">
            <IconGift
              stroke={1.5}
              style={{ margin: "0 auto", opacity: 0.5 }}
              size={48}
            />
            <Text fw={500} mt="md" size="lg">
              No registries found
            </Text>
            <Text c="dimmed" mt="xs" size="sm">
              {searchQuery || filterType !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first registry to get started"}
            </Text>
          </Card>
        ) : (
          <Grid>
            {registries.map((registry) => {
              const completionPercentage = getCompletionPercentage(
                registry.purchasedCount,
                registry.itemCount,
              );

              return (
                <Grid.Col key={registry.id} span={{ base: 12, lg: 4, sm: 6 }}>
                  <Card withBorder padding="lg" radius="md">
                    <Group justify="space-between" mb="md">
                      <Badge
                        color={getRegistryColor(registry.type)}
                        variant="light"
                      >
                        {registry.type}
                      </Badge>
                      <Group gap="xs">
                        <ActionIcon
                          onClick={() => handleShareRegistry(registry)}
                          disabled={!registry.isPublic}
                          variant="subtle"
                        >
                          <IconShare size={18} />
                        </ActionIcon>
                        <ActionIcon
                          href={`/registries/${registry.id}/edit` as any}
                          component={Link}
                          variant="subtle"
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                      </Group>
                    </Group>

                    <Title order={3} mb="xs">
                      {registry.name}
                    </Title>
                    <Text c="dimmed" mb="md" size="sm">
                      {registry.description}
                    </Text>

                    <Stack gap="xs" mb="md">
                      <Group justify="space-between">
                        <Text size="sm">Progress</Text>
                        <Text fw={500} size="sm">
                          {registry.purchasedCount} / {registry.itemCount} items
                        </Text>
                      </Group>
                      <Progress
                        color={getRegistryColor(registry.type)}
                        radius="md"
                        size="md"
                        value={completionPercentage}
                      />
                      <Text c="dimmed" size="xs" ta="center">
                        {completionPercentage}% complete
                      </Text>
                    </Stack>

                    <Group gap="xs">
                      <Button
                        fullWidth
                        href={`/registries/${registry.id}` as any}
                        component={Link}
                        variant="filled"
                      >
                        View Registry
                      </Button>
                      {registry.isPublic && (
                        <Button
                          fullWidth
                          href={registry.shareUrl! as any}
                          component={Link}
                          variant="light"
                        >
                          Public View
                        </Button>
                      )}
                    </Group>

                    <Text c="dimmed" mt="md" size="xs">
                      Created{" "}
                      {new Date(registry.createdAt).toLocaleDateString()}
                    </Text>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
