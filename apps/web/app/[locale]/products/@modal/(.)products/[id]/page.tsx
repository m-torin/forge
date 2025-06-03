"use client";

import {
  Badge,
  Button,
  Group,
  Image,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface InterceptedProductPageProps {
  params: Promise<{ id: string }>;
}

export default function InterceptedProductPage({
  params,
}: InterceptedProductPageProps) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params
      .then((resolvedParams) => {
        setId(resolvedParams.id);
        return resolvedParams;
      })
      .catch((error) => {
        console.error("Error resolving params:", error);
      });
  }, [params]);

  if (!id) {
    return null; // or loading state
  }

  // Mock product data
  const product = {
    id,
    name: `Product ${id}`,
    category: "Electronics",
    description:
      'Quick view of the product. Click "View Full Details" for more information.',
    price: 299,
    rating: 4.5,
  };

  return (
    <Modal
      onClose={() => router.back()}
      opened={true}
      centered
      size="lg"
      title="Quick View"
    >
      <Stack>
        <Image
          alt={product.name}
          height={300}
          radius="md"
          src={`https://placehold.co/400x300?text=${encodeURIComponent(product.name)}`}
        />

        <Group justify="space-between">
          <Title order={2}>{product.name}</Title>
          <Badge color="pink" variant="light">
            {product.category}
          </Badge>
        </Group>

        <Text c="dimmed" size="sm">
          Rating: {product.rating} ⭐
        </Text>

        <Text>{product.description}</Text>

        <Text fw={700} size="xl">
          ${product.price}
        </Text>

        <Group>
          <Button flex={1}>Add to Cart</Button>
          <Button
            onClick={() => {
              router.push(`/products/${id}` as any);
            }}
            variant="outline"
          >
            View Full Details
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
