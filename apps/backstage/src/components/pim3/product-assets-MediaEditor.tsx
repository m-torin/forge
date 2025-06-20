'use client';

import {
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';

import type { MediaType, Media } from '@repo/database/prisma';

interface MediaEditorProps {
  asset: Media & {
    product: {
      id: string;
      name: string;
      sku: string;
    } | null;
  };
  onCancel: () => void;
  onSave: (updates: Partial<Media>) => Promise<void>;
}

const ASSET_TYPE_OPTIONS = [
  { label: 'Image', value: 'IMAGE' },
  { label: 'Video', value: 'VIDEO' },
  { label: 'Document', value: 'DOCUMENT' },
  { label: 'Manual', value: 'MANUAL' },
  { label: 'Specification', value: 'SPECIFICATION' },
  { label: 'Certificate', value: 'CERTIFICATE' },
  { label: 'Audio', value: 'AUDIO' },
];

export function MediaEditor({ asset, onCancel, onSave }: MediaEditorProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    validate: {
      altText: (value: any) =>
        asset.type === 'IMAGE' && !value ? 'Alt text is required for images' : null,
      type: (value) => (!value ? 'Asset type is required' : null),
    },
    initialValues: {
      type: asset.type,
      altText: asset.altText || '',
      copy: (asset.copy as any) || {},
      mimeType: asset.mimeType || '',
      sortOrder: asset.sortOrder || 0,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await onSave({
        type: values.type as MediaType,
        altText: values.altText || null,
        copy: values.copy,
        mimeType: values.mimeType || null,
        sortOrder: values.sortOrder,
      });
    } catch (error) {
      console.error('Error saving asset:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <div>
          <Text fw={500} mb="xs" size="sm">
            Product
          </Text>
          <Text c="dimmed" size="sm">
            {asset.product?.name || 'No product'} ({asset.product?.sku || 'N/A'})
          </Text>
        </div>

        <div>
          <Text fw={500} mb="xs" size="sm">
            Filename
          </Text>
          <Text c="dimmed" size="sm">
            {asset.url.split('/').pop() || 'Unknown'}
          </Text>
        </div>

        <Select
          data={ASSET_TYPE_OPTIONS}
          label="Asset Type"
          required
          {...form.getInputProps('type')}
        />

        {form.values.type === 'IMAGE' && (
          <TextInput
            placeholder="Descriptive text for accessibility and SEO"
            label="Alt Text"
            {...form.getInputProps('altText')}
          />
        )}

        <Textarea
          minRows={3}
          placeholder="Optional description of the asset"
          label="Description"
          {...form.getInputProps('copy.description')}
        />

        <Group grow>
          <NumberInput
            placeholder="0"
            label="Sort Order"
            min={0}
            {...form.getInputProps('sortOrder')}
          />
          <TextInput
            placeholder="image/jpeg"
            label="MIME Type"
            {...form.getInputProps('mimeType')}
          />
        </Group>

        <div>
          <Text fw={500} mb="xs" size="sm">
            Current URL
          </Text>
          <Text style={{ wordBreak: 'break-all' }} c="dimmed" size="sm">
            {asset.url}
          </Text>
        </div>

        {asset.size && (
          <div>
            <Text fw={500} mb="xs" size="sm">
              File Size
            </Text>
            <Text c="dimmed" size="sm">
              {(asset.size / 1024 / 1024).toFixed(2)} MB
            </Text>
          </div>
        )}

        <Group justify="flex-end" mt="md">
          <Button onClick={onCancel} disabled={loading} variant="light">
            Cancel
          </Button>
          <Button loading={loading} type="submit">
            Save Changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
