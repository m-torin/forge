'use client';

import {
  Alert,
  Button,
  Divider,
  Group,
  Modal,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCopy, IconHierarchy, IconPlus } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

import {
  checkSlugAvailability,
  createTaxonomy,
  duplicateTaxonomy,
  generateSlug,
  getParentTaxonomyOptions,
  updateTaxonomy,
} from '../taxonomies/actions';
import { showErrorNotification, showSuccessNotification } from '../utils/pim-helpers';

import type { ContentStatus, Taxonomy, TaxonomyType } from '@repo/database/prisma';

interface TaxonomyFormModalProps {
  duplicateMode?: boolean;
  onClose: () => void;
  onSuccess: () => void;
  opened: boolean;
  taxonomy: Taxonomy | null;
}

interface TaxonomyFormValues {
  description: string;
  metaDescription: string;
  metaKeywords: string;
  metaTitle: string;
  name: string;
  parentId: string | null;
  slug: string;
  status: ContentStatus;
  type: TaxonomyType;
}

interface ParentOption {
  group: string;
  label: string;
  value: string;
}

/**
 * Modal form for creating and editing taxonomies
 */
export function TaxonomyFormModal({
  duplicateMode = false,
  onClose,
  onSuccess,
  opened,
  taxonomy,
}: TaxonomyFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [parentOptions, setParentOptions] = useState<ParentOption[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('basic');

  const isEdit = !!taxonomy && !duplicateMode;
  const isDuplicate = !!taxonomy && duplicateMode;

  const form = useForm<TaxonomyFormValues>({
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      type: (value) => (!value ? 'Type is required' : null),
      slug: (value) => {
        if (!value) return 'Slug is required';
        if (!/^[a-z0-9-]+$/.test(value)) {
          return 'Slug can only contain lowercase letters, numbers, and hyphens';
        }
        return null;
      },
      status: (value) => (!value ? 'Status is required' : null),
    },
    initialValues: {
      name: '',
      type: 'CATEGORY' as TaxonomyType,
      description: '',
      metaDescription: '',
      metaKeywords: '',
      metaTitle: '',
      parentId: null,
      slug: '',
      status: 'DRAFT' as ContentStatus,
    },
  });

  // Reset form when taxonomy changes
  useEffect(() => {
    const updateForm = async () => {
      if (taxonomy) {
        const copy = (taxonomy.copy as unknown as any) || {};
        form.setValues({
          name: isDuplicate ? `${taxonomy.name} (Copy)` : taxonomy.name,
          type: taxonomy.type,
          description: copy.description || '',
          metaDescription: copy.metaDescription || '',
          metaKeywords: copy.metaKeywords || '',
          metaTitle: copy.metaTitle || '',
          parentId: null, // Note: Will be populated when schema supports hierarchical relationships
          slug: isDuplicate ? await generateSlug(`${taxonomy.name} (Copy)`) : taxonomy.slug,
          status: isDuplicate ? 'DRAFT' : taxonomy.status,
        });
      } else {
        form.reset();
      }
    };
    updateForm();
  }, [taxonomy, isDuplicate]);

  // Load parent taxonomy options when type changes
  const loadParentOptions = useCallback(
    async (type: TaxonomyType) => {
      setLoadingParents(true);
      try {
        const result = await getParentTaxonomyOptions(type, taxonomy?.id);
        if (result.success && result.data) {
          setParentOptions(result.data);
        } else {
          setParentOptions([]);
        }
      } catch (error) {
        setParentOptions([]);
      } finally {
        setLoadingParents(false);
      }
    },
    [taxonomy?.id],
  );

  // Load parent options when type changes
  useEffect(() => {
    if (form.values.type) {
      loadParentOptions(form.values.type);
    }
  }, [form.values.type, loadParentOptions]);

  // Auto-generate slug from name
  const handleNameChange = async (value: string) => {
    form.setFieldValue('name', value);
    if ((!isEdit || isDuplicate) && value) {
      const newSlug = await generateSlug(value);
      form.setFieldValue('slug', newSlug);
    }
  };

  // Validate slug availability
  const validateSlug = useCallback(
    async (slug: string) => {
      if (!slug) return;

      try {
        const isAvailable = await checkSlugAvailability(slug, taxonomy?.id);
        if (!isAvailable) {
          form.setFieldError('slug', 'This slug is already taken');
        }
      } catch (error) {
        // Ignore errors during validation
      }
    },
    [taxonomy?.id],
  );

  const handleSubmit = async (values: TaxonomyFormValues) => {
    setLoading(true);
    try {
      const copy = {
        description: values.description,
        metaDescription: values.metaDescription,
        metaKeywords: values.metaKeywords,
        metaTitle: values.metaTitle,
      };

      if (isEdit) {
        const result = await updateTaxonomy(taxonomy.id, {
          name: values.name,
          type: values.type,
          copy,
          slug: values.slug,
          status: values.status,
        });
        if (result.success) {
          showSuccessNotification('Taxonomy updated successfully');
          onSuccess();
        } else {
          showErrorNotification(result.error || 'Failed to update taxonomy');
        }
      } else if (isDuplicate) {
        const result = await duplicateTaxonomy(taxonomy.id, values.name);
        if (result.success) {
          showSuccessNotification('Taxonomy duplicated successfully');
          onSuccess();
        } else {
          showErrorNotification(result.error || 'Failed to duplicate taxonomy');
        }
      } else {
        const result = await createTaxonomy({
          name: values.name,
          type: values.type,
          copy,
          parentId: values.parentId,
          slug: values.slug,
          status: values.status,
        });
        if (result.success) {
          showSuccessNotification('Taxonomy created successfully');
          onSuccess();
        } else {
          showErrorNotification(result.error || 'Failed to create taxonomy');
        }
      }
    } catch (error: any) {
      showErrorNotification(error.message || 'Failed to save taxonomy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      opened={opened}
      size="xl"
      title={
        <Group>
          {isDuplicate && <IconCopy size={18} />}
          {isEdit ? 'Edit Taxonomy' : isDuplicate ? 'Duplicate Taxonomy' : 'Create Taxonomy'}
        </Group>
      }
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Tabs onChange={setActiveTab} value={activeTab}>
          <Tabs.List>
            <Tabs.Tab value="basic">Basic Information</Tabs.Tab>
            <Tabs.Tab leftSection={<IconHierarchy size={14} />} value="hierarchy">
              Hierarchy
            </Tabs.Tab>
            <Tabs.Tab value="seo">SEO & Metadata</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel pt="md" value="basic">
            <Stack>
              <TextInput
                placeholder="Enter taxonomy name"
                label="Name"
                required
                {...form.getInputProps('name')}
                onChange={(e) => void handleNameChange(e.currentTarget.value)}
              />

              <TextInput
                description="URL-friendly identifier for the taxonomy"
                placeholder="url-friendly-slug"
                label="Slug"
                required
                {...form.getInputProps('slug')}
                onBlur={(e) => validateSlug(e.currentTarget.value)}
              />

              <Select
                placeholder="Select taxonomy type"
                data={[
                  { label: 'Category', value: 'CATEGORY' },
                  { label: 'Tag', value: 'TAG' },
                  { label: 'Attribute', value: 'ATTRIBUTE' },
                  { label: 'Department', value: 'DEPARTMENT' },
                  { label: 'Collection', value: 'COLLECTION' },
                  { label: 'Other', value: 'OTHER' },
                ]}
                label="Type"
                required
                {...form.getInputProps('type')}
              />

              <Select
                placeholder="Select status"
                data={[
                  { label: 'Draft', value: 'DRAFT' },
                  { label: 'Published', value: 'PUBLISHED' },
                  { label: 'Archived', value: 'ARCHIVED' },
                ]}
                label="Status"
                required
                {...form.getInputProps('status')}
              />

              <Textarea
                minRows={3}
                placeholder="Enter a description for this taxonomy"
                label="Description"
                {...form.getInputProps('description')}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="hierarchy">
            <Stack>
              <Alert color="blue" icon={<IconAlertCircle size={16} />} variant="light">
                <Text size="sm">
                  Hierarchical taxonomy relationships are prepared for future schema updates.
                  Currently, all taxonomies are created as root-level items.
                </Text>
              </Alert>

              <Text c="dimmed" size="sm">
                Organize taxonomies in hierarchical relationships for better content organization.
              </Text>
              <Divider />

              <Select
                description="Choose a parent taxonomy to create a hierarchical relationship"
                placeholder="Select parent taxonomy (optional)"
                clearable
                data={parentOptions}
                disabled={!form.values.type || loadingParents}
                label="Parent Taxonomy"
                searchable
                {...form.getInputProps('parentId')}
              />

              {form.values.parentId && (
                <Alert color="green" icon={<IconHierarchy size={16} />} variant="light">
                  <Text size="sm">
                    This taxonomy will be nested under the selected parent when hierarchical support
                    is enabled.
                  </Text>
                </Alert>
              )}

              {!form.values.type && (
                <Alert color="orange" icon={<IconAlertCircle size={16} />} variant="light">
                  <Text size="sm">
                    Please select a taxonomy type first to see available parent options.
                  </Text>
                </Alert>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel pt="md" value="seo">
            <Stack>
              <Text c="dimmed" size="sm">
                Optimize your taxonomy for search engines and social media sharing.
              </Text>
              <Divider />

              <TextInput
                description="Recommended length: 50-60 characters"
                placeholder="SEO title for the taxonomy page"
                label="Meta Title"
                {...form.getInputProps('metaTitle')}
              />

              <Textarea
                description="Recommended length: 150-160 characters"
                minRows={2}
                placeholder="SEO description for the taxonomy page"
                label="Meta Description"
                {...form.getInputProps('metaDescription')}
              />

              <TextInput
                description="e.g. category, products, commerce"
                placeholder="Comma-separated keywords for SEO"
                label="Meta Keywords"
                {...form.getInputProps('metaKeywords')}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Divider my="md" />

        <Group justify="flex-end">
          <Button onClick={onClose} variant="subtle">
            Cancel
          </Button>
          <Button
            leftSection={
              isDuplicate ? <IconCopy size={16} /> : !isEdit ? <IconPlus size={16} /> : undefined
            }
            loading={loading}
            type="submit"
          >
            {isDuplicate ? 'Duplicate' : isEdit ? 'Update' : 'Create'} Taxonomy
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
