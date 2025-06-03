"use client";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  Menu,
  Modal,
  Select,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconHeart,
  IconHeartFilled,
  IconPlus,
  IconShare,
  IconShoppingCart,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { analytics } from "@repo/analytics";

// Mock user registries
const mockUserRegistries = [
  { label: "Wedding Registry", value: "1" },
  { label: "Birthday Wishlist", value: "2" },
  { label: "Housewarming Registry", value: "3" },
];

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params
      .then((p) => {
        setId(p.id);
        return p;
      })
      .catch((error) => {
        console.error("Error resolving params:", error);
      });
  }, [params]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [
    addToRegistryOpened,
    { close: closeAddToRegistry, open: openAddToRegistry },
  ] = useDisclosure(false);
  const [selectedRegistry, setSelectedRegistry] = useState<string | null>(null);

  // Mock product data
  const product = {
    id,
    name: `Product ${id}`,
    category: "Electronics",
    description:
      "This is a detailed product description. It provides comprehensive information about the product features, specifications, and benefits.",
    features: [
      "High-quality materials",
      "Advanced technology",
      "Long-lasting battery",
      "Ergonomic design",
    ],
    price: 299,
    rating: 4.5,
  };

  useEffect(() => {
    // Check if product is already favorited (mock implementation)
    const favorites = localStorage.getItem("favorites");
    if (favorites) {
      const favoriteIds = JSON.parse(favorites);
      setIsFavorited(favoriteIds.includes(id));
    }
  }, [id]);

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);

    // Update localStorage (mock implementation)
    const favorites = localStorage.getItem("favorites");
    const favoriteIds = favorites ? JSON.parse(favorites) : [];

    if (isFavorited) {
      const index = favoriteIds.indexOf(id);
      if (index > -1) favoriteIds.splice(index, 1);
    } else {
      favoriteIds.push(id);
    }

    localStorage.setItem("favorites", JSON.stringify(favoriteIds));

    // Track analytics
    analytics.capture(
      isFavorited ? "product_unfavorited" : "product_favorited",
      {
        productId: id,
        productName: product.name,
        productPrice: product.price,
        source: "pdp",
      },
    );
  };

  const handleAddToRegistry = () => {
    openAddToRegistry();
    analytics.capture("add_to_registry_started", {
      productId: id,
      source: "pdp",
    });
  };

  const handleConfirmAddToRegistry = () => {
    if (selectedRegistry) {
      analytics.capture("product_added_to_registry", {
        productId: id,
        registryId: selectedRegistry,
        source: "pdp",
      });
      closeAddToRegistry();
      setSelectedRegistry(null);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/products/${id}`;
    navigator.clipboard.writeText(shareUrl);

    analytics.capture("product_shared", {
      method: "copy_link",
      productId: id,
    });
  };

  return (
    <Container py="xl" size="lg">
      <Link href="/products">
        <Button mb="md" variant="subtle">
          ← Back to Products
        </Button>
      </Link>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Image
            alt={product.name}
            radius="md"
            src={`https://placehold.co/600x600?text=${encodeURIComponent(product.name)}`}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack>
            <Group align="flex-start" justify="space-between">
              <div>
                <Title order={1}>{product.name}</Title>
                <Badge color="pink" mt="xs" size="lg" variant="light">
                  {product.category}
                </Badge>
              </div>
              <Group>
                <ActionIcon
                  color={isFavorited ? "red" : "gray"}
                  onClick={handleToggleFavorite}
                  size="lg"
                  variant="light"
                >
                  {isFavorited ? (
                    <IconHeartFilled size={20} />
                  ) : (
                    <IconHeart size={20} />
                  )}
                </ActionIcon>
                <ActionIcon onClick={handleShare} size="lg" variant="light">
                  <IconShare size={20} />
                </ActionIcon>
              </Group>
            </Group>

            <Text c="dimmed" size="sm">
              Rating: {product.rating} ⭐ (123 reviews)
            </Text>

            <Text fw={700} size="xl">
              ${product.price}
            </Text>

            <Tabs defaultValue="description">
              <Tabs.List>
                <Tabs.Tab value="description">Description</Tabs.Tab>
                <Tabs.Tab value="features">Features</Tabs.Tab>
                <Tabs.Tab value="reviews">Reviews</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel pt="md" value="description">
                <Text>{product.description}</Text>
              </Tabs.Panel>

              <Tabs.Panel pt="md" value="features">
                <Stack gap="xs">
                  {product.features.map((feature) => (
                    <Text key={feature}>• {feature}</Text>
                  ))}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel pt="md" value="reviews">
                <Text c="dimmed">No reviews yet. Be the first to review!</Text>
              </Tabs.Panel>
            </Tabs>

            <Group mt="xl">
              <Button
                leftSection={<IconShoppingCart size={20} />}
                flex={1}
                size="lg"
              >
                Add to Cart
              </Button>
              <Menu width={200} shadow="md">
                <Menu.Target>
                  <Button
                    rightSection={<IconPlus size={20} />}
                    size="lg"
                    variant="outline"
                  >
                    Add to...
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconPlus size={16} />}
                    onClick={handleAddToRegistry}
                  >
                    Add to Registry
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      isFavorited ? (
                        <IconHeartFilled size={16} />
                      ) : (
                        <IconHeart size={16} />
                      )
                    }
                    onClick={handleToggleFavorite}
                  >
                    {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Add to Registry Modal */}
      <Modal
        onClose={closeAddToRegistry}
        opened={addToRegistryOpened}
        title="Add to Registry"
      >
        <Stack>
          <Card withBorder>
            <Group>
              <Image
                width={60}
                height={60}
                radius="sm"
                src={`https://placehold.co/60x60?text=${encodeURIComponent(product.name)}`}
              />
              <div>
                <Text fw={500}>{product.name}</Text>
                <Text c="dimmed" size="sm">
                  ${product.price}
                </Text>
              </div>
            </Group>
          </Card>

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
