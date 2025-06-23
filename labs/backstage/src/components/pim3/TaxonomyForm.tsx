'use client';

import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  TextInput,
  JsonInput,
  Alert,
  Card,
  Text,
  Badge,
  Title,
  Divider,
} from '@mantine/core';
import {
  IconCheck,
  IconAlertTriangle,
  IconDeviceFloppy,
  IconHierarchy,
  IconRefresh,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { usePimForm } from '@/hooks/pim3/usePimForm';
import { useTaxonomyValidation } from '@/hooks/pim3/useAsyncValidation';
import { useFormDataLoading } from '@/hooks/pim3/useFormLoading';
import { useFormErrors } from '@/hooks/pim3/useFormErrors';
import { createTaxonomy, updateTaxonomy, getTaxonomies } from '@/actions/pim3/taxonomies/actions';

import type { Taxonomy } from '@repo/database/prisma';
import { TaxonomyType, ContentStatus } from '@repo/database/prisma';

// Enhanced validation schema with hierarchical support
const taxonomyFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .max(100, 'Slug too long')
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    type: z.nativeEnum(TaxonomyType),
    status: z.nativeEnum(ContentStatus),
    copy: z
      .string()
      .refine((val) => {
        if (!val) return true;
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      }, 'Must be valid JSON')
      .default('{}'),
    parentId: z.string().optional().or(z.literal('')),
    displayOrder: z.number().min(0, 'Display order must be positive').default(0),
    level: z.number().min(0).max(5, 'Maximum hierarchy depth is 5').default(0),
    path: z.string().optional(), // Computed hierarchy path
  })
  .refine(
    (data) => {
      // Hierarchical validation: certain types can't have children
      if (data.type === 'TAG' && data.parentId) {
        return false;
      }
      return true;
    },
    {
      message: 'Tags cannot have parent taxonomies',
      path: ['parentId'],
    },
  )
  .refine(
    (data) => {
      // Level-based validation
      if (data.level > 3 && data.type === 'CATEGORY') {
        return false;
      }
      return true;
    },
    {
      message: 'Categories cannot exceed 3 levels deep',
      path: ['parentId'],
    },
  );

type TaxonomyFormData = z.infer<typeof taxonomyFormSchema>;

interface TaxonomyFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taxonomy?: Taxonomy | null;
  duplicateMode?: boolean;
}

export function TaxonomyFormModal({
  opened,
  onClose,
  onSuccess,
  taxonomy,
  duplicateMode = false,
}: TaxonomyFormModalProps) {
  const isEditing = !!(taxonomy && !duplicateMode);
  const isDuplicating = !!(taxonomy && duplicateMode);

  // Form data loading
  const { isDataLoading, withDataLoading } = useFormDataLoading();

  // Async validation
  const asyncValidation = useTaxonomyValidation(taxonomy?.id);

  // Auto-save for draft taxonomies
  const autoSaveTaxonomy = async (values: TaxonomyFormData) => {
    if (isEditing && values.status === 'DRAFT') {
      await updateTaxonomy(taxonomy!.id, {
        ...values,
        parentId: values.parentId || null,
        copy: values.copy ? JSON.parse(values.copy) : undefined,
      });
    }
  };

  // Slug generation from name
  const generateSlugFromName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Calculate hierarchy level and path
  const calculateHierarchy = (
    parentId: string | undefined,
    parentTaxonomies: Taxonomy[],
    currentName: string,
  ) => {
    if (!parentId) return { level: 0, path: '' };

    const parent = parentTaxonomies.find((t) => t.id === parentId);
    if (!parent) return { level: 0, path: '' };

    // Simple level calculation (in real app, this would be more sophisticated)
    const parentLevel = (parent as any).level || 0;
    return {
      level: parentLevel + 1,
      path: `${(parent as any).path || parent.slug}/${generateSlugFromName(currentName)}`,
    };
  };

  // Enhanced form with hierarchical features
  const form = usePimForm({
    schema: taxonomyFormSchema,
    initialValues: {
      name: '',
      slug: '',
      type: TaxonomyType.CATEGORY,
      status: ContentStatus.DRAFT,
      copy: JSON.stringify(
        {
          description: '',
          metaTitle: '',
          metaDescription: '',
        },
        null,
        2,
      ),
      parentId: '',
      displayOrder: 0,
      level: 0,
      path: '',
    },
    asyncValidation: {
      name: asyncValidation.name,
      slug: asyncValidation.slug,
    },
    autoSave: {
      enabled: isEditing,
      delay: 3000,
      onSave: autoSaveTaxonomy,
    },
    transformOnSubmit: async (values) => {
      return {
        ...values,
        parentId: values.parentId || null,
        copy: values.copy ? JSON.parse(values.copy) : undefined,
      };
    },
    dirtyTracking: true,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  // Error handling
  const errorHandler = useFormErrors(form);

  // Form data
  const [parentTaxonomies, setParentTaxonomies] = useState<Taxonomy[]>([]);
  const [hierarchyPreview, setHierarchyPreview] = useState<string>('');

  // Auto-generate slug when name changes
  useEffect(() => {
    if (form.values.name && !form.isDirty) {
      const newSlug = generateSlugFromName(form.values.name);
      form.setFieldValue('slug', newSlug);
    }
  }, [form.values.name]);

  // Update hierarchy when parent changes
  useEffect(() => {
    if (form.values.parentId && form.values.name) {
      const hierarchy = calculateHierarchy(
        form.values.parentId,
        parentTaxonomies,
        form.values.name,
      );
      form.setFieldValue('level', hierarchy.level);
      form.setFieldValue('path', hierarchy.path);
      setHierarchyPreview(hierarchy.path);
    } else {
      form.setFieldValue('level', 0);
      form.setFieldValue('path', '');
      setHierarchyPreview('');
    }
  }, [form.values.parentId, form.values.name, parentTaxonomies]);

  // Load form options
  useEffect(() => {
    const loadFormData = withDataLoading('options', async () => {
      const result = await getTaxonomies({ limit: 100, hierarchical: true });
      if (result.success) {
        // Filter out the current taxonomy if editing to prevent circular references
        const availableParents = result.data.filter((t) => !taxonomy || t.id !== taxonomy.id);
        setParentTaxonomies(availableParents);
      }
    });

    if (opened) {
      loadFormData().catch(errorHandler.handleServerError);
    }
  }, [opened, taxonomy?.id, withDataLoading, errorHandler]);

  // Load existing taxonomy data
  useEffect(() => {
    if (taxonomy && opened) {
      form.setValues({
        name: isDuplicating ? `${taxonomy.name} (Copy)` : taxonomy.name,
        slug: isDuplicating ? '' : taxonomy.slug,
        type: taxonomy.type,
        status: isDuplicating ? 'DRAFT' : taxonomy.status,
        copy:
          typeof taxonomy.copy === 'string'
            ? taxonomy.copy
            : JSON.stringify(taxonomy.copy || {}, null, 2),
        parentId: taxonomy.parentId || '',
        displayOrder: (taxonomy as any).displayOrder || 0,
        level: (taxonomy as any).level || 0,
        path: (taxonomy as any).path || '',
      });

      if (!isDuplicating) {
        form.markAsSaved();
      }
    } else if (opened && !taxonomy) {
      form.reset();
    }
  }, [taxonomy, opened, isDuplicating, form]);

  // Submit handler
  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const data = {
        name: values.name,
        slug: values.slug,
        type: values.type,
        status: values.status,
        copy: values.copy ? JSON.parse(values.copy) : undefined,
        parentId: values.parentId || null,
        displayOrder: values.displayOrder,
        level: values.level,
        path: values.path,
      };

      const result = isEditing
        ? await updateTaxonomy(taxonomy!.id, data)
        : await createTaxonomy(data);

      if (!result.success) {
        throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} taxonomy`);
      }

      errorHandler.showSuccess(`Taxonomy ${isEditing ? 'updated' : 'created'} successfully`);
    } catch (error) {
      errorHandler.handleServerError(error);
      throw error;
    }
  });

  // Handle modal close with unsaved changes warning
  const handleClose = () => {
    if (form.warnUnsavedChanges()) {
      form.reset();
      onClose();
    }
  };

  const title = isDuplicating
    ? 'Duplicate Taxonomy'
    : isEditing
      ? 'Edit Taxonomy'
      : 'Create New Taxonomy';

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group>
          <IconHierarchy size={20} />
          <Title order={4}>{title}</Title>
          {form.isDirty && (
            <Badge color="orange" variant="light">
              Unsaved Changes
            </Badge>
          )}
          {form.isAutoSaving && (
            <Badge color="blue" variant="light">
              <IconDeviceFloppy size={12} />
              Auto-saving...
            </Badge>
          )}
        </Group>
      }
      size="lg"
      overlayProps={{ backgroundOpacity: 0.5 }}
    >
      {form.isDirty && (
        <Alert color="orange" mb="md">
          You have unsaved changes.
        </Alert>
      )}

      {errorHandler.hasNetworkErrors && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="red"
          mb="md"
          onClose={errorHandler.clearErrors}
          withCloseButton
        >
          Network error. Please check your connection and try again.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {/* Hierarchy Preview */}
          {hierarchyPreview && (
            <Card withBorder p="sm" bg="blue.0">
              <Group>
                <IconHierarchy size={16} />
                <Text size="sm" fw={500}>
                  Hierarchy Preview:
                </Text>
                <Text size="sm" c="dimmed" ff="mono">
                  {hierarchyPreview}
                </Text>
                <Badge size="sm" color="blue">
                  Level {form.values.level}
                </Badge>
              </Group>
            </Card>
          )}

          {/* Basic Information */}
          <Card withBorder p="lg">
            <Stack gap="md">
              <Text fw={600} size="lg">
                Basic Information
              </Text>

              <TextInput
                label="Taxonomy Name"
                placeholder="Enter descriptive name"
                required
                {...form.getInputProps('name')}
                onBlur={(e) => {
                  form.validateFieldAsync('name', e.target.value);
                  if (!form.values.slug) {
                    form.setFieldValue('slug', generateSlugFromName(e.target.value));
                  }
                }}
              />

              <TextInput
                label="Slug"
                placeholder="taxonomy-slug"
                description="URL-friendly identifier (auto-generated from name)"
                required
                {...form.getInputProps('slug')}
                onBlur={(e) => form.validateFieldAsync('slug', e.target.value)}
              />

              <Group grow>
                <Select
                  label="Type"
                  required
                  data={[
                    {
                      value: 'CATEGORY',
                      label: 'Category',
                      description: 'Hierarchical classification',
                    },
                    { value: 'TAG', label: 'Tag', description: 'Non-hierarchical labels' },
                    { value: 'ATTRIBUTE', label: 'Attribute', description: 'Product properties' },
                  ]}
                  {...form.getInputProps('type')}
                />
                <Select
                  label="Status"
                  required
                  data={[
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'PUBLISHED', label: 'Published' },
                    { value: 'ARCHIVED', label: 'Archived' },
                  ]}
                  {...form.getInputProps('status')}
                />
              </Group>
            </Stack>
          </Card>

          {/* Hierarchy Configuration */}
          <Card withBorder p="lg">
            <Stack gap="md">
              <Text fw={600} size="lg">
                Hierarchy Configuration
              </Text>

              {form.values.type === 'TAG' && (
                <Alert color="blue" icon={<IconAlertTriangle size={16} />}>
                  Tags cannot have parent taxonomies and remain flat structures.
                </Alert>
              )}

              <Select
                label="Parent Taxonomy"
                placeholder="Select parent taxonomy (optional)"
                description="Choose a parent to create a hierarchical structure"
                clearable
                searchable
                disabled={form.values.type === 'TAG' || isDataLoading}
                data={parentTaxonomies
                  .filter((t) => t.type === form.values.type) // Only same type can be parents
                  .map((t) => ({
                    value: t.id,
                    label: `${t.name} ${(t as any).level ? `(Level ${(t as any).level})` : ''}`,
                  }))}
                {...form.getInputProps('parentId')}
              />

              {form.values.level > 3 && form.values.type === 'CATEGORY' && (
                <Alert color="orange" icon={<IconAlertTriangle size={16} />}>
                  Categories with more than 3 levels may affect performance and usability.
                </Alert>
              )}
            </Stack>
          </Card>

          {/* Content & Metadata */}
          <Card withBorder p="lg">
            <Stack gap="md">
              <Text fw={600} size="lg">
                Content & Metadata
              </Text>

              <JsonInput
                label="Additional Data"
                placeholder={JSON.stringify(
                  {
                    description: 'Taxonomy description',
                    metaTitle: 'SEO title',
                    metaDescription: 'SEO description',
                    icon: 'icon-name',
                    color: '#color-code',
                  },
                  null,
                  2,
                )}
                description="JSON metadata for the taxonomy (description, SEO, styling)"
                autosize
                minRows={4}
                maxRows={10}
                validationError="Invalid JSON format"
                formatOnBlur
                {...form.getInputProps('copy')}
              />
            </Stack>
          </Card>

          <Divider />

          <Group justify="space-between">
            <Group>
              {form.isDirty && (
                <Button
                  variant="subtle"
                  leftSection={<IconRefresh size={16} />}
                  onClick={form.reset}
                >
                  Reset Changes
                </Button>
              )}
            </Group>

            <Group>
              <Button variant="subtle" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={form.isSubmitting}
                leftSection={<IconCheck size={16} />}
              >
                {isDuplicating ? 'Duplicate' : isEditing ? 'Update' : 'Create'} Taxonomy
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
