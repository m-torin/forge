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
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconEdit,
  IconLink,
  IconPlus,
  IconSearch,
  IconShare,
  IconShoppingCart,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { analytics } from "@repo/analytics";
import { Autocomplete } from "@repo/design-system/algolia";

interface RegistryProduct {
  category: string;
  id: string;
  image: string;
  link?: string;
  name: string;
  notes?: string;
  price: number;
  priority: "high" | "medium" | "low";
  purchasedBy?: string[];
  quantity: number;
  quantityPurchased: number;
}

// Mock product suggestions for search
const _productSuggestions = [
  {
    id: "p1",
    name: "Instant Pot Duo 7-in-1",
    category: "Kitchen",
    image: "https://placehold.co/200x200?text=Instant+Pot",
    price: 89.99,
  },
  {
    id: "p2",
    name: "Dyson V11 Vacuum",
    category: "Home",
    image: "https://placehold.co/200x200?text=Dyson",
    price: 599.99,
  },
  {
    id: "p3",
    name: "Lodge Cast Iron Skillet",
    category: "Kitchen",
    image: "https://placehold.co/200x200?text=Skillet",
    price: 34.99,
  },
  {
    id: "p4",
    name: "Philips Hue Starter Kit",
    category: "Smart Home",
    image: "https://placehold.co/200x200?text=Hue",
    price: 199.99,
  },
  {
    id: "p5",
    name: "Ninja Foodi Blender",
    category: "Kitchen",
    image: "https://placehold.co/200x200?text=Ninja",
    price: 129.99,
  },
];

// Mock registry data
const mockRegistry = {
  id: "1",
  name: "Wedding Registry",
  type: "wedding",
  description: "John & Jane's Wedding - June 2024",
  eventDate: "2024-06-15",
  isPublic: true,
  products: [
    {
      id: "1",
      name: "KitchenAid Stand Mixer",
      category: "Kitchen",
      image: "https://placehold.co/200x200?text=KitchenAid",
      link: "https://example.com/kitchenaid",
      notes: "Preferred color: Silver",
      price: 299.99,
      priority: "high",
      quantity: 1,
      quantityPurchased: 0,
    },
    {
      id: "2",
      name: "Vitamix Blender",
      category: "Kitchen",
      image: "https://placehold.co/200x200?text=Vitamix",
      price: 449.99,
      priority: "medium",
      purchasedBy: ["Aunt Mary"],
      quantity: 1,
      quantityPurchased: 1,
    },
    {
      id: "3",
      name: "Egyptian Cotton Towel Set",
      category: "Bath",
      image: "https://placehold.co/200x200?text=Towels",
      price: 89.99,
      priority: "high",
      purchasedBy: ["Uncle Bob"],
      quantity: 2,
      quantityPurchased: 1,
    },
  ] as RegistryProduct[],
};

export default function RegistryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [registryId, setRegistryId] = useState<string>("");
  const [registry, setRegistry] = useState(mockRegistry);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPurchased, setFilterPurchased] = useState<
    "all" | "purchased" | "available"
  >("all");
  const [addModalOpened, { close: closeAddModal, open: openAddModal }] =
    useDisclosure(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    params
      .then((p) => {
        setRegistryId(p.id);
        return p;
      })
      .catch((error) => {
        console.error("Error resolving params:", error);
      });
  }, [params]);

  useEffect(() => {
    if (registryId) {
      // Track page view
      analytics.capture("registry_viewed", {
        registryId: registryId,
        registryType: registry.type,
      });
    }
  }, [registryId, registry.type]);

  const handleAddProduct = () => {
    openAddModal();
    analytics.capture("registry_add_product_started", {
      registryId: registryId,
    });
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
  };

  const handleConfirmAdd = () => {
    if (selectedProduct) {
      const newProduct: RegistryProduct = {
        ...selectedProduct,
        notes,
        priority,
        quantity,
        quantityPurchased: 0,
      };

      setRegistry({
        ...registry,
        products: [...registry.products, newProduct],
      });

      analytics.capture("registry_product_added", {
        priority,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        registryId: registryId,
      });

      closeAddModal();
      setSelectedProduct(null);
      setQuantity(1);
      setPriority("medium");
      setNotes("");
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setRegistry({
      ...registry,
      products: registry.products.filter((p) => p.id !== productId),
    });

    analytics.capture("registry_product_removed", {
      productId,
      registryId: registryId,
    });
  };

  const handleMarkAsPurchased = (productId: string) => {
    setRegistry({
      ...registry,
      products: registry.products.map((p) =>
        p.id === productId
          ? {
              ...p,
              purchasedBy: [...(p.purchasedBy || []), "Current User"],
              quantityPurchased:
                p.quantityPurchased < p.quantity
                  ? p.quantityPurchased + 1
                  : p.quantityPurchased,
            }
          : p,
      ),
    });

    analytics.capture("registry_product_purchased", {
      productId,
      registryId: registryId,
    });
  };

  const handleShareRegistry = () => {
    const shareUrl = `${window.location.origin}/registries/public/${registryId}`;
    navigator.clipboard.writeText(shareUrl);

    analytics.capture("registry_shared", {
      method: "copy_link",
      registryId: registryId,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  const filteredProducts = registry.products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterPurchased === "all" ||
      (filterPurchased === "purchased" &&
        product.quantityPurchased >= product.quantity) ||
      (filterPurchased === "available" &&
        product.quantityPurchased < product.quantity);

    return matchesSearch && matchesFilter;
  });

  const totalItems = registry.products.reduce((sum, p) => sum + p.quantity, 0);
  const purchasedItems = registry.products.reduce(
    (sum, p) => sum + p.quantityPurchased,
    0,
  );
  const totalValue = registry.products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0,
  );
  const purchasedValue = registry.products.reduce(
    (sum, p) => sum + p.price * p.quantityPurchased,
    0,
  );

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        <Group align="flex-start" justify="space-between">
          <div>
            <Link href="/registries">
              <Button mb="md" variant="subtle">
                ← Back to Registries
              </Button>
            </Link>
            <Title order={1}>{registry.name}</Title>
            <Text c="dimmed">{registry.description}</Text>
            {registry.eventDate && (
              <Text mt="xs" size="sm">
                Event Date: {new Date(registry.eventDate).toLocaleDateString()}
              </Text>
            )}
          </div>
          <Group>
            <Button
              leftSection={<IconShare size={20} />}
              onClick={handleShareRegistry}
              variant="light"
            >
              Share
            </Button>
            <Button
              href={`/registries/${registryId}/edit` as any}
              component={Link}
              leftSection={<IconEdit size={20} />}
              variant="light"
            >
              Edit
            </Button>
          </Group>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder>
              <Text c="dimmed" fw={700} size="sm" tt="uppercase">
                Total Items
              </Text>
              <Text fw={700} size="xl">
                {totalItems}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder>
              <Text c="dimmed" fw={700} size="sm" tt="uppercase">
                Purchased
              </Text>
              <Text fw={700} size="xl">
                {purchasedItems}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder>
              <Text c="dimmed" fw={700} size="sm" tt="uppercase">
                Total Value
              </Text>
              <Text fw={700} size="xl">
                ${totalValue.toFixed(2)}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder>
              <Text c="dimmed" fw={700} size="sm" tt="uppercase">
                Remaining
              </Text>
              <Text fw={700} size="xl">
                ${(totalValue - purchasedValue).toFixed(2)}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        <Group justify="space-between">
          <Group>
            <TextInput
              leftSection={<IconSearch size={18} />}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              style={{ width: 300 }}
              value={searchQuery}
            />
            <Button.Group>
              <Button
                onClick={() => setFilterPurchased("all")}
                variant={filterPurchased === "all" ? "filled" : "light"}
              >
                All
              </Button>
              <Button
                onClick={() => setFilterPurchased("available")}
                variant={filterPurchased === "available" ? "filled" : "light"}
              >
                Available
              </Button>
              <Button
                onClick={() => setFilterPurchased("purchased")}
                variant={filterPurchased === "purchased" ? "filled" : "light"}
              >
                Purchased
              </Button>
            </Button.Group>
          </Group>
          <Button
            leftSection={<IconPlus size={20} />}
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        </Group>

        <Grid>
          {filteredProducts.map((product) => {
            const isPurchased = product.quantityPurchased >= product.quantity;

            return (
              <Grid.Col key={product.id} span={{ base: 12, lg: 4, sm: 6 }}>
                <Card
                  withBorder
                  style={{ opacity: isPurchased ? 0.7 : 1 }}
                  padding="lg"
                >
                  <Card.Section>
                    <Image
                      alt={product.name}
                      height={200}
                      src={product.image}
                    />
                  </Card.Section>

                  <Group justify="space-between" mb="xs" mt="md">
                    <Text fw={500}>{product.name}</Text>
                    <Badge color={getPriorityColor(product.priority)} size="sm">
                      {product.priority} priority
                    </Badge>
                  </Group>

                  <Text c="dimmed" size="sm">
                    {product.category}
                  </Text>

                  <Group justify="space-between" mt="xs">
                    <Text fw={700} size="xl">
                      ${product.price}
                    </Text>
                    <Text size="sm">
                      {product.quantityPurchased} / {product.quantity} purchased
                    </Text>
                  </Group>

                  {product.notes && (
                    <Text c="dimmed" mt="xs" size="sm">
                      Note: {product.notes}
                    </Text>
                  )}

                  {product.purchasedBy && product.purchasedBy.length > 0 && (
                    <Text c="dimmed" mt="xs" size="xs">
                      Purchased by: {product.purchasedBy.join(", ")}
                    </Text>
                  )}

                  <Group gap="xs" mt="md">
                    {!isPurchased && (
                      <Button
                        fullWidth
                        leftSection={<IconShoppingCart size={16} />}
                        onClick={() => handleMarkAsPurchased(product.id)}
                      >
                        Mark as Bought
                      </Button>
                    )}
                    {product.link && (
                      <ActionIcon
                        href={product.link}
                        component="a"
                        size="lg"
                        target="_blank"
                        variant="light"
                      >
                        <IconLink size={18} />
                      </ActionIcon>
                    )}
                    <ActionIcon
                      color="red"
                      onClick={() => handleRemoveProduct(product.id)}
                      size="lg"
                      variant="light"
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      </Stack>

      <Modal
        onClose={closeAddModal}
        opened={addModalOpened}
        size="lg"
        title="Add Product to Registry"
      >
        <Stack>
          <Autocomplete
            config={{
              apiKey: "demo",
              appId: "demo",
              indexName: "products",
            }}
            onSelect={handleProductSelect}
            placeholder="Search for products..."
          />

          {selectedProduct && (
            <Card withBorder>
              <Group>
                <Image
                  width={60}
                  height={60}
                  radius="sm"
                  src={selectedProduct.image}
                />
                <div style={{ flex: 1 }}>
                  <Text fw={500}>{selectedProduct.name}</Text>
                  <Text c="dimmed" size="sm">
                    ${selectedProduct.price}
                  </Text>
                </div>
              </Group>
            </Card>
          )}

          <NumberInput
            onChange={(value) => setQuantity(Number(value) || 1)}
            label="Quantity"
            max={10}
            min={1}
            value={quantity}
          />

          <Select
            onChange={(value) => setPriority(value as any)}
            data={[
              { label: "High Priority", value: "high" },
              { label: "Medium Priority", value: "medium" },
              { label: "Low Priority", value: "low" },
            ]}
            label="Priority"
            value={priority}
          />

          <TextInput
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Preferred color, size, etc."
            label="Notes (optional)"
            value={notes}
          />

          <Group justify="flex-end">
            <Button onClick={closeAddModal} variant="subtle">
              Cancel
            </Button>
            <Button onClick={handleConfirmAdd} disabled={!selectedProduct}>
              Add to Registry
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
