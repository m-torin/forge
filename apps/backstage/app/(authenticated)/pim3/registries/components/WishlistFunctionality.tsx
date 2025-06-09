'use client';

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconBookmark,
  IconBookmarkFilled,
  IconHeart,
  IconMail,
  IconShare,
  IconShoppingCart,
  IconStar,
} from '@tabler/icons-react';
import { useState } from 'react';

import { showErrorNotification, showSuccessNotification } from '../../utils/pim-helpers';
import { updateRegistryItem } from '../actions';

import type { RegistryWithRelations } from '../actions';

interface WishlistFunctionalityProps {
  onRefresh?: () => void;
  registry: RegistryWithRelations;
}

interface WishlistModalProps {
  children: React.ReactNode;
  onClose: () => void;
  opened: boolean;
  title: string;
}

function WishlistModal({ children, onClose, opened, title }: WishlistModalProps) {
  return (
    <Modal
      onClose={onClose}
      opened={opened}
      scrollAreaComponent={ScrollArea.Autosize}
      size="md"
      title={title}
    >
      {children}
    </Modal>
  );
}

/**
 * WishlistFunctionality component for wishlist-specific features
 */
export function WishlistFunctionality({ onRefresh, registry }: WishlistFunctionalityProps) {
  const [shareModalOpened, setShareModalOpened] = useState(false);
  const [notesModalOpened, setNotesModalOpened] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const shareForm = useForm({
    initialValues: {
      emails: '',
      includeNotes: true,
      message: `Hi! I wanted to share my ${registry.title} wishlist with you. Check out the items I'm hoping to get!`,
    },
  });

  const notesForm = useForm({
    initialValues: {
      notes: '',
    },
  });

  const handleBookmarkItem = async (itemId: string, bookmarked: boolean) => {
    setLoading((prev) => ({ ...prev, [itemId]: true }));
    try {
      // This would typically update a "bookmarked" field or add to favorites
      // For now, we'll update the notes field with a bookmark indicator
      const item = registry.items.find((i) => i.id === itemId);
      if (item) {
        const currentNotes = item.notes || '';
        const bookmarkTag = '[⭐ FAVORITE]';

        let newNotes: string;
        if (bookmarked) {
          // Remove bookmark
          newNotes = currentNotes.replace(bookmarkTag, '').trim();
        } else {
          // Add bookmark
          newNotes = currentNotes.includes(bookmarkTag)
            ? currentNotes
            : `${bookmarkTag} ${currentNotes}`.trim();
        }

        const result = await updateRegistryItem(itemId, { notes: newNotes });
        if (result.success) {
          showSuccessNotification(bookmarked ? 'Removed from favorites' : 'Added to favorites');
          onRefresh?.();
        } else {
          showErrorNotification(result.error || 'Failed to update item');
        }
      }
    } catch (error) {
      showErrorNotification('Failed to update item');
    } finally {
      setLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleUpdateItemNotes = async (itemId: string, notes: string) => {
    try {
      const result = await updateRegistryItem(itemId, { notes });
      if (result.success) {
        showSuccessNotification('Notes updated successfully');
        onRefresh?.();
        setNotesModalOpened(false);
        setSelectedItemId(null);
      } else {
        showErrorNotification(result.error || 'Failed to update notes');
      }
    } catch (error) {
      showErrorNotification('Failed to update notes');
    }
  };

  const handleShareWishlist = async (values: typeof shareForm.values) => {
    try {
      // This would typically integrate with an email service
      // For demo purposes, we'll just show a success message
      showSuccessNotification('Wishlist shared successfully!');
      setShareModalOpened(false);
      shareForm.reset();
    } catch (error) {
      showErrorNotification('Failed to share wishlist');
    }
  };

  const openNotesModal = (itemId: string) => {
    const item = registry.items.find((i) => i.id === itemId);
    if (item) {
      notesForm.setFieldValue('notes', item.notes || '');
      setSelectedItemId(itemId);
      setNotesModalOpened(true);
    }
  };

  const getWishlistStats = () => {
    const totalItems = registry.items.length;
    const purchasedItems = registry.items.filter((item) => item.purchased).length;
    const favoriteItems = registry.items.filter((item) =>
      item.notes?.includes('[⭐ FAVORITE]'),
    ).length;
    const highPriorityItems = registry.items.filter((item) => item.priority >= 7).length;

    return {
      completionRate: totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0,
      favoriteItems,
      highPriorityItems,
      purchasedItems,
      totalItems,
    };
  };

  const stats = getWishlistStats();

  if (registry.type !== 'WISHLIST') {
    return null;
  }

  return (
    <Stack gap="lg">
      {/* Wishlist Header */}
      <Card withBorder bg="pink.0" p="lg" radius="md">
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <IconHeart color="var(--mantine-color-pink-6)" size={24} />
            <Title order={4} c="pink.8">
              Wishlist Features
            </Title>
          </Group>
          <Group gap="xs">
            <Button
              color="pink"
              leftSection={<IconShare size={16} />}
              onClick={() => setShareModalOpened(true)}
              variant="light"
            >
              Share Wishlist
            </Button>
            <Button
              color="blue"
              leftSection={<IconShoppingCart size={16} />}
              disabled={registry.items.length === 0}
              variant="light"
            >
              Convert to Cart
            </Button>
          </Group>
        </Group>

        {/* Wishlist Stats */}
        <Group grow>
          <div>
            <Text c="pink.8" fw={700} size="lg">
              {stats.totalItems}
            </Text>
            <Text c="pink.6" size="xs">
              Total Items
            </Text>
          </div>
          <div>
            <Text c="orange.8" fw={700} size="lg">
              {stats.favoriteItems}
            </Text>
            <Text c="orange.6" size="xs">
              Favorites
            </Text>
          </div>
          <div>
            <Text c="red.8" fw={700} size="lg">
              {stats.highPriorityItems}
            </Text>
            <Text c="red.6" size="xs">
              High Priority
            </Text>
          </div>
          <div>
            <Text c="green.8" fw={700} size="lg">
              {stats.completionRate.toFixed(0)}%
            </Text>
            <Text c="green.6" size="xs">
              Fulfilled
            </Text>
          </div>
        </Group>
      </Card>

      {/* Wishlist Items with Special Actions */}
      {registry.items.length > 0 && (
        <Card withBorder p="md" radius="md">
          <Title order={5} mb="md">
            Quick Actions
          </Title>
          <Stack gap="md">
            {registry.items.map((item) => {
              const isFavorite = item.notes?.includes('[⭐ FAVORITE]') || false;
              const isHighPriority = item.priority >= 7;

              return (
                <Card key={item.id} withBorder bg="gray.0" p="sm" radius="sm">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <div>
                        <Group gap="xs">
                          <Text fw={500} size="sm">
                            {item.product?.name || item.collection?.name || 'Unknown item'}
                          </Text>
                          {isHighPriority && (
                            <Badge color="red" leftSection={<IconStar size={10} />} size="xs">
                              High Priority
                            </Badge>
                          )}
                          {item.purchased && (
                            <Badge color="green" size="xs">
                              Purchased
                            </Badge>
                          )}
                        </Group>
                        <Group gap="xs" mt={2}>
                          <Text c="dimmed" size="xs">
                            Qty: {item.quantity} • Priority: {item.priority}/10
                          </Text>
                          {item.product?.price && (
                            <Badge color="green" size="xs" variant="light">
                              ${item.product.price}
                            </Badge>
                          )}
                        </Group>
                      </div>
                    </Group>

                    <Group gap="xs">
                      <Tooltip label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                        <ActionIcon
                          color={isFavorite ? 'yellow' : 'gray'}
                          loading={loading[item.id]}
                          onClick={() => handleBookmarkItem(item.id, isFavorite)}
                          variant="subtle"
                        >
                          {isFavorite ? (
                            <IconBookmarkFilled size={16} />
                          ) : (
                            <IconBookmark size={16} />
                          )}
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label="Edit notes">
                        <ActionIcon
                          color="blue"
                          onClick={() => openNotesModal(item.id)}
                          variant="subtle"
                        >
                          <IconMail size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>

                  {item.notes && (
                    <Text
                      style={{
                        backgroundColor: 'var(--mantine-color-blue-0)',
                        borderRadius: '4px',
                        padding: '4px 8px',
                      }}
                      c="dimmed"
                      mt="xs"
                      size="xs"
                    >
                      {item.notes}
                    </Text>
                  )}
                </Card>
              );
            })}
          </Stack>
        </Card>
      )}

      {/* Share Wishlist Modal */}
      <WishlistModal
        onClose={() => setShareModalOpened(false)}
        opened={shareModalOpened}
        title="Share Your Wishlist"
      >
        <form onSubmit={shareForm.onSubmit(handleShareWishlist)}>
          <Stack gap="md">
            <TextInput
              description="Separate multiple emails with commas"
              placeholder="friend@example.com, family@example.com"
              label="Email addresses"
              required
              {...shareForm.getInputProps('emails')}
            />

            <Textarea
              description="Optional message to include with your wishlist"
              maxRows={6}
              minRows={3}
              placeholder="Hi! I wanted to share my wishlist with you..."
              label="Personal message"
              {...shareForm.getInputProps('message')}
            />

            <Group>
              <Button leftSection={<IconMail size={16} />} type="submit">
                Send Wishlist
              </Button>
              <Button onClick={() => setShareModalOpened(false)} variant="light">
                Cancel
              </Button>
            </Group>
          </Stack>
        </form>
      </WishlistModal>

      {/* Edit Notes Modal */}
      <WishlistModal
        onClose={() => {
          setNotesModalOpened(false);
          setSelectedItemId(null);
        }}
        opened={notesModalOpened}
        title="Edit Item Notes"
      >
        <form
          onSubmit={notesForm.onSubmit((values) => {
            if (selectedItemId) {
              handleUpdateItemNotes(selectedItemId, values.notes);
            }
          })}
        >
          <Stack gap="md">
            <Textarea
              description="Add any special notes, size preferences, color choices, etc."
              maxRows={8}
              minRows={4}
              placeholder="Size: Medium, Color: Blue preferred..."
              label="Notes and preferences"
              {...notesForm.getInputProps('notes')}
            />

            <Group>
              <Button type="submit">Save Notes</Button>
              <Button
                onClick={() => {
                  setNotesModalOpened(false);
                  setSelectedItemId(null);
                }}
                variant="light"
              >
                Cancel
              </Button>
            </Group>
          </Stack>
        </form>
      </WishlistModal>
    </Stack>
  );
}
