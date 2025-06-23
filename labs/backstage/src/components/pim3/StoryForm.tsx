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
  NumberInput,
  Select,
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
  IconBookmarks,
  IconCheck,
  IconDeviceFloppy,
  IconHash,
  IconInfoCircle,
  IconRefresh,
  IconSortAscending,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { usePimForm } from '@/hooks/pim3/usePimForm';
import { useStoryValidation } from '@/hooks/pim3/useAsyncValidation';
import { useFormDataLoading } from '@/hooks/pim3/useFormLoading';
import {
  createStoryAction,
  updateStoryAction,
  getStoryAction,
  getStoryRelationshipsAction,
  getFandomsAction,
  getSeriesAction,
  LengthUnit,
} from '@repo/database/prisma';

// Enhanced story schema
const storyFormSchema = z
  .object({
    // Basic identification
    name: z.string().min(1, 'Story name is required').max(255, 'Name too long'),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .max(100, 'Slug too long')
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),

    // Story details - Story can belong to either a Series or directly to a Fandom
    fandomId: z.string().min(1, 'Fandom is required'),
    seriesId: z.string().optional(),
    displayOrder: z.number().min(0).default(0),
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
    storyType: z.string().optional(), // Book, Chapter, Episode, Movie, Short Story, etc.
    originalPublishDate: z.string().optional(), // ISO date string
    length: z.number().min(0).optional(), // Pages, words, or runtime
    lengthUnit: z.nativeEnum(LengthUnit).optional(),
    previousStory: z.string().optional(), // ID of previous story in sequence
    nextStory: z.string().optional(), // ID of next story in sequence
    summary: z.string().optional(),
    themes: z.array(z.string()).default([]),
    contentWarnings: z.array(z.string()).default([]),
    alternativeTitles: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      // Validate length unit is set when length is provided
      if (data.length && !data.lengthUnit) {
        return false;
      }
      return true;
    },
    {
      message: 'Length unit is required when length is specified',
      path: ['lengthUnit'],
    },
  );

type StoryFormValues = z.infer<typeof storyFormSchema>;

interface StoryFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  opened: boolean;
  storyId?: string | null;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const STORY_TYPE_OPTIONS = [
  'Book',
  'Chapter',
  'Episode',
  'Movie',
  'Short Story',
  'Novella',
  'Comic Issue',
  'Web Chapter',
  'Audio Episode',
  'One-shot',
  'Special',
  'Bonus Chapter',
  'Side Story',
  'Other',
];

const THEME_OPTIONS = [
  'Adventure',
  'Mystery',
  'Romance',
  'Action',
  'Drama',
  'Comedy',
  'Tragedy',
  'Coming of Age',
  'Redemption',
  'Betrayal',
  'Friendship',
  'Love',
  'Loss',
  'Hope',
  'Survival',
  'Power',
  'Corruption',
  'Justice',
  'Revenge',
  'Sacrifice',
];

const CONTENT_WARNING_OPTIONS = [
  'Violence',
  'Death',
  'Gore',
  'Sexual Content',
  'Language',
  'Drug Use',
  'Alcohol',
  'Mental Health',
  'Suicide',
  'Abuse',
  'Trauma',
  'Horror',
  'Body Horror',
  'Disturbing Content',
  'Spoilers',
];

export function StoryForm({ onClose, onSuccess, opened, storyId }: StoryFormProps) {
  const [activeTab, setActiveTab] = useState<string | null>('basic');
  const [selectedFandom, setSelectedFandom] = useState<any>(null);
  const [selectedSeries, setSelectedSeries] = useState<any>(null);

  const isEditing = !!storyId;
  const asyncValidation = useStoryValidation(storyId);

  const { options, loading: optionsLoading } = useFormDataLoading({
    fandoms: () => getFandomsAction({ limit: 200 }),
    allSeries: () => getSeriesAction({ limit: 200 }),
    allStories: () =>
      getStoryAction({ limit: 200 }).then((res) =>
        (res.data || []).filter((s: any) => s.id !== storyId),
      ),
  });

  // Auto-save function
  const autoSaveStory = async (values: StoryFormValues) => {
    if (!isEditing) return;

    const transformedValues = (await form.options.transformOnSubmit?.(values)) || values;
    await updateStoryAction({
      where: { id: storyId! },
      data: transformedValues,
    });
  };

  const form = usePimForm({
    schema: storyFormSchema,
    initialValues: {
      name: '',
      slug: '',
      fandomId: '',
      seriesId: undefined,
      displayOrder: 0,
      isFictional: true,
      copy: '{}',
      description: '',
      storyType: '',
      originalPublishDate: '',
      length: undefined,
      lengthUnit: undefined,
      previousStory: '',
      nextStory: '',
      summary: '',
      themes: [],
      contentWarnings: [],
      alternativeTitles: [],
    },
    asyncValidation: {
      slug: asyncValidation.slug,
      name: asyncValidation.name,
    },
    autoSave: {
      enabled: isEditing,
      delay: 3000,
      onSave: autoSaveStory,
    },
    crossFieldValidation: [
      {
        fields: ['length', 'lengthUnit'],
        validator: ({ length, lengthUnit }) => {
          if (length && !lengthUnit) {
            return 'Please specify the unit for the length';
          }
          return null;
        },
        errorField: 'lengthUnit',
      },
      {
        fields: ['previousStory', 'nextStory'],
        validator: ({ previousStory, nextStory }) => {
          if (previousStory && nextStory && previousStory === nextStory) {
            return 'Previous and next story cannot be the same';
          }
          return null;
        },
        errorField: 'nextStory',
      },
    ],
    watchers: {
      name: (name) => {
        if (name && !form.values.slug) {
          form.setFieldValue('slug', generateSlug(name));
        }
      },
      fandomId: (fandomId) => {
        // Update selected fandom info
        const fandom = options.fandoms?.find((f: any) => f.id === fandomId);
        setSelectedFandom(fandom);

        // Clear series if changing fandom
        if (fandomId !== selectedFandom?.id) {
          form.setFieldValue('seriesId', undefined);
          setSelectedSeries(null);
        }
      },
      seriesId: (seriesId) => {
        // Update selected series info
        const series = options.allSeries?.find((s: any) => s.id === seriesId);
        setSelectedSeries(series);

        // Auto-set fandom from series
        if (series && series.fandomId !== form.values.fandomId) {
          form.setFieldValue('fandomId', series.fandomId);
        }
      },
      storyType: (storyType) => {
        // Auto-set length unit based on story type
        if (storyType === 'Episode' || storyType === 'Movie' || storyType === 'Audio Episode') {
          form.setFieldValue('lengthUnit', 'minutes');
        } else if (storyType === 'Book' || storyType === 'Novella') {
          form.setFieldValue('lengthUnit', 'pages');
        } else if (
          storyType === 'Chapter' ||
          storyType === 'Short Story' ||
          storyType === 'Web Chapter'
        ) {
          form.setFieldValue('lengthUnit', 'words');
        }
      },
    },
    persistence: {
      key: `story-form-${storyId || 'new'}`,
      enabled: true,
      ttl: 2 * 60 * 60 * 1000, // 2 hours
    },
    transformOnSubmit: async (values) => {
      const copyData = {
        description: values.description,
        storyType: values.storyType,
        originalPublishDate: values.originalPublishDate,
        length: values.length,
        lengthUnit: values.lengthUnit,
        previousStory: values.previousStory,
        nextStory: values.nextStory,
        summary: values.summary,
        themes: values.themes,
        contentWarnings: values.contentWarnings,
        alternativeTitles: values.alternativeTitles,
      };

      return {
        name: values.name,
        slug: values.slug,
        fandomId: values.fandomId,
        seriesId: values.seriesId || null,
        displayOrder: values.displayOrder,
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

  // Load story data when editing
  useEffect(() => {
    if (opened && isEditing && storyId) {
      loadStoryData(storyId);
    }
  }, [opened, isEditing, storyId]);

  const loadStoryData = async (id: string) => {
    try {
      const [story, relationships] = await Promise.all([
        getStoryAction({ storyId: id }),
        getStoryRelationshipsAction({ storyId: id }),
      ]);

      if (story) {
        const copyData = (story.copy as any) || {};
        form.setValues({
          name: story.name,
          slug: story.slug,
          fandomId: story.fandomId,
          seriesId: story.seriesId || undefined,
          displayOrder: story.displayOrder || 0,
          isFictional: story.isFictional,
          copy: JSON.stringify(story.copy || {}, null, 2),
          description: copyData.description || '',
          storyType: copyData.storyType || '',
          originalPublishDate: copyData.originalPublishDate || '',
          length: copyData.length || undefined,
          lengthUnit: copyData.lengthUnit || undefined,
          previousStory: copyData.previousStory || '',
          nextStory: copyData.nextStory || '',
          summary: copyData.summary || '',
          themes: copyData.themes || [],
          contentWarnings: copyData.contentWarnings || [],
          alternativeTitles: copyData.alternativeTitles || [],
        });
      }
    } catch (error) {
      console.error('Failed to load story:', error);
    }
  };

  const handleSubmit = form.handleSubmit(async (values: StoryFormValues) => {
    const action = isEditing ? updateStoryAction : createStoryAction;
    const payload = isEditing ? { where: { id: storyId! }, data: values } : { data: values };

    return action(payload);
  });

  // Filter series by selected fandom
  const availableSeries = selectedFandom
    ? options.allSeries?.filter((s: any) => s.fandomId === selectedFandom.id) || []
    : [];

  // Filter stories for sequence selection
  const availableStories =
    options.allStories?.filter((s: any) => {
      // Only show stories from same fandom
      if (form.values.fandomId && s.fandomId !== form.values.fandomId) return false;
      // If series is selected, only show stories from same series
      if (form.values.seriesId && s.seriesId !== form.values.seriesId) return false;
      return true;
    }) || [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group>
          <IconBook size={24} />
          <Title order={3}>{isEditing ? 'Edit Story' : 'Create Story'}</Title>
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
            <Tabs.Tab value="basic" leftSection={<IconBook size={16} />}>
              Basic Info
            </Tabs.Tab>
            <Tabs.Tab value="details" leftSection={<IconInfoCircle size={16} />}>
              Story Details
            </Tabs.Tab>
            <Tabs.Tab value="sequence" leftSection={<IconSortAscending size={16} />}>
              Sequence & Order
            </Tabs.Tab>
            <Tabs.Tab value="content" leftSection={<IconBookmarks size={16} />}>
              Content & Themes
            </Tabs.Tab>
            <Tabs.Tab value="metadata" leftSection={<IconHash size={16} />}>
              Metadata
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Story Information</Title>

                  <Select
                    label="Fandom"
                    placeholder="Select the fandom this story belongs to"
                    required
                    description="The universe or franchise this story is part of"
                    data={
                      options.fandoms?.map((f: any) => ({
                        value: f.id,
                        label: `${f.name} ${f.isFictional ? '(Fictional)' : '(Real)'}`,
                      })) || []
                    }
                    searchable
                    {...form.getInputProps('fandomId')}
                  />

                  {selectedFandom && (
                    <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                      <Text size="sm">
                        Part of <strong>{selectedFandom.name}</strong> universe
                      </Text>
                    </Alert>
                  )}

                  <Select
                    label="Series"
                    placeholder="Select series (optional)"
                    description="The series within the fandom (leave empty for standalone stories)"
                    data={availableSeries.map((s: any) => ({
                      value: s.id,
                      label: s.name,
                    }))}
                    searchable
                    clearable
                    disabled={!selectedFandom}
                    {...form.getInputProps('seriesId')}
                  />

                  {selectedSeries && (
                    <Alert icon={<IconBookmarks size={16} />} color="green" variant="light">
                      <Text size="sm">
                        Part of <strong>{selectedSeries.name}</strong> series
                      </Text>
                    </Alert>
                  )}

                  <TextInput
                    label="Story Title"
                    placeholder="Enter story title"
                    required
                    description="The title of the story, chapter, or episode"
                    {...form.getInputProps('name')}
                  />

                  <Group grow align="flex-end">
                    <TextInput
                      label="Slug"
                      placeholder="story-slug"
                      required
                      description="URL-friendly identifier (auto-generated from title)"
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
                    label="Fictional Story"
                    description="Check if this is a fictional story, uncheck for non-fiction"
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
                  <Title order={5}>Story Type & Length</Title>

                  <Select
                    label="Story Type"
                    placeholder="Select story type"
                    data={STORY_TYPE_OPTIONS}
                    searchable
                    clearable
                    {...form.getInputProps('storyType')}
                  />

                  <Group grow>
                    <NumberInput
                      label="Length"
                      placeholder="Story length"
                      description="Length in pages, words, minutes, or episodes"
                      min={0}
                      {...form.getInputProps('length')}
                    />

                    <Select
                      label="Length Unit"
                      placeholder="Select unit"
                      data={[
                        { value: 'pages', label: 'Pages' },
                        { value: 'words', label: 'Words' },
                        { value: 'minutes', label: 'Minutes' },
                        { value: 'episodes', label: 'Episodes' },
                      ]}
                      {...form.getInputProps('lengthUnit')}
                    />
                  </Group>

                  <TextInput
                    label="Original Publish Date"
                    placeholder="YYYY-MM-DD"
                    description="When the story was first published"
                    {...form.getInputProps('originalPublishDate')}
                  />

                  <Textarea
                    label="Description"
                    placeholder="Brief description of the story"
                    description="A short overview without spoilers"
                    minRows={3}
                    maxRows={6}
                    {...form.getInputProps('description')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Alternative Titles</Title>

                  <MultiSelect
                    label="Alternative Titles"
                    placeholder="Add alternative or translated titles"
                    description="Other names this story is known by"
                    data={form.values.alternativeTitles}
                    searchable
                    creatable
                    clearable
                    {...form.getInputProps('alternativeTitles')}
                  />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="sequence" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Story Order</Title>

                  <NumberInput
                    label="Display Order"
                    placeholder="0"
                    description="Order within the series or fandom"
                    min={0}
                    {...form.getInputProps('displayOrder')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Story Sequence</Title>
                  <Text size="sm" c="dimmed">
                    Link to previous and next stories in the sequence
                  </Text>

                  <Select
                    label="Previous Story"
                    placeholder="Select previous story in sequence"
                    description="The story that comes before this one"
                    data={availableStories.map((s: any) => ({
                      value: s.id,
                      label: `${s.name} ${s.series ? `(${s.series.name})` : '(Standalone)'}`,
                    }))}
                    searchable
                    clearable
                    {...form.getInputProps('previousStory')}
                  />

                  <Select
                    label="Next Story"
                    placeholder="Select next story in sequence"
                    description="The story that comes after this one"
                    data={availableStories.map((s: any) => ({
                      value: s.id,
                      label: `${s.name} ${s.series ? `(${s.series.name})` : '(Standalone)'}`,
                    }))}
                    searchable
                    clearable
                    {...form.getInputProps('nextStory')}
                  />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="content" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Summary</Title>

                  <Textarea
                    label="Story Summary"
                    placeholder="Detailed summary of the story (may contain spoilers)"
                    description="A comprehensive summary for reference"
                    minRows={5}
                    maxRows={12}
                    {...form.getInputProps('summary')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Themes & Content</Title>

                  <MultiSelect
                    label="Themes"
                    placeholder="Select themes"
                    description="Major themes explored in this story"
                    data={THEME_OPTIONS}
                    searchable
                    clearable
                    {...form.getInputProps('themes')}
                  />

                  <MultiSelect
                    label="Content Warnings"
                    placeholder="Select content warnings"
                    description="Content that readers should be aware of"
                    data={CONTENT_WARNING_OPTIONS}
                    searchable
                    clearable
                    {...form.getInputProps('contentWarnings')}
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
                    label="Story Metadata (JSON)"
                    placeholder='{
  "chapters": 12,
  "pointOfView": "Third Person",
  "narrator": "Character Name",
  "setting": "Victorian London",
  "timeline": "1890s",
  "awards": ["Hugo Award"],
  "adaptations": ["TV", "Film"],
  "trivia": ["Based on true events"]
}'
                    description="Store additional metadata as JSON"
                    formatOnBlur
                    autosize
                    minRows={10}
                    maxRows={25}
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
                              storyType: form.values.storyType,
                              originalPublishDate: form.values.originalPublishDate,
                              length: form.values.length,
                              lengthUnit: form.values.lengthUnit,
                              previousStory: form.values.previousStory,
                              nextStory: form.values.nextStory,
                              summary: form.values.summary,
                              themes: form.values.themes,
                              contentWarnings: form.values.contentWarnings,
                              alternativeTitles: form.values.alternativeTitles,
                              chapters: 0,
                              pointOfView: '',
                              narrator: '',
                              setting: '',
                              timeline: '',
                              awards: [],
                              adaptations: [],
                              trivia: [],
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
              {isEditing ? 'Updating story' : 'Creating new story'}
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
              {isEditing ? 'Update Story' : 'Create Story'}
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
