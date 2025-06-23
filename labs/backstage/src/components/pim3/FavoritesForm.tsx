'use client';

import {
  Modal,
  Stack,
  Group,
  Button,
  TextInput,
  Text,
  Alert,
  LoadingOverlay,
  Tabs,
  Card,
  Badge,
  ActionIcon,
  Tooltip,
  Divider,
} from '@mantine/core';
import {
  IconHeart,
  IconUser,
  IconPackage,
  IconCategory,
  IconPlus,
  IconTrash,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useForm, zodResolver } from '@mantine/form';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';

import {
  getFavorite,
  createFavorite,
  deleteFavorite,
  getUserFavorites,
} from '@/actions/pim3/actions';

const favoriteSchema = z
  .object({
    userId: z.string().min(1, 'User is required'),
    productId: z.string().optional(),
    collectionId: z.string().optional(),
  })
  .refine((data) => data.productId || data.collectionId, {
    message: 'Either product or collection must be selected',
    path: ['productId'],
  });

interface FavoritesFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  favoriteId?: string | null;
  userId?: string;
  mode?: 'create' | 'view' | 'manage';
}

export function FavoritesForm({
  opened,
  onClose,
  onSuccess,
  favoriteId,
  userId,
  mode = 'create',
}: FavoritesFormProps) {
  const [loading, setLoading] = useState(false);
  const [favoriteData, setFavoriteData] = useState<any>(null);
  const [userFavorites, setUserFavorites] = useState<any[]>([]);
  const [userFavoritesLoading, setUserFavoritesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('details');

  const form = useForm({
    validate: zodResolver(favoriteSchema),
    initialValues: {
      userId: userId || '',
      productId: '',
      collectionId: '',
    },
  });

  // Load favorite data when editing
  useEffect(() => {
    if (opened && favoriteId) {
      loadFavorite();
    } else if (opened && userId && mode === 'manage') {
      loadUserFavorites();
    } else if (opened && !favoriteId) {
      form.reset();
      form.setValues({
        userId: userId || '',
        productId: '',
        collectionId: '',
      });
    }
  }, [opened, favoriteId, userId, mode]);

  const loadFavorite = async () => {
    if (!favoriteId) return;

    try {
      setLoading(true);
      const result = await getFavorite(favoriteId);

      if (result.success && result.data) {
        setFavoriteData(result.data);
        form.setValues({
          userId: result.data.userId,
          productId: result.data.productId || '',
          collectionId: result.data.collectionId || '',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load favorite',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load favorite',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserFavorites = async () => {
    if (!userId) return;

    try {
      setUserFavoritesLoading(true);
      const result = await getUserFavorites(userId, { limit: 100 });

      if (result.success && result.data) {
        setUserFavorites(result.data);
      }
    } catch (error) {
      console.error('Failed to load user favorites:', error);
    } finally {
      setUserFavoritesLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      const result = await createFavorite({
        userId: values.userId,
        productId: values.productId || undefined,
        collectionId: values.collectionId || undefined,
      });

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Favorite added successfully',
          color: 'green',
        });
        onSuccess?.();
        onClose();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to add favorite',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add favorite',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const result = await deleteFavorite(favoriteId);

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: 'Favorite removed successfully',
          color: 'green',
        });
        loadUserFavorites(); // Reload the list
        onSuccess?.();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to remove favorite',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to remove favorite',
        color: 'red',
      });
    }
  };

  const getModalTitle = () => {
    if (mode === 'manage') return 'Manage User Favorites';
    if (favoriteId) return 'View Favorite';
    return 'Add to Favorites';
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={getModalTitle()}
      size={mode === 'manage' ? 'xl' : 'md'}
    >
      <LoadingOverlay visible={loading} />

      {mode === 'manage' ? (
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="details" leftSection={<IconHeart size={16} />}>
              Add Favorite
            </Tabs.Tab>
            <Tabs.Tab value="favorites" leftSection={<IconCategory size={16} />}>
              Current Favorites ({userFavorites.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="details" pt="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput
                  label="User ID"
                  placeholder="Enter user ID"
                  required
                  {...form.getInputProps('userId')}
                  disabled={!!userId}
                />

                <Alert icon={<IconAlertCircle size={16} />} color="blue">
                  Select either a product OR a collection to add to favorites
                </Alert>

                <TextInput
                  label="Product ID"
                  placeholder="Enter product ID (optional)"
                  {...form.getInputProps('productId')}
                />

                <TextInput
                  label="Collection ID"
                  placeholder="Enter collection ID (optional)"
                  {...form.getInputProps('collectionId')}
                />

                <Group justify="flex-end">
                  <Button variant="subtle" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading} leftSection={<IconPlus size={16} />}>
                    Add to Favorites
                  </Button>
                </Group>
              </Stack>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value="favorites" pt="md">
            <Stack>
              <LoadingOverlay visible={userFavoritesLoading} />

              {userFavorites.length === 0 ? (
                <Text ta="center" c="dimmed" py="xl">
                  No favorites found for this user
                </Text>
              ) : (
                <Stack gap="sm">
                  {userFavorites.map((favorite) => (
                    <Card key={favorite.id} withBorder p="sm">
                      <Group justify="space-between">
                        <Stack gap={4}>
                          {favorite.product && (
                            <Group gap="sm">
                              <Badge
                                color="blue"
                                variant="light"
                                leftSection={<IconPackage size={12} />}
                              >
                                Product
                              </Badge>
                              <Text size="sm" fw={500}>
                                {favorite.product.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                SKU: {favorite.product.sku}
                              </Text>
                            </Group>
                          )}
                          {favorite.collection && (
                            <Group gap="sm">
                              <Badge
                                color="green"
                                variant="light"
                                leftSection={<IconCategory size={12} />}
                              >
                                Collection
                              </Badge>
                              <Text size="sm" fw={500}>
                                {favorite.collection.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                Type: {favorite.collection.type}
                              </Text>
                            </Group>
                          )}
                          <Text size="xs" c="dimmed">
                            Added: {new Date(favorite.createdAt).toLocaleDateString()}
                          </Text>
                        </Stack>
                        <Tooltip label="Remove favorite">
                          <ActionIcon
                            color="red"
                            variant="light"
                            onClick={() => handleRemoveFavorite(favorite.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              )}

              <Group justify="flex-end">
                <Button variant="subtle" onClick={onClose}>
                  Close
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      ) : favoriteId && favoriteData ? (
        // View mode
        <Stack>
          <Group>
            <IconUser size={20} />
            <div>
              <Text size="sm" c="dimmed">
                User
              </Text>
              <Text fw={500}>{favoriteData.user?.name || 'Unknown User'}</Text>
              <Text size="xs" c="dimmed">
                {favoriteData.user?.email}
              </Text>
            </div>
          </Group>

          <Divider />

          {favoriteData.product && (
            <Group>
              <IconPackage size={20} />
              <div>
                <Text size="sm" c="dimmed">
                  Product
                </Text>
                <Text fw={500}>{favoriteData.product.name}</Text>
                <Text size="xs" c="dimmed">
                  SKU: {favoriteData.product.sku}
                </Text>
                {favoriteData.product.price && (
                  <Text size="xs" c="dimmed">
                    Price:{' '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: favoriteData.product.currency || 'USD',
                    }).format(favoriteData.product.price)}
                  </Text>
                )}
              </div>
            </Group>
          )}

          {favoriteData.collection && (
            <Group>
              <IconCategory size={20} />
              <div>
                <Text size="sm" c="dimmed">
                  Collection
                </Text>
                <Text fw={500}>{favoriteData.collection.name}</Text>
                <Text size="xs" c="dimmed">
                  Type: {favoriteData.collection.type}
                </Text>
              </div>
            </Group>
          )}

          <Divider />

          <Group>
            <Text size="sm" c="dimmed">
              Added:
            </Text>
            <Text size="sm">{new Date(favoriteData.createdAt).toLocaleString()}</Text>
          </Group>

          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose}>
              Close
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={async () => {
                await handleRemoveFavorite(favoriteData.id);
                onClose();
              }}
            >
              Remove Favorite
            </Button>
          </Group>
        </Stack>
      ) : (
        // Create mode
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="User ID"
              placeholder="Enter user ID"
              required
              {...form.getInputProps('userId')}
              disabled={!!userId}
            />

            <Alert icon={<IconAlertCircle size={16} />} color="blue">
              Select either a product OR a collection to add to favorites
            </Alert>

            <TextInput
              label="Product ID"
              placeholder="Enter product ID (optional)"
              {...form.getInputProps('productId')}
            />

            <TextInput
              label="Collection ID"
              placeholder="Enter collection ID (optional)"
              {...form.getInputProps('collectionId')}
            />

            <Group justify="flex-end">
              <Button variant="subtle" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" loading={loading} leftSection={<IconPlus size={16} />}>
                Add to Favorites
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
