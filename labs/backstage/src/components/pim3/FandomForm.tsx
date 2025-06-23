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
  IconBook,
  IconCheck,
  IconDeviceFloppy,
  IconHash,
  IconInfoCircle,
  IconRefresh,
  IconSparkles,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { usePimForm } from '@/hooks/pim3/usePimForm';
import { useFandomValidation } from '@/hooks/pim3/useAsyncValidation';
import { useFormDataLoading } from '@/hooks/pim3/useFormLoading';
import {
  createFandomAction,
  updateFandomAction,
  getFandomAction,
  getFandomRelationshipsAction,
} from '@repo/database/prisma';

// Enhanced fandom schema
const fandomFormSchema = z.object({
  // Basic identification
  name: z.string().min(1, 'Fandom name is required').max(255, 'Name too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),

  // Fandom details
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
  description: z.string().optional(),
  genre: z.array(z.string()).default([]),
  creator: z.string().optional(),
  yearCreated: z.number().optional(),
  universe: z.string().optional(),
  mainThemes: z.array(z.string()).default([]),
  mediaTypes: z.array(z.string()).default([]),
  popularity: z.number().min(0).max(100).optional(),
  officialWebsite: z.string().url().optional().or(z.literal('')),
  wikiUrl: z.string().url().optional().or(z.literal('')),
  relatedFandoms: z.array(z.string()).default([]),
});

type FandomFormValues = z.infer<typeof fandomFormSchema>;

interface FandomFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  opened: boolean;
  fandomId?: string | null;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const GENRE_OPTIONS = [
  'Fantasy',
  'Science Fiction',
  'Horror',
  'Mystery',
  'Romance',
  'Adventure',
  'Drama',
  'Comedy',
  'Thriller',
  'Historical',
  'Superhero',
  'Anime/Manga',
  'Video Game',
  'Book Series',
  'Movie Franchise',
  'TV Series',
  'Comic Book',
  'Web Series',
  'Podcast',
  'Other',
];

const MEDIA_TYPE_OPTIONS = [
  'Books',
  'Movies',
  'TV Shows',
  'Video Games',
  'Comics',
  'Manga',
  'Anime',
  'Web Series',
  'Podcasts',
  'Board Games',
  'Card Games',
  'Merchandise',
  'Music',
  'Theater',
  'Other',
];

const THEME_OPTIONS = [
  'Good vs Evil',
  'Coming of Age',
  'Love & Friendship',
  'Power & Corruption',
  'Identity',
  'Family',
  'Redemption',
  'Sacrifice',
  'Survival',
  'Justice',
  'Technology',
  'Magic',
  'Time Travel',
  'Alternate Realities',
  'Prophecy',
  'War & Peace',
  'Nature',
  'Death & Rebirth',
  'Knowledge',
  'Freedom',
];

export function FandomForm({ onClose, onSuccess, opened, fandomId }: FandomFormProps) {
  const [activeTab, setActiveTab] = useState<string | null>('basic');

  const isEditing = !!fandomId;
  const asyncValidation = useFandomValidation(fandomId);

  const { options, loading: optionsLoading } = useFormDataLoading({
    allFandoms: () =>
      getFandomAction({ limit: 200 }).then((res) =>
        (res.data || []).filter((f: any) => f.id !== fandomId),
      ),
  });

  // Auto-save function
  const autoSaveFandom = async (values: FandomFormValues) => {
    if (!isEditing) return;

    const transformedValues = (await form.options.transformOnSubmit?.(values)) || values;
    await updateFandomAction({
      where: { id: fandomId! },
      data: transformedValues,
    });
  };

  const form = usePimForm({
    schema: fandomFormSchema,
    initialValues: {
      name: '',
      slug: '',
      isFictional: true,
      copy: '{}',
      description: '',
      genre: [],
      creator: '',
      yearCreated: undefined,
      universe: '',
      mainThemes: [],
      mediaTypes: [],
      popularity: undefined,
      officialWebsite: '',
      wikiUrl: '',
      relatedFandoms: [],
    },
    asyncValidation: {
      slug: asyncValidation.slug,
      name: asyncValidation.name,
    },
    autoSave: {
      enabled: isEditing,
      delay: 3000,
      onSave: autoSaveFandom,
    },
    crossFieldValidation: [
      {
        fields: ['yearCreated'],
        validator: ({ yearCreated }) => {
          if (yearCreated && (yearCreated < 1800 || yearCreated > new Date().getFullYear())) {
            return 'Year must be between 1800 and current year';
          }
          return null;
        },
        errorField: 'yearCreated',
      },
    ],
    watchers: {
      name: (name) => {
        if (name && !form.values.slug) {
          form.setFieldValue('slug', generateSlug(name));
        }
      },
      isFictional: (isFictional) => {
        // Clear non-fictional specific fields when switching to fictional
        if (isFictional && form.values.officialWebsite) {
          form.setFieldValue('officialWebsite', '');
        }
      },
    },
    persistence: {
      key: `fandom-form-${fandomId || 'new'}`,
      enabled: true,
      ttl: 2 * 60 * 60 * 1000, // 2 hours
    },
    transformOnSubmit: async (values) => {
      const copyData = {
        description: values.description,
        genre: values.genre,
        creator: values.creator,
        yearCreated: values.yearCreated,
        universe: values.universe,
        mainThemes: values.mainThemes,
        mediaTypes: values.mediaTypes,
        popularity: values.popularity,
        officialWebsite: values.officialWebsite,
        wikiUrl: values.wikiUrl,
        relatedFandoms: values.relatedFandoms,
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

  // Load fandom data when editing
  useEffect(() => {
    if (opened && isEditing && fandomId) {
      loadFandomData(fandomId);
    }
  }, [opened, isEditing, fandomId]);

  const loadFandomData = async (id: string) => {
    try {
      const [fandom, relationships] = await Promise.all([
        getFandomAction({ fandomId: id }),
        getFandomRelationshipsAction({ fandomId: id }),
      ]);

      if (fandom) {
        const copyData = (fandom.copy as any) || {};
        form.setValues({
          name: fandom.name,
          slug: fandom.slug,
          isFictional: fandom.isFictional,
          copy: JSON.stringify(fandom.copy || {}, null, 2),
          description: copyData.description || '',
          genre: copyData.genre || [],
          creator: copyData.creator || '',
          yearCreated: copyData.yearCreated || undefined,
          universe: copyData.universe || '',
          mainThemes: copyData.mainThemes || [],
          mediaTypes: copyData.mediaTypes || [],
          popularity: copyData.popularity || undefined,
          officialWebsite: copyData.officialWebsite || '',
          wikiUrl: copyData.wikiUrl || '',
          relatedFandoms: copyData.relatedFandoms || [],
        });
      }
    } catch (error) {
      console.error('Failed to load fandom:', error);
    }
  };

  const handleSubmit = form.handleSubmit(async (values: FandomFormValues) => {
    const action = isEditing ? updateFandomAction : createFandomAction;
    const payload = isEditing ? { where: { id: fandomId! }, data: values } : { data: values };

    return action(payload);
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group>
          <IconSparkles size={24} />
          <Title order={3}>{isEditing ? 'Edit Fandom' : 'Create Fandom'}</Title>
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
      <LoadingOverlay visible={form.isSubmitting || optionsLoading} />

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
            <Tabs.Tab value="basic" leftSection={<IconSparkles size={16} />}>
              Basic Info
            </Tabs.Tab>
            <Tabs.Tab value="details" leftSection={<IconInfoCircle size={16} />}>
              Details & Themes
            </Tabs.Tab>
            <Tabs.Tab value="media" leftSection={<IconBook size={16} />}>
              Media & Links
            </Tabs.Tab>
            <Tabs.Tab value="metadata" leftSection={<IconHash size={16} />}>
              Metadata
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Fandom Information</Title>

                  <TextInput
                    label="Fandom Name"
                    placeholder="Enter fandom name"
                    required
                    description="The name of the franchise, universe, or series"
                    {...form.getInputProps('name')}
                  />

                  <Group grow align="flex-end">
                    <TextInput
                      label="Slug"
                      placeholder="fandom-slug"
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

                  <Textarea
                    label="Description"
                    placeholder="Brief description of the fandom"
                    description="Overview of the franchise or universe"
                    minRows={3}
                    maxRows={6}
                    {...form.getInputProps('description')}
                  />

                  <Checkbox
                    label="Fictional Universe"
                    description="Check if this is a fictional universe, uncheck for real-world fandoms"
                    {...form.getInputProps('isFictional', { type: 'checkbox' })}
                  />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="details" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Creation Details</Title>

                  <TextInput
                    label="Creator/Author"
                    placeholder="e.g., J.K. Rowling, Marvel Studios"
                    description="Original creator or company"
                    {...form.getInputProps('creator')}
                  />

                  <Group grow>
                    <NumberInput
                      label="Year Created"
                      placeholder="e.g., 1997"
                      description="Year the fandom originated"
                      min={1800}
                      max={new Date().getFullYear()}
                      {...form.getInputProps('yearCreated')}
                    />

                    <NumberInput
                      label="Popularity Score"
                      placeholder="0-100"
                      description="Relative popularity (0-100)"
                      min={0}
                      max={100}
                      {...form.getInputProps('popularity')}
                    />
                  </Group>

                  <TextInput
                    label="Universe"
                    placeholder="e.g., Marvel Cinematic Universe, Wizarding World"
                    description="The broader universe this belongs to"
                    {...form.getInputProps('universe')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Genres & Themes</Title>

                  <MultiSelect
                    label="Genres"
                    placeholder="Select genres"
                    description="Primary genres for this fandom"
                    data={GENRE_OPTIONS}
                    searchable
                    clearable
                    {...form.getInputProps('genre')}
                  />

                  <MultiSelect
                    label="Main Themes"
                    placeholder="Select main themes"
                    description="Core themes explored in this fandom"
                    data={THEME_OPTIONS}
                    searchable
                    clearable
                    {...form.getInputProps('mainThemes')}
                  />

                  <MultiSelect
                    label="Media Types"
                    placeholder="Select media types"
                    description="Types of media this fandom spans"
                    data={MEDIA_TYPE_OPTIONS}
                    searchable
                    clearable
                    {...form.getInputProps('mediaTypes')}
                  />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="media" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>External Links</Title>

                  <TextInput
                    label="Official Website"
                    placeholder="https://example.com"
                    description="Official franchise website"
                    {...form.getInputProps('officialWebsite')}
                  />

                  <TextInput
                    label="Wiki/Fandom URL"
                    placeholder="https://fandom.wikia.com/wiki/..."
                    description="Link to fandom wiki or encyclopedia"
                    {...form.getInputProps('wikiUrl')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Related Fandoms</Title>

                  <MultiSelect
                    label="Related Fandoms"
                    placeholder="Select related fandoms"
                    description="Other fandoms that are connected or similar"
                    data={
                      options.allFandoms?.map((f: any) => ({
                        value: f.id,
                        label: f.name,
                      })) || []
                    }
                    searchable
                    clearable
                    {...form.getInputProps('relatedFandoms')}
                  />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="metadata" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Additional Metadata</Title>

                  <JsonInput
                    label="Fandom Metadata (JSON)"
                    placeholder='{\n  "totalWorks": 7,\n  "fanbaseSize": "millions",\n  "awards": ["Hugo Award"],\n  "adaptations": ["Movies", "TV", "Games"]\n}'
                    description="Store additional metadata as JSON"
                    formatOnBlur
                    autosize
                    minRows={8}
                    maxRows={20}
                    validationError="Invalid JSON format"
                    {...form.getInputProps('copy')}
                  />

                  <Group>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() =>
                        form.setFieldValue(
                          'copy',
                          JSON.stringify(
                            {
                              description: form.values.description,
                              genre: form.values.genre,
                              creator: form.values.creator,
                              yearCreated: form.values.yearCreated,
                              universe: form.values.universe,
                              mainThemes: form.values.mainThemes,
                              mediaTypes: form.values.mediaTypes,
                              popularity: form.values.popularity,
                              officialWebsite: form.values.officialWebsite,
                              wikiUrl: form.values.wikiUrl,
                              relatedFandoms: form.values.relatedFandoms,
                              totalWorks: 0,
                              fanbaseSize: '',
                              awards: [],
                              adaptations: [],
                            },
                            null,
                            2,
                          ),
                        )
                      }
                    >
                      Generate Template
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Divider my="md" />

        <Group justify="space-between">
          <Group>
            <Text size="sm" c="dimmed">
              {isEditing ? 'Updating fandom' : 'Creating new fandom'}
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
              {isEditing ? 'Update Fandom' : 'Create Fandom'}
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
