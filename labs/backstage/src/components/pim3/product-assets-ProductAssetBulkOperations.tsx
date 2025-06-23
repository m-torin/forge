'use client';

import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconDownload, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { bulkDeleteAssets, bulkUpdateAssets } from '@/actions/pim3/actions';

import type { MediaType } from '@repo/database/prisma';

interface ProductAssetBulkOperationsProps {
  onSelectionChange: (assets: string[]) => void;
  selectedAssets: string[];
}

const ASSET_TYPE_OPTIONS = [
  { label: 'Image', value: 'IMAGE' },
  { label: 'Video', value: 'VIDEO' },
  { label: 'Document', value: 'DOCUMENT' },
  { label: 'Manual', value: 'MANUAL' },
  { label: 'Specification', value: 'SPECIFICATION' },
  { label: 'Certificate', value: 'CERTIFICATE' },
  { label: 'Other', value: 'OTHER' },
];

export function ProductAssetBulkOperations({
  onSelectionChange,
  selectedAssets,
}: ProductAssetBulkOperationsProps) {
  const [bulkEditOpened, { close: closeBulkEdit, open: openBulkEdit }] = useDisclosure();
  const [loading, setLoading] = useState(false);

  const bulkEditForm = useForm({
    initialValues: {
      type: '',
      description: '',
      sortOrder: '',
    },
  });

  const handleBulkDelete = () => {
    modals.openConfirmModal({
      children: (
        <Text size="sm">
          Are you sure you want to delete {selectedAssets.length} selected assets? This action
          cannot be undone.
        </Text>
      ),
      confirmProps: { color: 'red' },
      labels: { cancel: 'Cancel', confirm: 'Delete All' },
      onConfirm: async () => {
        setLoading(true);
        try {
          const result = await bulkDeleteAssets(selectedAssets);
          if (result.success) {
            notifications.show({
              color: 'green',
              message: `Successfully deleted ${selectedAssets.length} assets`,
              title: 'Success',
            });
            onSelectionChange([]);
          } else {
            notifications.show({
              color: 'red',
              message: result.error || 'Failed to delete assets',
              title: 'Error',
            });
          }
        } catch (error) {
          notifications.show({
            color: 'red',
            message: 'Failed to delete assets',
            title: 'Error',
          });
        } finally {
          setLoading(false);
        }
      },
      title: 'Delete Selected Assets',
    });
  };

  const handleBulkEdit = async (values: typeof bulkEditForm.values) => {
    setLoading(true);
    try {
      const updates: any = {};

      if (values.type) {
        updates.type = values.type as MediaType;
      }

      if (values.description) {
        updates.description = values.description;
      }

      if (values.sortOrder) {
        updates.sortOrder = parseInt(values.sortOrder);
      }

      const result = await bulkUpdateAssets({
        assetIds: selectedAssets,
        updates,
      });

      if (result.success) {
        notifications.show({
          color: 'green',
          message: `Successfully updated ${selectedAssets.length} assets`,
          title: 'Success',
        });
        closeBulkEdit();
        bulkEditForm.reset();
        onSelectionChange([]);
      } else {
        notifications.show({
          color: 'red',
          message: result.error || 'Failed to update assets',
          title: 'Error',
        });
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        message: 'Failed to update assets',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDownload = () => {
    // In a real implementation, this would:
    // 1. Create a zip file with all selected assets
    // 2. Stream the download to the user
    // 3. Show progress feedback

    notifications.show({
      color: 'blue',
      message: 'Preparing download... This feature is coming soon!',
      title: 'Download Started',
    });
  };

  if (selectedAssets.length === 0) {
    return null;
  }

  return (
    <>
      <Card withBorder>
        <Group justify="space-between">
          <Group>
            <Badge size="lg" variant="light">
              {selectedAssets.length} selected
            </Badge>
            <Text c="dimmed" size="sm">
              Bulk operations available for selected assets
            </Text>
          </Group>

          <Group>
            <Button
              leftSection={<IconDownload size={16} />}
              onClick={handleBulkDownload}
              disabled={loading}
              size="sm"
              variant="light"
            >
              Download
            </Button>

            <Button
              leftSection={<IconEdit size={16} />}
              onClick={openBulkEdit}
              disabled={loading}
              size="sm"
              variant="light"
            >
              Edit
            </Button>

            <Button
              color="red"
              leftSection={<IconTrash size={16} />}
              loading={loading}
              onClick={handleBulkDelete}
              disabled={loading}
              size="sm"
              variant="light"
            >
              Delete
            </Button>
          </Group>
        </Group>
      </Card>

      {/* Bulk Edit Modal */}
      <Modal onClose={closeBulkEdit} opened={bulkEditOpened} size="md" title="Bulk Edit Assets">
        <form onSubmit={bulkEditForm.onSubmit(handleBulkEdit)}>
          <Stack gap="md">
            <Text c="dimmed" size="sm">
              Update {selectedAssets.length} selected assets. Leave fields empty to keep existing
              values.
            </Text>

            <Select
              placeholder="Keep existing types"
              clearable
              data={ASSET_TYPE_OPTIONS}
              label="Asset Type"
              {...bulkEditForm.getInputProps('type')}
            />

            <Textarea
              minRows={3}
              placeholder="Keep existing descriptions"
              label="Description"
              {...bulkEditForm.getInputProps('description')}
            />

            <NumberInput
              placeholder="Keep existing order"
              label="Sort Order"
              min={0}
              {...bulkEditForm.getInputProps('sortOrder')}
            />

            <Group justify="flex-end" mt="md">
              <Button onClick={closeBulkEdit} disabled={loading} variant="light">
                Cancel
              </Button>
              <Button leftSection={<IconEdit size={16} />} loading={loading} type="submit">
                Update {selectedAssets.length} Assets
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
