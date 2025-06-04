"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Grid,
  Group,
  Image,
  Menu,
  Modal,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDots,
  IconHeart,
  IconPlus,
  IconShare,
  IconShoppingCart,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { analytics } from "@repo/analytics-legacy";

// Mock favorites data
const mockFavorites = [
  {
    id: "1",
    name: "Dyson V15 Vacuum",
    addedAt: "2024-01-20",
    category: "Home Appliances",
    image: "https://placehold.co/200x200?text=Dyson",
    inStock: true,
    link: "/products/p1",
    price: 699.99,
    productId: "p1",
    rating: 4.8,
  },
  {
    id: "2",
    name: "Apple AirPods Pro",
    addedAt: "2024-01-18",
    category: "Electronics",
    image: "https://placehold.co/200x200?text=AirPods",
    inStock: true,
    link: "/products/p2",
    price: 249.99,
    productId: "p2",
    rating: 4.7,
  },
  {
    id: "3",
    name: "Ninja Foodi Grill",
    addedAt: "2024-01-15",
    category: "Kitchen",
    image: "https://placehold.co/200x200?text=Ninja",
    inStock: false,
    link: "/products/p3",
    price: 229.99,
    productId: "p3",
    rating: 4.6,
  },
  {
    id: "4",
    name: "Lululemon Yoga Mat",
    addedAt: "2024-01-10",
    category: "Sports",
    image: "https://placehold.co/200x200?text=Yoga+Mat",
    inStock: true,
    link: "/products/p4",
    price: 128.0,
    productId: "p4",
    rating: 4.9,
  },
];

// Mock user registries for adding favorites
const mockUserRegistries = [
  { label: "Wedding Registry", value: "1" },
  { label: "Birthday Wishlist", value: "2" },
  { label: "Housewarming Registry", value: "3" },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(mockFavorites);
  const [
    addToRegistryOpened,
    { close: closeAddToRegistry, open: openAddToRegistry },
  ] = useDisclosure(false);
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);
  const [selectedRegistry, setSelectedRegistry] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    // Track page view
    analytics.capture("page_viewed", {
      itemCount: favorites.length,
      page: "favorites",
      title: "My Favorites",
    });
  }, [favorites.length]);

  const handleRemoveFavorite = (favoriteId: string) => {
    setFavorites(favorites.filter((f) => f.id !== favoriteId));

    analytics.capture("favorite_removed", {
      favoriteId,
      source: "favorites_page",
    });
  };

  const handleAddToCart = (favorite: any) => {
    analytics.capture("add_to_cart_from_favorites", {
      price: favorite.price,
      productId: favorite.productId,
      productName: favorite.name,
    });
  };

  const handleShareFavorites = () => {
    const shareUrl = `${window.location.origin}/favorites/shared/${Date.now()}`;
    navigator.clipboard.writeText(shareUrl);

    analytics.capture("favorites_shared", {
      itemCount: favorites.length,
      method: "copy_link",
    });
  };

  const handleAddToRegistry = () => {
    if (selectedFavorites.length > 0) {
      openAddToRegistry();
    }
  };

  const handleConfirmAddToRegistry = () => {
    if (selectedRegistry && selectedFavorites.length > 0) {
      analytics.capture("favorites_added_to_registry", {
        itemCount: selectedFavorites.length,
        productIds: selectedFavorites,
        registryId: selectedRegistry,
      });

      // Reset selection
      setSelectedFavorites([]);
      setSelectedRegistry(null);
      setIsSelecting(false);
      closeAddToRegistry();
    }
  };

  const toggleSelection = (favoriteId: string) => {
    setSelectedFavorites((prev) =>
      prev.includes(favoriteId)
        ? prev.filter((id) => id !== favoriteId)
        : [...prev, favoriteId],
    );
  };

  const selectAll = () => {
    setSelectedFavorites(favorites.map((f) => f.id));
  };

  const deselectAll = () => {
    setSelectedFavorites([]);
  };

  const totalValue = favorites.reduce((sum, f) => sum + f.price, 0);
  const inStockCount = favorites.filter((f) => f.inStock).length;

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={1}>My Favorites</Title>
            <Text c="dimmed">
              {favorites.length} items · ${totalValue.toFixed(2)} total value
            </Text>
          </div>
          <Group>
            <Button
              onClick={() => setIsSelecting(!isSelecting)}
              variant="subtle"
            >
              {isSelecting ? "Cancel" : "Select Items"}
            </Button>
            {isSelecting && selectedFavorites.length > 0 && (
              <Button
                leftSection={<IconPlus size={20} />}
                onClick={handleAddToRegistry}
              >
                Add to Registry ({selectedFavorites.length})
              </Button>
            )}
            {!isSelecting && (
              <Button
                leftSection={<IconShare size={20} />}
                onClick={handleShareFavorites}
                variant="light"
              >
                Share List
              </Button>
            )}
          </Group>
        </Group>

        {isSelecting && (
          <Card withBorder p="sm">
            <Group justify="space-between">
              <Text size="sm">
                {selectedFavorites.length} of {favorites.length} items selected
              </Text>
              <Group gap="xs">
                <Button onClick={selectAll} size="xs" variant="subtle">
                  Select All
                </Button>
                <Button onClick={deselectAll} size="xs" variant="subtle">
                  Deselect All
                </Button>
              </Group>
            </Group>
          </Card>
        )}

        <Grid>
          <Grid.Col span={{ base: 12, md: 9 }}>
            {favorites.length === 0 ? (
              <Card withBorder p="xl" ta="center">
                <IconHeart
                  stroke={1.5}
                  style={{ margin: "0 auto", opacity: 0.5 }}
                  size={48}
                />
                <Text fw={500} mt="md" size="lg">
                  No favorites yet
                </Text>
                <Text c="dimmed" mt="xs" size="sm">
                  Start adding products to your favorites to keep track of items
                  you love
                </Text>
                <Button href={"/products" as any} component={Link} mt="md">
                  Browse Products
                </Button>
              </Card>
            ) : (
              <Stack>
                {favorites.map((favorite) => (
                  <Card key={favorite.id} withBorder padding="md">
                    <Group wrap="nowrap">
                      {isSelecting && (
                        <Checkbox
                          onChange={() => toggleSelection(favorite.id)}
                          checked={selectedFavorites.includes(favorite.id)}
                          size="lg"
                        />
                      )}

                      <Image
                        width={100}
                        fit="cover"
                        height={100}
                        radius="md"
                        src={favorite.image}
                      />

                      <div style={{ flex: 1 }}>
                        <Group align="flex-start" justify="space-between">
                          <div>
                            <Text
                              href={favorite.link as any}
                              component={Link}
                              style={{
                                color: "inherit",
                                textDecoration: "none",
                              }}
                              fw={500}
                              size="lg"
                            >
                              {favorite.name}
                            </Text>
                            <Group gap="xs" mt={4}>
                              <Badge size="sm" variant="light">
                                {favorite.category}
                              </Badge>
                              <Text c="dimmed" size="sm">
                                Rating: {favorite.rating} ⭐
                              </Text>
                              <Badge
                                color={favorite.inStock ? "green" : "red"}
                                size="sm"
                                variant="light"
                              >
                                {favorite.inStock ? "In Stock" : "Out of Stock"}
                              </Badge>
                            </Group>
                          </div>

                          <Text fw={700} size="xl">
                            ${favorite.price}
                          </Text>
                        </Group>

                        <Group justify="space-between" mt="md">
                          <Text c="dimmed" size="xs">
                            Added{" "}
                            {new Date(favorite.addedAt).toLocaleDateString()}
                          </Text>

                          <Group gap="xs">
                            <Button
                              leftSection={<IconShoppingCart size={16} />}
                              onClick={() => handleAddToCart(favorite)}
                              disabled={!favorite.inStock}
                              size="sm"
                            >
                              Add to Cart
                            </Button>

                            <Menu width={200} shadow="md">
                              <Menu.Target>
                                <ActionIcon size="lg" variant="subtle">
                                  <IconDots size={20} />
                                </ActionIcon>
                              </Menu.Target>

                              <Menu.Dropdown>
                                <Menu.Item
                                  leftSection={<IconPlus size={16} />}
                                  onClick={() => {
                                    setSelectedFavorites([favorite.id]);
                                    openAddToRegistry();
                                  }}
                                >
                                  Add to Registry
                                </Menu.Item>
                                <Menu.Item
                                  href={favorite.link as any}
                                  component={Link}
                                  leftSection={<IconShare size={16} />}
                                >
                                  View Product
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                  color="red"
                                  leftSection={<IconTrash size={16} />}
                                  onClick={() =>
                                    handleRemoveFavorite(favorite.id)
                                  }
                                >
                                  Remove
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Group>
                        </Group>
                      </div>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3 }}>
            <Stack>
              <Card withBorder>
                <Title order={4} mb="md">
                  Summary
                </Title>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm">Total Items</Text>
                    <Text fw={500} size="sm">
                      {favorites.length}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">In Stock</Text>
                    <Text fw={500} size="sm">
                      {inStockCount}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">Total Value</Text>
                    <Text fw={700} size="sm">
                      ${totalValue.toFixed(2)}
                    </Text>
                  </Group>
                </Stack>
              </Card>

              <Card withBorder>
                <Title order={4} mb="md">
                  Quick Actions
                </Title>
                <Stack gap="xs">
                  <Button
                    fullWidth
                    leftSection={<IconPlus size={16} />}
                    onClick={() => {
                      setSelectedFavorites(favorites.map((f) => f.id));
                      openAddToRegistry();
                    }}
                    variant="light"
                  >
                    Add All to Registry
                  </Button>
                  <Button
                    fullWidth
                    href={"/registries" as any}
                    component={Link}
                    variant="light"
                  >
                    View My Registries
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Add to Registry Modal */}
      <Modal
        onClose={closeAddToRegistry}
        opened={addToRegistryOpened}
        title="Add to Registry"
      >
        <Stack>
          <Text c="dimmed" size="sm">
            Add {selectedFavorites.length} item
            {selectedFavorites.length !== 1 ? "s" : ""} to one of your
            registries
          </Text>

          <Select
            onChange={setSelectedRegistry}
            placeholder="Choose a registry"
            data={mockUserRegistries}
            label="Select Registry"
            value={selectedRegistry}
          />

          <Group justify="flex-end">
            <Button onClick={closeAddToRegistry} variant="subtle">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAddToRegistry}
              disabled={!selectedRegistry}
            >
              Add to Registry
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
