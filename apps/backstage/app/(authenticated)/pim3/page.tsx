"use client";

import {
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBarcode,
  IconHistory,
  IconPackage,
  IconPhoto,
} from "@tabler/icons-react";
import Link from "next/link";

const modules = [
  {
    color: "blue",
    description: "Manage product catalog, SKUs, pricing, and metadata",
    href: "/pim3/products",
    icon: IconPackage,
    title: "Products",
  },
  {
    color: "green", 
    description: "Upload and organize product assets, images, and media",
    href: "/pim3/assets",
    icon: IconPhoto,
    title: "Digital Assets",
  },
  {
    color: "orange",
    description: "Manage barcodes, UPC codes, and product identifiers",
    href: "/pim3/barcodes", 
    icon: IconBarcode,
    title: "Barcodes",
  },
  {
    color: "violet",
    description: "View product scan history and analytics",
    href: "/pim3/scan-history",
    icon: IconHistory,
    title: "Scan History",
  },
];

export default function PIM3Page() {
  return (
    <Stack>
      <Group justify="space-between">
        <div>
          <Title order={1}>PIM3 - Product Information Management</Title>
          <Text c="dimmed" mt="xs">
            Comprehensive product catalog management with assets, barcodes, and analytics
          </Text>
        </div>
      </Group>

      <SimpleGrid cols={{ base: 1, lg: 4, sm: 2 }} spacing="lg">
        {modules.map((module) => (
          <Card key={module.title} withBorder h="100%">
            <Stack>
              <Group>
                <ThemeIcon color={module.color} size="xl" variant="light">
                  <module.icon size="1.5rem" />
                </ThemeIcon>
                <div>
                  <Text fw={600} size="lg">
                    {module.title}
                  </Text>
                </div>
              </Group>

              <Text c="dimmed" size="sm">
                {module.description}
              </Text>

              <Button
                href={module.href}
                color={module.color}
                component={Link}
                mt="auto"
                variant="light"
              >
                Open {module.title}
              </Button>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
