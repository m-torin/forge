import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";

const mockProducts = [
  {
    id: "1",
    name: "Wireless Headphones",
    category: "Electronics",
    price: 299,
    rating: 4.5,
  },
  {
    id: "2",
    name: "Running Shoes",
    category: "Clothing",
    price: 129,
    rating: 4.2,
  },
  {
    id: "3",
    name: "Smart Watch",
    category: "Electronics",
    price: 399,
    rating: 4.7,
  },
  {
    id: "4",
    name: "Coffee Maker",
    category: "Home & Garden",
    price: 89,
    rating: 4.3,
  },
  { id: "5", name: "Yoga Mat", category: "Sports", price: 39, rating: 4.6 },
  {
    id: "6",
    name: "Laptop Stand",
    category: "Electronics",
    price: 59,
    rating: 4.4,
  },
];

export default function ProductResults() {
  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Products</Title>
        <Text c="dimmed">Showing {mockProducts.length} results</Text>
      </Group>

      <Grid>
        {mockProducts.map((product) => (
          <Grid.Col key={product.id} span={{ base: 12, md: 4, sm: 6 }}>
            <Card shadow="sm" withBorder padding="lg" radius="md">
              <Card.Section>
                <Image
                  alt={product.name}
                  height={200}
                  src={`https://placehold.co/300x200?text=${encodeURIComponent(product.name)}`}
                />
              </Card.Section>

              <Group justify="space-between" mb="xs" mt="md">
                <Text fw={500}>{product.name}</Text>
                <Badge color="pink" variant="light">
                  {product.category}
                </Badge>
              </Group>

              <Text c="dimmed" size="sm">
                Rating: {product.rating} ⭐
              </Text>

              <Text fw={700} mt="md" size="xl">
                ${product.price}
              </Text>

              <Button
                fullWidth
                href={`/products/${product.id}` as any}
                component={Link}
                mt="md"
                radius="md"
                variant="light"
              >
                View Details
              </Button>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
