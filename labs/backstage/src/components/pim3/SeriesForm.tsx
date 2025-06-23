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
import { useSeriesValidation } from '@/hooks/pim3/useAsyncValidation';
import { useFormDataLoading } from '@/hooks/pim3/useFormLoading';
import {
  createSeriesAction,
  updateSeriesAction,
  getSeriesAction,
  getSeriesRelationshipsAction,
  getFandomsAction,
  SeriesStatus,
} from '@repo/database/prisma';

// Enhanced series schema
const seriesFormSchema = z.object({
  // Basic identification
  name: z.string().min(1, 'Series name is required').max(255, 'Name too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),

  // Series details
  fandomId: z.string().min(1, 'Fandom is required'),
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
  seriesType: z.string().optional(), // Book series, TV series, Movie series, etc.
  totalWorks: z.number().min(0).optional(),
  startYear: z.number().optional(),
  endYear: z.number().optional(),
  status: z.nativeEnum(SeriesStatus).default(SeriesStatus.ONGOING),
  chronology: z.string().optional(), // Reading/viewing order notes
  alternativeNames: z.array(z.string()).default([]),
  relatedSeries: z.array(z.string()).default([]),
});

type SeriesFormValues = z.infer<typeof seriesFormSchema>;

interface SeriesFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  opened: boolean;
  seriesId?: string | null;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const SERIES_TYPE_OPTIONS = [
  'Book Series',
  'TV Series',
  'Movie Series',
  'Comic Series',
  'Video Game Series',
  'Anthology Series',
  'Spin-off Series',
  'Prequel Series',
  'Sequel Series',
  'Reboot Series',
  'Other',
];

export function SeriesForm({ onClose, onSuccess, opened, seriesId }: SeriesFormProps) {
  const [activeTab, setActiveTab] = useState<string | null>('basic');
  const [selectedFandom, setSelectedFandom] = useState<any>(null);

  const isEditing = !!seriesId;
  const asyncValidation = useSeriesValidation(seriesId);

  const { options, loading: optionsLoading } = useFormDataLoading({
    fandoms: () => getFandomsAction({ limit: 200 }),
    allSeries: () =>
      getSeriesAction({ limit: 200 }).then((res) =>
        (res.data || []).filter((s: any) => s.id !== seriesId),
      ),
  });

  // Auto-save function
  const autoSaveSeries = async (values: SeriesFormValues) => {
    if (!isEditing) return;

    const transformedValues = (await form.options.transformOnSubmit?.(values)) || values;
    await updateSeriesAction({
      where: { id: seriesId! },
      data: transformedValues,
    });
  };

  const form = usePimForm({
    schema: seriesFormSchema,
    initialValues: {
      name: '',
      slug: '',
      fandomId: '',
      displayOrder: 0,
      isFictional: true,
      copy: '{}',
      description: '',
      seriesType: '',
      totalWorks: undefined,
      startYear: undefined,
      endYear: undefined,
      status: SeriesStatus.ONGOING,
      chronology: '',
      alternativeNames: [],
      relatedSeries: [],
    },
    asyncValidation: {
      slug: asyncValidation.slug,
      name: asyncValidation.name,
    },
    autoSave: {
      enabled: isEditing,
      delay: 3000,
      onSave: autoSaveSeries,
    },
    crossFieldValidation: [
      {
        fields: ['startYear', 'endYear'],
        validator: ({ startYear, endYear }) => {
          if (startYear && endYear && endYear < startYear) {
            return 'End year must be after start year';
          }
          return null;
        },
        errorField: 'endYear',
      },
      {
        fields: ['status', 'endYear'],
        validator: ({ status, endYear }) => {
          if (status === 'COMPLETED' && !endYear) {
            return 'Completed series should have an end year';
          }
          return null;
        },
        errorField: 'endYear',
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
      },
      status: (status) => {
        // Auto-set end year for completed series
        if (status === 'COMPLETED' && !form.values.endYear) {
          form.setFieldValue('endYear', new Date().getFullYear());
        }
      },
    },
    persistence: {
      key: `series-form-${seriesId || 'new'}`,
      enabled: true,
      ttl: 2 * 60 * 60 * 1000, // 2 hours
    },
    transformOnSubmit: async (values) => {
      const copyData = {
        description: values.description,
        seriesType: values.seriesType,
        totalWorks: values.totalWorks,
        startYear: values.startYear,
        endYear: values.endYear,
        status: values.status,
        chronology: values.chronology,
        alternativeNames: values.alternativeNames,
        relatedSeries: values.relatedSeries,
      };

      return {
        name: values.name,
        slug: values.slug,
        fandomId: values.fandomId,
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

  // Load series data when editing
  useEffect(() => {
    if (opened && isEditing && seriesId) {
      loadSeriesData(seriesId);
    }
  }, [opened, isEditing, seriesId]);

  const loadSeriesData = async (id: string) => {
    try {
      const [series, relationships] = await Promise.all([
        getSeriesAction({ seriesId: id }),
        getSeriesRelationshipsAction({ seriesId: id }),
      ]);

      if (series) {
        const copyData = (series.copy as any) || {};
        form.setValues({
          name: series.name,
          slug: series.slug,
          fandomId: series.fandomId,
          displayOrder: series.displayOrder || 0,
          isFictional: series.isFictional,
          copy: JSON.stringify(series.copy || {}, null, 2),
          description: copyData.description || '',
          seriesType: copyData.seriesType || '',
          totalWorks: copyData.totalWorks || undefined,
          startYear: copyData.startYear || undefined,
          endYear: copyData.endYear || undefined,
          status: copyData.status || 'ONGOING',
          chronology: copyData.chronology || '',
          alternativeNames: copyData.alternativeNames || [],
          relatedSeries: copyData.relatedSeries || [],
        });
      }
    } catch (error) {
      console.error('Failed to load series:', error);
    }
  };

  const handleSubmit = form.handleSubmit(async (values: SeriesFormValues) => {
    const action = isEditing ? updateSeriesAction : createSeriesAction;
    const payload = isEditing ? { where: { id: seriesId! }, data: values } : { data: values };

    return action(payload);
  });

  const currentYear = new Date().getFullYear();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group>
          <IconBookmarks size={24} />
          <Title order={3}>{isEditing ? 'Edit Series' : 'Create Series'}</Title>
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
              Series Details
            </Tabs.Tab>
            <Tabs.Tab value="chronology" leftSection={<IconSortAscending size={16} />}>
              Chronology
            </Tabs.Tab>
            <Tabs.Tab value="metadata" leftSection={<IconHash size={16} />}>
              Metadata
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Series Information</Title>

                  <Select
                    label="Fandom"
                    placeholder="Select the fandom this series belongs to"
                    required
                    description="The universe or franchise this series is part of"
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

                  <TextInput
                    label="Series Name"
                    placeholder="Enter series name"
                    required
                    description="The name of the series within the fandom"
                    {...form.getInputProps('name')}
                  />

                  <Group grow align="flex-end">
                    <TextInput
                      label="Slug"
                      placeholder="series-slug"
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
                    placeholder="Brief description of the series"
                    description="Overview of what this series contains"
                    minRows={3}
                    maxRows={6}
                    {...form.getInputProps('description')}
                  />

                  <Group grow>
                    <Select
                      label="Series Type"
                      placeholder="Select series type"
                      data={SERIES_TYPE_OPTIONS}
                      searchable
                      clearable
                      {...form.getInputProps('seriesType')}
                    />

                    <NumberInput
                      label="Display Order"
                      placeholder="0"
                      description="Order within the fandom"
                      min={0}
                      {...form.getInputProps('displayOrder')}
                    />
                  </Group>

                  <Checkbox
                    label="Fictional Series"
                    description="Check if this is a fictional series, uncheck for real-world series"
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
                  <Title order={5}>Series Status</Title>

                  <Select
                    label="Status"
                    required
                    description="Current status of the series"
                    data={[
                      { value: 'ONGOING', label: 'Ongoing' },
                      { value: 'COMPLETED', label: 'Completed' },
                      { value: 'HIATUS', label: 'On Hiatus' },
                      { value: 'CANCELLED', label: 'Cancelled' },
                      { value: 'PLANNED', label: 'Planned' },
                    ]}
                    {...form.getInputProps('status')}
                  />

                  <Group grow>
                    <NumberInput
                      label="Start Year"
                      placeholder="e.g., 1997"
                      description="Year the series began"
                      min={1800}
                      max={currentYear + 10}
                      {...form.getInputProps('startYear')}
                    />

                    <NumberInput
                      label="End Year"
                      placeholder="e.g., 2007"
                      description="Year the series ended (if applicable)"
                      min={1800}
                      max={currentYear + 10}
                      {...form.getInputProps('endYear')}
                    />
                  </Group>

                  <NumberInput
                    label="Total Works"
                    placeholder="Number of books/episodes/movies"
                    description="Total number of works in the series"
                    min={0}
                    {...form.getInputProps('totalWorks')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Alternative Names</Title>

                  <MultiSelect
                    label="Alternative Names"
                    placeholder="Add alternative or translated names"
                    description="Other names this series is known by"
                    data={form.values.alternativeNames}
                    searchable
                    creatable
                    clearable
                    {...form.getInputProps('alternativeNames')}
                  />
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="chronology" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Chronological Information</Title>

                  <Textarea
                    label="Chronology Notes"
                    placeholder="Describe the reading/viewing order, timeline, etc."
                    description="Notes about the chronological order of the series"
                    minRows={4}
                    maxRows={10}
                    {...form.getInputProps('chronology')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Related Series</Title>

                  <MultiSelect
                    label="Related Series"
                    placeholder="Select related series"
                    description="Other series that are connected (prequels, sequels, spin-offs)"
                    data={
                      options.allSeries?.map((s: any) => ({
                        value: s.id,
                        label: `${s.name} (${s.fandom?.name || 'Unknown Fandom'})`,
                      })) || []
                    }
                    searchable
                    clearable
                    {...form.getInputProps('relatedSeries')}
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
                    label="Series Metadata (JSON)"
                    placeholder='{\n  "genre": ["Fantasy", "Adventure"],\n  "awards": ["Hugo Award"],\n  "publisher": "Publisher Name",\n  "language": "English"\n}'
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
                              seriesType: form.values.seriesType,
                              totalWorks: form.values.totalWorks,
                              startYear: form.values.startYear,
                              endYear: form.values.endYear,
                              status: form.values.status,
                              chronology: form.values.chronology,
                              alternativeNames: form.values.alternativeNames,
                              relatedSeries: form.values.relatedSeries,
                              genre: [],
                              awards: [],
                              publisher: '',
                              language: '',
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
              {isEditing ? 'Updating series' : 'Creating new series'}
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
              {isEditing ? 'Update Series' : 'Create Series'}
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
