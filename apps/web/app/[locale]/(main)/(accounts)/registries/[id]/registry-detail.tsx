'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Text,
  Badge,
  Group,
  ActionIcon,
  Modal,
  Select,
  NumberInput,
  Textarea,
  Stack,
  Title,
  Divider,
  Switch,
  TextInput,
  Tabs,
  Table,
  Avatar,
  Menu,
  Slider,
  Tooltip,
  Progress,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconTrash,
  IconShare,
  IconEdit,
  IconUsers,
  IconShoppingCart,
  IconGift,
  IconMail,
  IconDots,
  IconUserPlus,
  IconLock,
  IconWorld,
  IconPackage,
} from '@tabler/icons-react';
import {
  addRegistryItem,
  removeRegistryItem,
  deleteRegistry,
  updateRegistryPrivacy,
  updateRegistryUserRole,
  removeRegistryUser,
  updateRegistryItem,
  sendThankYouMessage,
} from '@/actions/registries';
import Link from 'next/link';
import { format } from 'date-fns';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';

const shareFormSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum(['VIEWER', 'EDITOR']),
  message: z.string().optional(),
});

const thankYouFormSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

interface RegistryDetailProps {
  registry: any;
  products: any[];
  collections: any[];
  locale: string;
  userId: string;
}

export function RegistryDetail({
  registry,
  products,
  collections,
  locale,
  userId,
}: RegistryDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
  const [shareModalOpened, { open: openShareModal, close: closeShareModal }] = useDisclosure(false);
  const [thankYouModalOpened, { open: openThankYouModal, close: closeThankYouModal }] =
    useDisclosure(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [itemType, setItemType] = useState<'product' | 'collection'>('product');
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState(5);
  const [notes, setNotes] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('items');

  const shareForm = useForm({
    validate: zodResolver(shareFormSchema),
    initialValues: {
      email: '',
      role: 'VIEWER' as const,
      message: '',
    },
  });

  const thankYouForm = useForm({
    validate: zodResolver(thankYouFormSchema),
    initialValues: {
      message: '',
    },
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this registry?')) return;

    setIsDeleting(true);
    try {
      const result = await deleteRegistry(registry.id);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Registry deleted successfully',
          color: 'green',
        });
        router.push(`/${locale}/registries`);
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete registry',
          color: 'red',
        });
      }
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'An error occurred',
        color: 'red',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddItem = async () => {
    if (itemType === 'product' && !selectedProduct) return;
    if (itemType === 'collection' && !selectedCollection) return;

    setIsAddingItem(true);
    try {
      const result = await addRegistryItem({
        registryId: registry.id,
        productId: itemType === 'product' ? selectedProduct || undefined : undefined,
        collectionId: itemType === 'collection' ? selectedCollection || undefined : undefined,
        quantity,
        notes,
        priority,
      });

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Item added to registry',
          color: 'green',
        });
        closeAddModal();
        setSelectedProduct(null);
        setSelectedCollection(null);
        setQuantity(1);
        setPriority(5);
        setNotes('');
        router.refresh();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to add item',
          color: 'red',
        });
      }
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'An error occurred',
        color: 'red',
      });
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleUpdatePrivacy = async (isPublic: boolean) => {
    setIsUpdatingPrivacy(true);
    try {
      const result = await updateRegistryPrivacy(registry.id, isPublic);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: `Registry is now ${isPublic ? 'public' : 'private'}`,
          color: 'green',
        });
        router.refresh();
      }
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update privacy',
        color: 'red',
      });
    } finally {
      setIsUpdatingPrivacy(false);
    }
  };

  const handleShare = async (values: z.infer<typeof shareFormSchema>) => {
    try {
      const result = await updateRegistryUserRole({
        registryId: registry.id,
        userId: values.email, // This would need to be resolved to actual user ID
        role: values.role,
      });

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Registry shared successfully',
          color: 'green',
        });
        closeShareModal();
        shareForm.reset();
        router.refresh();
      }
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to share registry',
        color: 'red',
      });
    }
  };

  const handleUpdateUserRole = async (userId: string, role: 'VIEWER' | 'EDITOR' | 'OWNER') => {
    try {
      const result = await updateRegistryUserRole({
        registryId: registry.id,
        userId,
        role,
      });

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'User role updated',
          color: 'green',
        });
        router.refresh();
      }
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update role',
        color: 'red',
      });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const result = await removeRegistryUser({ registryId: registry.id, userId });
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'User removed from registry',
          color: 'green',
        });
        router.refresh();
      }
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to remove user',
        color: 'red',
      });
    }
  };

  const handleUpdateItemPriority = async (itemId: string, newPriority: number) => {
    try {
      const result = await updateRegistryItem(itemId, {
        priority: newPriority,
      });

      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      logger.error('Failed to update priority', error);
    }
  };

  const handleSendThankYou = async (values: z.infer<typeof thankYouFormSchema>) => {
    if (!selectedPurchase) return;

    try {
      const result = await sendThankYouMessage({
        registryId: registry.id,
        itemId: selectedPurchase.id,
        message: values.message,
      });

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Thank you message sent',
          color: 'green',
        });
        closeThankYouModal();
        thankYouForm.reset();
        router.refresh();
      }
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to send message',
        color: 'red',
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const result = await removeRegistryItem(itemId);
      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Item removed from registry',
          color: 'green',
        });
        router.refresh();
      }
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to remove item',
        color: 'red',
      });
    }
  };

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${locale}/registries/public/${registry.id}`
      : '';

  const isOwner =
    registry.createdByUserId === userId ||
    registry.users?.some((u: any) => u.userId === userId && u.role === 'OWNER');
  const canEdit =
    isOwner || registry.users?.some((u: any) => u.userId === userId && u.role === 'EDITOR');

  // Calculate statistics
  const totalItems = registry.items?.length || 0;
  const purchasedItems =
    registry.items?.filter((item: any) => {
      const totalPurchased =
        item.purchases?.reduce((sum: number, p: any) => sum + p.quantity, 0) || 0;
      return totalPurchased >= item.quantity;
    }).length || 0;
  const completionRate = totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;

  return (
    <Stack gap="xl">
      {/* Header */}
      <div>
        <Group justify="space-between" align="flex-start">
          <div style={{ flex: 1 }}>
            <Group gap="sm" mb="xs">
              <Badge size="lg" variant="light">
                {registry.type.replace('_', ' ')}
              </Badge>
              {registry.isPublic ? (
                <Badge
                  size="lg"
                  variant="light"
                  color="green"
                  leftSection={<IconWorld size={14} />}
                >
                  Public
                </Badge>
              ) : (
                <Badge size="lg" variant="light" color="gray" leftSection={<IconLock size={14} />}>
                  Private
                </Badge>
              )}
            </Group>
            <Title order={1} mb="sm">
              {registry.title}
            </Title>
            {registry.description && (
              <Text size="lg" c="dimmed" mb="md">
                {registry.description}
              </Text>
            )}
            <Group gap="xl">
              {registry.eventDate && (
                <Text size="sm" c="dimmed">
                  Event Date: {format(new Date(registry.eventDate), 'PPP')}
                </Text>
              )}
              <Text size="sm" c="dimmed">
                Created: {format(new Date(registry.createdAt), 'PP')}
              </Text>
            </Group>
          </div>

          {canEdit && (
            <Group>
              <Tooltip label="Share registry">
                <ActionIcon variant="default" size="lg" onClick={openShareModal}>
                  <IconUserPlus size={20} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Copy public link">
                <ActionIcon
                  variant="default"
                  size="lg"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    notifications.show({
                      title: 'Link copied',
                      message: 'Registry link copied to clipboard',
                      color: 'green',
                    });
                  }}
                >
                  <IconShare size={20} />
                </ActionIcon>
              </Tooltip>
              {isOwner && (
                <>
                  <Link href={`/${locale}/registries/${registry.id}/edit`}>
                    <ActionIcon variant="default" size="lg">
                      <IconEdit size={20} />
                    </ActionIcon>
                  </Link>
                  <ActionIcon
                    variant="default"
                    size="lg"
                    color="red"
                    onClick={handleDelete}
                    loading={isDeleting}
                  >
                    <IconTrash size={20} />
                  </ActionIcon>
                </>
              )}
            </Group>
          )}
        </Group>

        {/* Privacy Toggle */}
        {isOwner && (
          <Card mt="md" withBorder>
            <Group justify="space-between">
              <div>
                <Text fw={500}>Registry Privacy</Text>
                <Text size="sm" c="dimmed">
                  {registry.isPublic
                    ? 'Anyone with the link can view this registry'
                    : 'Only you and invited users can view this registry'}
                </Text>
              </div>
              <Switch
                size="lg"
                checked={registry.isPublic}
                onChange={(event) => handleUpdatePrivacy(event.currentTarget.checked)}
                disabled={isUpdatingPrivacy}
              />
            </Group>
          </Card>
        )}
      </div>

      {/* Statistics */}
      <Card withBorder>
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed">
              Total Items
            </Text>
            <Text size="xl" fw={700}>
              {totalItems}
            </Text>
          </div>
          <Divider orientation="vertical" />
          <div>
            <Text size="sm" c="dimmed">
              Purchased
            </Text>
            <Text size="xl" fw={700} c="green">
              {purchasedItems}
            </Text>
          </div>
          <Divider orientation="vertical" />
          <div>
            <Text size="sm" c="dimmed">
              Completion
            </Text>
            <Text size="xl" fw={700}>
              {completionRate.toFixed(0)}%
            </Text>
            <Progress value={completionRate} size="sm" mt="xs" />
          </div>
        </Group>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="items" leftSection={<IconGift size={16} />}>
            Items ({registry.items?.length || 0})
          </Tabs.Tab>
          <Tabs.Tab value="purchases" leftSection={<IconShoppingCart size={16} />}>
            Purchases
          </Tabs.Tab>
          {canEdit && (
            <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
              Shared With ({registry.users?.length || 0})
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="items" pt="md">
          {canEdit && (
            <Button leftSection={<IconPlus size={16} />} onClick={openAddModal} mb="md">
              Add Item
            </Button>
          )}

          {registry.items?.length === 0 ? (
            <Card withBorder p="xl" className="text-center">
              <IconGift size={48} className="mx-auto mb-4 text-gray-400" />
              <Text c="dimmed">No items in this registry yet.</Text>
              {canEdit && (
                <Button variant="light" mt="md" onClick={openAddModal}>
                  Add your first item
                </Button>
              )}
            </Card>
          ) : (
            <Stack gap="md">
              {registry.items.map((item: any) => {
                const totalPurchased =
                  item.purchases?.reduce((sum: number, p: any) => sum + p.quantity, 0) || 0;
                const isPurchased = totalPurchased >= item.quantity;

                return (
                  <Card key={item.id} withBorder p="lg">
                    <Group justify="space-between" align="flex-start">
                      <div style={{ flex: 1 }}>
                        <Group justify="space-between" mb="xs">
                          <Text fw={600} size="lg">
                            {item.product?.name || item.collection?.name || 'Unknown Item'}
                          </Text>
                          {canEdit && (
                            <Menu position="bottom-end">
                              <Menu.Target>
                                <ActionIcon variant="subtle">
                                  <IconDots size={18} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item
                                  color="red"
                                  leftSection={<IconTrash size={16} />}
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  Remove
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          )}
                        </Group>

                        <Group gap="xs" mb="sm">
                          <Badge variant="light" color={isPurchased ? 'green' : 'blue'}>
                            {isPurchased
                              ? 'Purchased'
                              : `${totalPurchased}/${item.quantity} purchased`}
                          </Badge>
                          <Badge
                            variant="light"
                            color={
                              item.priority > 7 ? 'red' : item.priority > 4 ? 'yellow' : 'gray'
                            }
                          >
                            Priority: {item.priority}/10
                          </Badge>
                          {item.product?.price && (
                            <Badge variant="light" color="indigo">
                              ${item.product.price}
                            </Badge>
                          )}
                        </Group>

                        {item.notes && (
                          <Text size="sm" c="dimmed" mb="sm">
                            {item.notes}
                          </Text>
                        )}

                        {canEdit && (
                          <div>
                            <Text size="xs" c="dimmed" mb={4}>
                              Priority
                            </Text>
                            <Slider
                              value={item.priority}
                              onChange={(value) => handleUpdateItemPriority(item.id, value)}
                              min={0}
                              max={10}
                              marks={[
                                { value: 0, label: '0' },
                                { value: 5, label: '5' },
                                { value: 10, label: '10' },
                              ]}
                              style={{ maxWidth: 200 }}
                            />
                          </div>
                        )}
                      </div>
                    </Group>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="purchases" pt="md">
          {registry.items?.some((item: any) => item.purchases?.length > 0) ? (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item</Table.Th>
                  <Table.Th>Purchaser</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Status</Table.Th>
                  {isOwner && <Table.Th>Actions</Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {registry.items.flatMap((item: any) =>
                  item.purchases?.map((purchase: any) => (
                    <Table.Tr key={purchase.id}>
                      <Table.Td>{item.product?.name || item.collection?.name}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Avatar size="sm" radius="xl">
                            {purchase.purchaser?.name?.charAt(0) || '?'}
                          </Avatar>
                          <div>
                            <Text size="sm">{purchase.purchaser?.name || 'Unknown'}</Text>
                            <Text size="xs" c="dimmed">
                              {purchase.purchaser?.email}
                            </Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>{format(new Date(purchase.purchaseDate), 'PP')}</Table.Td>
                      <Table.Td>{purchase.quantity}</Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color={
                            purchase.status === 'DELIVERED'
                              ? 'green'
                              : purchase.status === 'SHIPPED'
                                ? 'blue'
                                : purchase.status === 'CONFIRMED'
                                  ? 'cyan'
                                  : purchase.status === 'CANCELLED'
                                    ? 'red'
                                    : 'gray'
                          }
                        >
                          {purchase.status}
                        </Badge>
                      </Table.Td>
                      {isOwner && (
                        <Table.Td>
                          {!purchase.thankYouSent && (
                            <Button
                              size="xs"
                              variant="subtle"
                              leftSection={<IconMail size={14} />}
                              onClick={() => {
                                setSelectedPurchase(purchase);
                                openThankYouModal();
                              }}
                            >
                              Thank
                            </Button>
                          )}
                        </Table.Td>
                      )}
                    </Table.Tr>
                  )),
                )}
              </Table.Tbody>
            </Table>
          ) : (
            <Card withBorder p="xl" className="text-center">
              <IconShoppingCart size={48} className="mx-auto mb-4 text-gray-400" />
              <Text c="dimmed">No purchases yet</Text>
            </Card>
          )}
        </Tabs.Panel>

        {canEdit && (
          <Tabs.Panel value="users" pt="md">
            <Button leftSection={<IconUserPlus size={16} />} onClick={openShareModal} mb="md">
              Share Registry
            </Button>

            {registry.users?.length > 0 ? (
              <Stack gap="sm">
                {registry.users.map((user: any) => (
                  <Card key={user.id} withBorder p="md">
                    <Group justify="space-between">
                      <Group>
                        <Avatar src={user.user?.image} radius="xl">
                          {user.user?.name?.charAt(0) || '?'}
                        </Avatar>
                        <div>
                          <Text fw={500}>{user.user?.name || 'Unknown'}</Text>
                          <Text size="sm" c="dimmed">
                            {user.user?.email}
                          </Text>
                        </div>
                      </Group>

                      {isOwner && (
                        <Group>
                          <Select
                            value={user.role}
                            onChange={(value) =>
                              value && handleUpdateUserRole(user.userId, value as any)
                            }
                            data={[
                              { value: 'VIEWER', label: 'Viewer' },
                              { value: 'EDITOR', label: 'Editor' },
                              { value: 'OWNER', label: 'Owner' },
                            ]}
                            size="sm"
                            style={{ width: 120 }}
                          />
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleRemoveUser(user.userId)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                      )}
                    </Group>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Card withBorder p="xl" className="text-center">
                <IconUsers size={48} className="mx-auto mb-4 text-gray-400" />
                <Text c="dimmed">Registry not shared with anyone yet</Text>
              </Card>
            )}
          </Tabs.Panel>
        )}
      </Tabs>

      {/* Add Item Modal */}
      <Modal opened={addModalOpened} onClose={closeAddModal} title="Add Item to Registry" size="md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddItem();
          }}
        >
          <Stack>
            <Tabs value={itemType} onChange={(value) => setItemType(value as any)}>
              <Tabs.List grow>
                <Tabs.Tab value="product" leftSection={<IconPackage size={16} />}>
                  Product
                </Tabs.Tab>
                <Tabs.Tab value="collection" leftSection={<IconGift size={16} />}>
                  Collection
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="product" pt="md">
                <Select
                  label="Product"
                  placeholder="Select a product"
                  data={products.map((p) => ({
                    value: p.id,
                    label: `${p.name} - $${p.price || 0}`,
                  }))}
                  value={selectedProduct}
                  onChange={setSelectedProduct}
                  searchable
                  required
                />
              </Tabs.Panel>

              <Tabs.Panel value="collection" pt="md">
                <Select
                  label="Collection"
                  placeholder="Select a collection"
                  data={collections.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  value={selectedCollection}
                  onChange={setSelectedCollection}
                  searchable
                  required
                />
              </Tabs.Panel>
            </Tabs>

            <NumberInput
              label="Quantity"
              min={1}
              value={quantity}
              onChange={(val) => setQuantity(val as number)}
              required
            />

            <div>
              <Text size="sm" mb={4}>
                Priority
              </Text>
              <Slider
                value={priority}
                onChange={setPriority}
                min={0}
                max={10}
                marks={[
                  { value: 0, label: 'Low' },
                  { value: 5, label: 'Medium' },
                  { value: 10, label: 'High' },
                ]}
              />
            </div>

            <Textarea
              label="Notes (optional)"
              placeholder="Any special requests or notes..."
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
              rows={3}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={closeAddModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isAddingItem}
                disabled={
                  (itemType === 'product' && !selectedProduct) ||
                  (itemType === 'collection' && !selectedCollection)
                }
              >
                Add Item
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Share Modal */}
      <Modal opened={shareModalOpened} onClose={closeShareModal} title="Share Registry">
        <form onSubmit={shareForm.onSubmit(handleShare)}>
          <Stack>
            <Alert color="blue" title="Sharing Information">
              Share this registry with others to let them view or help manage items.
            </Alert>

            <TextInput
              label="Email Address"
              placeholder="friend@example.com"
              required
              {...shareForm.getInputProps('email')}
            />

            <Select
              label="Permission Level"
              data={[
                { value: 'VIEWER', label: 'Viewer - Can view items and purchases' },
                { value: 'EDITOR', label: 'Editor - Can add/remove items' },
              ]}
              {...shareForm.getInputProps('role')}
            />

            <Textarea
              label="Message (optional)"
              placeholder="Add a personal message..."
              rows={3}
              {...shareForm.getInputProps('message')}
            />

            <Group justify="flex-end">
              <Button variant="default" onClick={closeShareModal}>
                Cancel
              </Button>
              <Button type="submit">Send Invitation</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Thank You Modal */}
      <Modal
        opened={thankYouModalOpened}
        onClose={closeThankYouModal}
        title="Send Thank You Message"
      >
        <form onSubmit={thankYouForm.onSubmit(handleSendThankYou)}>
          <Stack>
            <Text size="sm" c="dimmed">
              Send a thank you message to {selectedPurchase?.purchaser?.name}
            </Text>

            <Textarea
              label="Message"
              placeholder="Thank you so much for your thoughtful gift!"
              rows={5}
              required
              {...thankYouForm.getInputProps('message')}
            />

            <Group justify="flex-end">
              <Button variant="default" onClick={closeThankYouModal}>
                Cancel
              </Button>
              <Button type="submit" leftSection={<IconMail size={16} />}>
                Send Message
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
