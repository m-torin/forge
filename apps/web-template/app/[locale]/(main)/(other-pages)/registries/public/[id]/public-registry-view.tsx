'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Button,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Checkbox,
  Stack,
  Group,
  Badge,
  Avatar,
  Divider,
  ActionIcon,
  Tooltip,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { z } from 'zod';
import { format } from 'date-fns';
import { IconGift, IconShare, IconCalendar, IconCheck } from '@tabler/icons-react';
import { recordItemPurchase } from '@/actions/registries';
// import type { RegistryWithRelations } from '@repo/database/prisma/src/actions/registry';
type RegistryWithRelations = any; // Temporary fix

const purchaseFormSchema = z.object({
  quantity: z.number().min(1),
  isGift: z.boolean(),
  giftMessage: z.string().optional(),
  giftWrapped: z.boolean(),
  purchaserName: z.string().min(1, 'Name is required'),
  purchaserEmail: z.string().email('Valid email is required'),
  orderNumber: z.string().optional(),
});

interface PublicRegistryViewProps {
  registry: RegistryWithRelations;
}

export default function PublicRegistryView({ registry }: PublicRegistryViewProps) {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [purchaseModalOpened, { open: openPurchaseModal, close: closePurchaseModal }] =
    useDisclosure(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    validate: zodResolver(purchaseFormSchema),
    initialValues: {
      quantity: 1,
      isGift: true,
      giftMessage: '',
      giftWrapped: false,
      purchaserName: '',
      purchaserEmail: '',
      orderNumber: '',
    },
  });

  const handlePurchase = (item: any) => {
    setSelectedItem(item);
    form.reset();
    form.setFieldValue('quantity', Math.min(1, item.quantity - (item.purchases?.length || 0)));
    openPurchaseModal();
  };

  const handleSubmitPurchase = async (values: z.infer<typeof purchaseFormSchema>) => {
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      const result = await recordItemPurchase({
        registryItemId: selectedItem.id,
        quantity: values.quantity,
        isGift: values.isGift,
        giftMessage: values.giftMessage || undefined,
        // giftWrapped: values.giftWrapped, // Field not available in action
        orderNumber: values.orderNumber || undefined,
        purchaserId: 'guest', // This would need to be handled properly with auth
        notes: `Purchase by ${values.purchaserName} (${values.purchaserEmail})`,
      });

      if (result.success) {
        notifications.show({
          title: 'Purchase Recorded',
          message: 'Thank you for your purchase! The registry owner will be notified.',
          color: 'green',
          icon: <IconCheck />,
        });
        closePurchaseModal();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to record purchase',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Something went wrong. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: registry.title,
          text: `Check out ${registry.createdByUser?.name || 'this'} registry: ${registry.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      notifications.show({
        title: 'Link copied!',
        message: 'Registry link has been copied to your clipboard',
        color: 'green',
      });
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      WEDDING: 'pink',
      BABY: 'blue',
      BIRTHDAY: 'violet',
      HOLIDAY: 'green',
      WISHLIST: 'gray',
      GIFT: 'orange',
      OTHER: 'cyan',
    };
    return colors[type] || 'gray';
  };

  const availableItems = registry.items.filter((item: any) => {
    const totalPurchased = item.purchases.reduce((sum: any, p: any) => sum + p.quantity, 0);
    return totalPurchased < item.quantity;
  });

  const purchasedItems = registry.items.filter((item: any) => {
    const totalPurchased = item.purchases.reduce((sum: any, p: any) => sum + p.quantity, 0);
    return totalPurchased >= item.quantity;
  });

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Group justify="space-between" align="flex-start">
            <div>
              <Badge color={getTypeColor(registry.type)} size="lg" mb="sm">
                {registry.type.replace('_', ' ')}
              </Badge>
              <Title order={1} mb="sm">
                {registry.title}
              </Title>
              {registry.description && (
                <Text size="lg" c="dimmed" mb="md">
                  {registry.description}
                </Text>
              )}

              <Group gap="md">
                {registry.createdByUser && (
                  <Group gap="xs">
                    <Avatar src={registry.createdByUser.image} size="sm" radius="xl">
                      {registry.createdByUser.name.charAt(0)}
                    </Avatar>
                    <Text size="sm">by {registry.createdByUser.name}</Text>
                  </Group>
                )}

                {registry.eventDate && (
                  <Group gap="xs">
                    <IconCalendar size={16} />
                    <Text size="sm">Event: {format(new Date(registry.eventDate), 'PPP')}</Text>
                  </Group>
                )}
              </Group>
            </div>

            <Tooltip label="Share registry">
              <ActionIcon variant="default" size="lg" onClick={handleShare}>
                <IconShare size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </div>

        <Divider />

        {/* Summary Stats */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card>
              <Text size="sm" c="dimmed" mb="xs">
                Total Items
              </Text>
              <Text size="xl" fw={700}>
                {registry.items.length}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card>
              <Text size="sm" c="dimmed" mb="xs">
                Available
              </Text>
              <Text size="xl" fw={700} c="green">
                {availableItems.length}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card>
              <Text size="sm" c="dimmed" mb="xs">
                Purchased
              </Text>
              <Text size="xl" fw={700} c="dimmed">
                {purchasedItems.length}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Available Items */}
        {availableItems.length > 0 && (
          <>
            <Title order={2}>Available Items</Title>
            <Grid>
              {availableItems.map((item: any) => {
                const totalPurchased = item.purchases.reduce(
                  (sum: any, p: any) => sum + p.quantity,
                  0,
                );
                const remaining = item.quantity - totalPurchased;

                return (
                  <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                      <Stack gap="sm" h="100%">
                        <div style={{ flex: 1 }}>
                          <Text fw={500} size="lg" mb="xs">
                            {item.product?.name || item.collection?.name || 'Unknown Item'}
                          </Text>

                          {item.product?.price && (
                            <Text size="xl" fw={700} c="blue" mb="xs">
                              ${item.product.price}
                            </Text>
                          )}

                          {item.notes && (
                            <Text size="sm" c="dimmed" mb="xs">
                              {item.notes}
                            </Text>
                          )}

                          <Group gap="xs">
                            <Badge variant="light" color={item.priority > 5 ? 'red' : 'gray'}>
                              Priority: {item.priority}/10
                            </Badge>
                            <Badge variant="light" color="blue">
                              {remaining} of {item.quantity} available
                            </Badge>
                          </Group>
                        </div>

                        <Button
                          leftSection={<IconGift size={16} />}
                          onClick={() => handlePurchase(item)}
                          disabled={remaining <= 0}
                          fullWidth
                        >
                          Mark as Purchased
                        </Button>
                      </Stack>
                    </Card>
                  </Grid.Col>
                );
              })}
            </Grid>
          </>
        )}

        {/* Purchased Items */}
        {purchasedItems.length > 0 && (
          <>
            <Title order={2} c="dimmed">
              Already Purchased
            </Title>
            <Grid>
              {purchasedItems.map((item: any) => (
                <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder opacity={0.6}>
                    <Stack gap="sm">
                      <Text fw={500} size="lg" td="line-through">
                        {item.product?.name || item.collection?.name || 'Unknown Item'}
                      </Text>

                      <Group gap="xs">
                        <Badge variant="filled" color="gray">
                          Purchased
                        </Badge>
                        <Badge variant="light" color="gray">
                          {item.purchases.length} buyer(s)
                        </Badge>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </>
        )}

        {registry.items.length === 0 && (
          <Alert color="blue" title="Empty Registry">
            This registry doesn't have any items yet. Check back later!
          </Alert>
        )}
      </Stack>

      {/* Purchase Modal */}
      <Modal
        opened={purchaseModalOpened}
        onClose={closePurchaseModal}
        title={`Mark as Purchased: ${selectedItem?.product?.name || selectedItem?.collection?.name}`}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmitPurchase)}>
          <Stack>
            <TextInput
              label="Your Name"
              placeholder="John Doe"
              required
              {...form.getInputProps('purchaserName')}
            />

            <TextInput
              label="Your Email"
              placeholder="john@example.com"
              required
              {...form.getInputProps('purchaserEmail')}
            />

            <NumberInput
              label="Quantity"
              min={1}
              max={
                selectedItem
                  ? selectedItem.quantity -
                    (selectedItem.purchases?.reduce((sum: number, p: any) => sum + p.quantity, 0) ||
                      0)
                  : 1
              }
              required
              {...form.getInputProps('quantity')}
            />

            <Checkbox
              label="This is a gift"
              {...form.getInputProps('isGift', { type: 'checkbox' })}
            />

            {form.values.isGift && (
              <>
                <Textarea
                  label="Gift Message (optional)"
                  placeholder="Congratulations on your special day!"
                  rows={3}
                  {...form.getInputProps('giftMessage')}
                />

                <Checkbox
                  label="Gift wrapped"
                  {...form.getInputProps('giftWrapped', { type: 'checkbox' })}
                />
              </>
            )}

            <TextInput
              label="Order Number (optional)"
              placeholder="If you've already purchased this item"
              {...form.getInputProps('orderNumber')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={closePurchaseModal}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Confirm Purchase
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
