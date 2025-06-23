'use client';

import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  JsonInput,
  LoadingOverlay,
  Modal,
  MultiSelect,
  Stack,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconCheck,
  IconDeviceFloppy,
  IconHash,
  IconInfoCircle,
  IconRefresh,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { usePimForm } from '@/hooks/pim3/usePimForm';
import { useCastValidation } from '@/hooks/pim3/useAsyncValidation';
import { createCastAction, updateCastAction, getCastAction } from '@repo/database/prisma';

// Enhanced cast schema
const castFormSchema = z.object({
  // Basic identification
  name: z.string().min(1, 'Cast name is required').max(255, 'Name too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),

  // Cast details
  isFictional: z.boolean().default(true),

  // Content
  copy: z
    .string()
    .refine((val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, 'Must be valid JSON')
    .default('{}'),

  // Additional fields
  biography: z.string().optional(),
  role: z.string().optional(),
  characterName: z.string().optional(),
  appearances: z.array(z.string()).default([]),
  socialLinks: z.record(z.string()).default({}),
  images: z.array(z.string()).default([]),
  trivia: z.array(z.string()).default([]),
});

type CastFormValues = z.infer<typeof castFormSchema>;

interface CastFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  opened: boolean;
  castId?: string | null;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export function CastForm({ onClose, onSuccess, opened, castId }: CastFormProps) {
  const [activeTab, setActiveTab] = useState<string | null>('basic');

  const isEditing = !!castId;
  const asyncValidation = useCastValidation(castId);

  // Auto-save function
  const autoSaveCast = async (values: CastFormValues) => {
    if (!isEditing) return;

    const transformedValues = (await form.options.transformOnSubmit?.(values)) || values;
    await updateCastAction({
      where: { id: castId! },
      data: transformedValues,
    });
  };

  const form = usePimForm({
    schema: castFormSchema,
    initialValues: {
      name: '',
      slug: '',
      isFictional: true,
      copy: '{}',
      biography: '',
      role: '',
      characterName: '',
      appearances: [],
      socialLinks: {},
      images: [],
      trivia: [],
    },
    asyncValidation: {
      slug: asyncValidation.slug,
      name: asyncValidation.name,
    },
    autoSave: {
      enabled: isEditing,
      delay: 3000,
      onSave: autoSaveCast,
    },
    watchers: {
      name: (name) => {
        if (name && !form.values.slug) {
          form.setFieldValue('slug', generateSlug(name));
        }
      },
      isFictional: (isFictional) => {
        // Clear real-world specific fields when switching to fictional
        if (
          isFictional &&
          form.values.socialLinks &&
          Object.keys(form.values.socialLinks).length > 0
        ) {
          form.setFieldValue('socialLinks', {});
        }
      },
    },
    persistence: {
      key: `cast-form-${castId || 'new'}`,
      enabled: true,
      ttl: 2 * 60 * 60 * 1000, // 2 hours
    },
    transformOnSubmit: async (values) => {
      const copyData = {
        biography: values.biography,
        role: values.role,
        characterName: values.characterName,
        appearances: values.appearances,
        socialLinks: values.socialLinks,
        images: values.images,
        trivia: values.trivia,
      };

      return {
        name: values.name,
        slug: values.slug,
        isFictional: values.isFictional,
        copy: copyData,
      };
    },
    dirtyTracking: true,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  // Load cast data when editing
  useEffect(() => {
    if (opened && isEditing && castId) {
      loadCastData(castId);
    }
  }, [opened, isEditing, castId]);

  const loadCastData = async (id: string) => {
    try {
      const cast = await getCastAction({ castId: id });

      if (cast) {
        const copyData = (cast.copy as any) || {};
        form.setValues({
          name: cast.name,
          slug: cast.slug,
          isFictional: cast.isFictional,
          copy: JSON.stringify(cast.copy || {}, null, 2),
          biography: copyData.biography || '',
          role: copyData.role || '',
          characterName: copyData.characterName || '',
          appearances: copyData.appearances || [],
          socialLinks: copyData.socialLinks || {},
          images: copyData.images || [],
          trivia: copyData.trivia || [],
        });
      }
    } catch (error) {
      console.error('Failed to load cast:', error);
    }
  };

  const handleSubmit = form.handleSubmit(async (values: CastFormValues) => {
    const action = isEditing ? updateCastAction : createCastAction;
    const payload = isEditing ? { where: { id: castId! }, data: values } : { data: values };

    return action(payload);
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group>
          <IconUsers size={24} />
          <Title order={3}>{isEditing ? 'Edit Cast Member' : 'Create Cast Member'}</Title>
          {form.isDirty && (
            <Badge color="yellow" size="sm">
              Unsaved Changes
            </Badge>
          )}
          {form.isAutoSaving && (
            <Badge color="blue" size="sm">
              Auto-saving...
            </Badge>
          )}
        </Group>
      }
    >
      <LoadingOverlay visible={form.isSubmitting} />

      {/* Auto-save status */}
      {isEditing && (
        <Alert icon={<IconDeviceFloppy size={16} />} color="blue" variant="light" mb="md">
          <Group justify="space-between">
            <Text size="sm">Auto-save enabled</Text>
            {form.isDirty ? (
              <Badge color="yellow" size="sm">
                Changes pending
              </Badge>
            ) : (
              <Badge color="green" size="sm">
                Saved
              </Badge>
            )}
          </Group>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="basic" leftSection={<IconUser size={16} />}>
              Basic Info
            </Tabs.Tab>
            <Tabs.Tab value="details" leftSection={<IconInfoCircle size={16} />}>
              Details
            </Tabs.Tab>
            <Tabs.Tab value="media" leftSection={<IconHash size={16} />}>
              Media & Links
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Cast Member Information</Title>

                  <TextInput
                    label="Name"
                    placeholder="Enter cast member name"
                    required
                    description="Real name or character name"
                    {...form.getInputProps('name')}
                  />

                  <Group grow align="flex-end">
                    <TextInput
                      label="Slug"
                      placeholder="cast-member-slug"
                      required
                      description="URL-friendly identifier (auto-generated from name)"
                      {...form.getInputProps('slug')}
                    />
                    <Button
                      variant="light"
                      onClick={() => form.setFieldValue('slug', generateSlug(form.values.name))}
                      disabled={!form.values.name}
                    >
                      <IconRefresh size={16} />
                    </Button>
                  </Group>

                  <Checkbox
                    label="Fictional Character"
                    description="Check if this is a fictional character, uncheck for real people"
                    {...form.getInputProps('isFictional', { type: 'checkbox' })}
                  />

                  {form.values.isFictional && (
                    <TextInput
                      label="Character Name"
                      placeholder="Character name in the story"
                      description="The character this cast member portrays"
                      {...form.getInputProps('characterName')}
                    />
                  )}

                  <TextInput
                    label="Role"
                    placeholder="e.g., Main Character, Supporting Cast, Voice Actor"
                    description="Their role in the production"
                    {...form.getInputProps('role')}
                  />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="details" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Biography & Details</Title>

                  <Textarea
                    label="Biography"
                    placeholder="Brief biography or character description"
                    description="Background information about the cast member"
                    minRows={4}
                    maxRows={8}
                    {...form.getInputProps('biography')}
                  />

                  <MultiSelect
                    label="Appearances"
                    placeholder="Add appearances (movies, shows, episodes)"
                    description="List of appearances or episodes"
                    data={form.values.appearances}
                    searchable
                    creatable
                    clearable
                    {...form.getInputProps('appearances')}
                  />

                  <MultiSelect
                    label="Trivia"
                    placeholder="Add interesting facts"
                    description="Fun facts or trivia about the cast member"
                    data={form.values.trivia}
                    searchable
                    creatable
                    clearable
                    {...form.getInputProps('trivia')}
                  />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="media" pt="xs">
            <Stack>
              {!form.values.isFictional && (
                <Card>
                  <Stack>
                    <Title order={5}>Social Media Links</Title>
                    <Text size="sm" c="dimmed">
                      Add social media profiles for real cast members
                    </Text>

                    <TextInput
                      label="Twitter/X"
                      placeholder="https://twitter.com/username"
                      value={form.values.socialLinks.twitter || ''}
                      onChange={(e) =>
                        form.setFieldValue('socialLinks', {
                          ...form.values.socialLinks,
                          twitter: e.target.value,
                        })
                      }
                    />

                    <TextInput
                      label="Instagram"
                      placeholder="https://instagram.com/username"
                      value={form.values.socialLinks.instagram || ''}
                      onChange={(e) =>
                        form.setFieldValue('socialLinks', {
                          ...form.values.socialLinks,
                          instagram: e.target.value,
                        })
                      }
                    />

                    <TextInput
                      label="IMDb"
                      placeholder="https://imdb.com/name/nm0000000"
                      value={form.values.socialLinks.imdb || ''}
                      onChange={(e) =>
                        form.setFieldValue('socialLinks', {
                          ...form.values.socialLinks,
                          imdb: e.target.value,
                        })
                      }
                    />

                    <TextInput
                      label="Official Website"
                      placeholder="https://example.com"
                      value={form.values.socialLinks.website || ''}
                      onChange={(e) =>
                        form.setFieldValue('socialLinks', {
                          ...form.values.socialLinks,
                          website: e.target.value,
                        })
                      }
                    />
                  </Stack>
                </Card>
              )}

              <Card>
                <Stack>
                  <Title order={5}>Image URLs</Title>

                  <MultiSelect
                    label="Images"
                    placeholder="Add image URLs"
                    description="Profile pictures, headshots, or character images"
                    data={form.values.images}
                    searchable
                    creatable
                    clearable
                    {...form.getInputProps('images')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Additional Data</Title>

                  <JsonInput
                    label="Cast Metadata (JSON)"
                    placeholder='{\n  "awards": ["Emmy", "Golden Globe"],\n  "birthDate": "1980-01-01"\n}'
                    description="Store additional metadata as JSON"
                    formatOnBlur
                    autosize
                    minRows={6}
                    maxRows={15}
                    validationError="Invalid JSON format"
                    {...form.getInputProps('copy')}
                  />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Divider my="md" />

        <Group justify="space-between">
          <Group>
            <Text size="sm" c="dimmed">
              {isEditing ? 'Updating cast member' : 'Creating new cast member'}
            </Text>
            {form.isDirty && (
              <Badge color="yellow" size="sm">
                Unsaved changes
              </Badge>
            )}
          </Group>

          <Group>
            <Button
              variant="light"
              onClick={() => {
                if (form.isDirty && !form.warnUnsavedChanges()) {
                  return;
                }
                onClose();
              }}
            >
              Cancel
            </Button>

            <Button type="submit" loading={form.isSubmitting} leftSection={<IconCheck size={16} />}>
              {isEditing ? 'Update Cast' : 'Create Cast'}
            </Button>
          </Group>
        </Group>

        {/* Show validation errors */}
        {Object.keys(form.errors).length > 0 && (
          <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light" mt="md">
            <Text size="sm" fw={500}>
              Please fix the following errors:
            </Text>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem' }}>
              {Object.entries(form.errors).map(([field, error]) => (
                <li key={field}>
                  <Text size="sm">
                    {field}: {error}
                  </Text>
                </li>
              ))}
            </ul>
          </Alert>
        )}
      </form>
    </Modal>
  );
}
