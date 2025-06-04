"use client";

import {
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  Modal,
  NumberInput,
  Progress,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconGift, IconShoppingCart } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { analytics } from "@repo/analytics-legacy";

// Mock registry data for public view
const mockPublicRegistry = {
  hideItemPrices: false,
  id: "1",
  name: "John & Jane's Wedding Registry",
  type: "wedding",
  allowContributions: true,
  coverImage: "https://placehold.co/1200x400?text=Wedding+Registry",
  description:
    "We're getting married on June 15, 2024! Thank you for celebrating with us.",
  eventDate: "2024-06-15",
  products: [
    {
      id: "1",
      name: "KitchenAid Stand Mixer",
      category: "Kitchen",
      image: "https://placehold.co/200x200?text=KitchenAid",
      notes: "Preferred color: Silver",
      price: 299.99,
      priority: "high",
      quantity: 1,
      quantityPurchased: 0,
    },
    {
      id: "3",
      name: "Egyptian Cotton Towel Set",
      category: "Bath",
      image: "https://placehold.co/200x200?text=Towels",
      price: 89.99,
      priority: "high",
      quantity: 2,
      quantityPurchased: 1,
    },
    {
      id: "4",
      name: "Instant Pot Duo",
      category: "Kitchen",
      image: "https://placehold.co/200x200?text=Instant+Pot",
      price: 89.99,
      priority: "medium",
      quantity: 1,
      quantityPurchased: 0,
    },
  ],
  thankYouMessage:
    "Thank you so much for your generous gift! We can't wait to celebrate with you.",
};

export default function PublicRegistryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [registrySlug, setRegistrySlug] = useState<string>("");
  const [registry] = useState(mockPublicRegistry);
  const [
    purchaseModalOpened,
    { close: closePurchaseModal, open: openPurchaseModal },
  ] = useDisclosure(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [contributionAmount, setContributionAmount] = useState<
    number | undefined
  >();

  useEffect(() => {
    params
      .then((p) => {
        setRegistrySlug(p.slug);
        return p;
      })
      .catch((error) => {
        console.error("Error resolving params:", error);
      });
  }, [params]);

  useEffect(() => {
    if (registrySlug) {
      // Track public registry view
      analytics.capture("public_registry_viewed", {
        registrySlug: registrySlug,
        registryType: registry.type,
      });
    }
  }, [registrySlug, registry.type]);

  const handlePurchaseClick = (product: any) => {
    setSelectedProduct(product);
    openPurchaseModal();

    analytics.capture("public_registry_purchase_started", {
      productId: product.id,
      productName: product.name,
      registrySlug: registrySlug,
    });
  };

  const handleConfirmPurchase = () => {
    if (selectedProduct && purchaserName && purchaserEmail) {
      analytics.capture("public_registry_purchase_completed", {
        amount: contributionAmount || selectedProduct.price,
        isContribution:
          !!contributionAmount && contributionAmount < selectedProduct.price,
        productId: selectedProduct.id,
        registrySlug: registrySlug,
      });

      // Show thank you message
      closePurchaseModal();
      // In a real app, this would update the database
    }
  };

  const totalItems = registry.products.reduce((sum, p) => sum + p.quantity, 0);
  const purchasedItems = registry.products.reduce(
    (sum, p) => sum + p.quantityPurchased,
    0,
  );
  const completionPercentage =
    totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;

  const daysUntilEvent = registry.eventDate
    ? Math.ceil(
        (new Date(registry.eventDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <Container py="xl" size="xl">
      <Stack gap="xl">
        {/* Header */}
        <Card
          withBorder
          style={{
            backgroundImage: `url(${registry.coverImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            position: "relative",
          }}
          h={300}
        >
          <div
            style={{
              background: "rgba(0, 0, 0, 0.6)",
              borderRadius: "var(--mantine-radius-default)",
              inset: 0,
              position: "absolute",
            }}
          />
          <Stack
            style={{ position: "relative", zIndex: 1 }}
            align="center"
            h="100%"
            justify="center"
          >
            <Badge size="lg" variant="filled">
              {registry.type} Registry
            </Badge>
            <Title order={1} c="white" ta="center">
              {registry.name}
            </Title>
            <Text c="white" maw={600} size="lg" ta="center">
              {registry.description}
            </Text>
            {daysUntilEvent !== null && daysUntilEvent > 0 && (
              <Badge color="pink" size="lg" variant="light">
                {daysUntilEvent} days until the big day!
              </Badge>
            )}
          </Stack>
        </Card>

        {/* Progress */}
        <Card withBorder>
          <Group justify="space-between" mb="md">
            <div>
              <Title order={3}>Registry Progress</Title>
              <Text c="dimmed" size="sm">
                {purchasedItems} of {totalItems} items purchased
              </Text>
            </div>
            <Text fw={700} size="xl">
              {completionPercentage}%
            </Text>
          </Group>
          <Progress radius="md" size="xl" value={completionPercentage} />
        </Card>

        {/* Products */}
        <div>
          <Title order={2} mb="lg">
            Gift Ideas
          </Title>
          <Grid>
            {registry.products.map((product) => {
              const isAvailable = product.quantityPurchased < product.quantity;

              return (
                <Grid.Col key={product.id} span={{ base: 12, md: 4, sm: 6 }}>
                  <Card
                    withBorder
                    style={{
                      height: "100%",
                      opacity: isAvailable ? 1 : 0.6,
                    }}
                    padding="lg"
                  >
                    <Card.Section>
                      <Image
                        alt={product.name}
                        height={200}
                        src={product.image}
                      />
                    </Card.Section>

                    <Stack gap="sm" mt="md">
                      <Group align="flex-start" justify="space-between">
                        <Text fw={500} lineClamp={2}>
                          {product.name}
                        </Text>
                        <Badge
                          color={
                            product.priority === "high"
                              ? "red"
                              : product.priority === "medium"
                                ? "orange"
                                : "green"
                          }
                          size="sm"
                        >
                          {product.priority}
                        </Badge>
                      </Group>

                      <Text c="dimmed" size="sm">
                        {product.category}
                      </Text>

                      {!registry.hideItemPrices && (
                        <Text fw={700} size="xl">
                          ${product.price}
                        </Text>
                      )}

                      <Group justify="space-between">
                        <Text size="sm">
                          {product.quantityPurchased} / {product.quantity}{" "}
                          purchased
                        </Text>
                        {product.quantityPurchased > 0 && (
                          <IconCheck
                            color="var(--mantine-color-green-6)"
                            size={20}
                          />
                        )}
                      </Group>

                      {product.notes && (
                        <Text c="dimmed" size="xs">
                          Note: {product.notes}
                        </Text>
                      )}

                      <Button
                        fullWidth
                        color={isAvailable ? "blue" : "green"}
                        leftSection={
                          isAvailable ? (
                            <IconShoppingCart size={18} />
                          ) : (
                            <IconCheck size={18} />
                          )
                        }
                        onClick={() => handlePurchaseClick(product)}
                        disabled={!isAvailable}
                      >
                        {isAvailable ? "Purchase" : "Already Purchased"}
                      </Button>
                    </Stack>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>
        </div>
      </Stack>

      {/* Purchase Modal */}
      <Modal
        onClose={closePurchaseModal}
        opened={purchaseModalOpened}
        size="md"
        title="Complete Your Purchase"
      >
        {selectedProduct && (
          <Stack>
            <Card withBorder>
              <Group>
                <Image
                  width={80}
                  height={80}
                  radius="sm"
                  src={selectedProduct.image}
                />
                <div style={{ flex: 1 }}>
                  <Text fw={500}>{selectedProduct.name}</Text>
                  <Text fw={700} size="lg">
                    ${selectedProduct.price}
                  </Text>
                </div>
              </Group>
            </Card>

            <TextInput
              onChange={(e) => setPurchaserName(e.target.value)}
              placeholder="Enter your name"
              label="Your Name"
              required
              value={purchaserName}
            />

            <TextInput
              onChange={(e) => setPurchaserEmail(e.target.value)}
              placeholder="your@email.com"
              label="Your Email"
              required
              type="email"
              value={purchaserEmail}
            />

            <Textarea
              onChange={(e) => setPurchaseMessage(e.target.value)}
              placeholder="Write a sweet message..."
              rows={3}
              label="Message to the Couple (optional)"
              value={purchaseMessage}
            />

            {registry.allowContributions && (
              <NumberInput
                description="You can contribute any amount toward this gift"
                leftSection="$"
                onChange={(value) => setContributionAmount(Number(value))}
                placeholder={`Full amount: $${selectedProduct.price}`}
                label="Contribution Amount (optional)"
                max={selectedProduct.price}
                min={1}
                value={contributionAmount}
              />
            )}

            <Text c="dimmed" size="sm" ta="center">
              <IconGift style={{ verticalAlign: "middle" }} size={16} /> Your
              purchase will be marked on the registry
            </Text>

            <Group justify="flex-end">
              <Button onClick={closePurchaseModal} variant="subtle">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPurchase}
                disabled={!purchaserName || !purchaserEmail}
              >
                Confirm Purchase
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
