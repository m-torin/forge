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
  IconBed,
  IconCheck,
  IconDeviceFloppy,
  IconHash,
  IconInfoCircle,
  IconMap,
  IconMapPin,
  IconRefresh,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { usePimForm } from '@/hooks/pim3/usePimForm';
import { useLocationValidation } from '@/hooks/pim3/useAsyncValidation';
import { useFormDataLoading } from '@/hooks/pim3/useFormLoading';
import {
  createLocationAction,
  updateLocationAction,
  getLocationAction,
  getLocationRelationshipsAction,
  getFandomsAction,
  LocationType,
  LodgingType,
} from '@repo/database/prisma';

// Enhanced location schema
const locationFormSchema = z
  .object({
    // Basic identification
    name: z.string().min(1, 'Location name is required').max(255, 'Name too long'),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .max(100, 'Slug too long')
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),

    // Location details
    locationType: z.nativeEnum(LocationType).default(LocationType.PLACE),
    lodgingType: z.nativeEnum(LodgingType).optional(),
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
    address: z.string().optional(),
    coordinates: z
      .object({
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
      })
      .optional(),
    capacity: z.number().min(0).optional(),
    amenities: z.array(z.string()).default([]),
    operatingHours: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    phoneNumber: z.string().optional(),
    priceRange: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    fandomIds: z.array(z.string()).default([]),
  })
  .refine(
    (data) => {
      // Validate lodging type is only set when location type is LODGING
      if (data.locationType !== 'LODGING' && data.lodgingType) {
        return false;
      }
      return true;
    },
    {
      message: 'Lodging type can only be set for LODGING locations',
      path: ['lodgingType'],
    },
  );

type LocationFormValues = z.infer<typeof locationFormSchema>;

interface LocationFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  opened: boolean;
  locationId?: string | null;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const AMENITIES_OPTIONS = [
  'WiFi',
  'Parking',
  'Pool',
  'Restaurant',
  'Bar',
  'Gym',
  'Spa',
  'Beach Access',
  'Pet Friendly',
  'Business Center',
  'Concierge',
  'Room Service',
  'Shuttle Service',
  'Kitchen',
  'Air Conditioning',
  'Heating',
  'Laundry',
  'Entertainment',
  'Gift Shop',
  'ATM',
];

export function LocationForm({ onClose, onSuccess, opened, locationId }: LocationFormProps) {
  const [activeTab, setActiveTab] = useState<string | null>('basic');

  const isEditing = !!locationId;
  const asyncValidation = useLocationValidation(locationId);

  const { options, loading: optionsLoading } = useFormDataLoading({
    fandoms: () => getFandomsAction({ limit: 200 }),
  });

  // Auto-save function
  const autoSaveLocation = async (values: LocationFormValues) => {
    if (!isEditing) return;

    const transformedValues = (await form.options.transformOnSubmit?.(values)) || values;
    await updateLocationAction({
      where: { id: locationId! },
      data: transformedValues,
    });
  };

  const form = usePimForm({
    schema: locationFormSchema,
    initialValues: {
      name: '',
      slug: '',
      locationType: 'PLACE' as const,
      lodgingType: undefined,
      isFictional: true,
      copy: '{}',
      description: '',
      address: '',
      coordinates: undefined,
      capacity: undefined,
      amenities: [],
      operatingHours: '',
      website: '',
      phoneNumber: '',
      priceRange: '',
      rating: undefined,
      fandomIds: [],
    },
    asyncValidation: {
      slug: asyncValidation.slug,
      name: asyncValidation.name,
    },
    autoSave: {
      enabled: isEditing,
      delay: 3000,
      onSave: autoSaveLocation,
    },
    conditionalFields: {
      lodgingType: {
        condition: (values) => values.locationType === 'LODGING',
      },
      capacity: {
        condition: (values) =>
          values.locationType === 'LODGING' || values.locationType === 'DESTINATION',
      },
      amenities: {
        condition: (values) => values.locationType === 'LODGING',
      },
      priceRange: {
        condition: (values) =>
          values.locationType === 'LODGING' || values.locationType === 'DESTINATION',
      },
    },
    watchers: {
      name: (name) => {
        if (name && !form.values.slug) {
          form.setFieldValue('slug', generateSlug(name));
        }
      },
      locationType: (locationType) => {
        // Clear lodging-specific fields when changing from LODGING
        if (locationType !== 'LODGING') {
          form.setFieldValue('lodgingType', undefined);
          if (form.values.amenities.length > 0) {
            form.setFieldValue('amenities', []);
          }
        }
      },
      isFictional: (isFictional) => {
        // Clear real-world specific fields when switching to fictional
        if (isFictional) {
          form.setFieldValue('address', '');
          form.setFieldValue('coordinates', undefined);
          form.setFieldValue('phoneNumber', '');
        }
      },
    },
    persistence: {
      key: `location-form-${locationId || 'new'}`,
      enabled: true,
      ttl: 2 * 60 * 60 * 1000, // 2 hours
    },
    transformOnSubmit: async (values) => {
      const copyData = {
        description: values.description,
        address: values.address,
        coordinates: values.coordinates,
        capacity: values.capacity,
        amenities: values.amenities,
        operatingHours: values.operatingHours,
        website: values.website,
        phoneNumber: values.phoneNumber,
        priceRange: values.priceRange,
        rating: values.rating,
      };

      return {
        name: values.name,
        slug: values.slug,
        locationType: values.locationType,
        lodgingType: values.lodgingType || undefined,
        isFictional: values.isFictional,
        copy: copyData,
        // Note: fandomIds would need to be handled separately in the action
      };
    },
    dirtyTracking: true,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  // Load location data when editing
  useEffect(() => {
    if (opened && isEditing && locationId) {
      loadLocationData(locationId);
    }
  }, [opened, isEditing, locationId]);

  const loadLocationData = async (id: string) => {
    try {
      const [location, relationships] = await Promise.all([
        getLocationAction({ locationId: id }),
        getLocationRelationshipsAction({ locationId: id }),
      ]);

      if (location) {
        const copyData = (location.copy as any) || {};
        form.setValues({
          name: location.name,
          slug: location.slug,
          locationType: location.locationType,
          lodgingType: location.lodgingType || undefined,
          isFictional: location.isFictional,
          copy: JSON.stringify(location.copy || {}, null, 2),
          description: copyData.description || '',
          address: copyData.address || '',
          coordinates: copyData.coordinates || undefined,
          capacity: copyData.capacity || undefined,
          amenities: copyData.amenities || [],
          operatingHours: copyData.operatingHours || '',
          website: copyData.website || '',
          phoneNumber: copyData.phoneNumber || '',
          priceRange: copyData.priceRange || '',
          rating: copyData.rating || undefined,
          fandomIds: relationships?.fandoms?.map((f: any) => f.id) || [],
        });
      }
    } catch (error) {
      console.error('Failed to load location:', error);
    }
  };

  const handleSubmit = form.handleSubmit(async (values: LocationFormValues) => {
    const action = isEditing ? updateLocationAction : createLocationAction;
    const payload = isEditing ? { where: { id: locationId! }, data: values } : { data: values };

    return action(payload);
  });

  const getLocationIcon = (type: LocationType) => {
    switch (type) {
      case 'LODGING':
        return IconBed;
      case 'DESTINATION':
        return IconMap;
      default:
        return IconMapPin;
    }
  };

  const LocationIcon = getLocationIcon(form.values.locationType);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group>
          <LocationIcon size={24} />
          <Title order={3}>{isEditing ? 'Edit Location' : 'Create Location'}</Title>
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
            <Tabs.Tab value="basic" leftSection={<IconMapPin size={16} />}>
              Basic Info
            </Tabs.Tab>
            <Tabs.Tab value="details" leftSection={<IconInfoCircle size={16} />}>
              Details
            </Tabs.Tab>
            {form.isFieldVisible('amenities') && (
              <Tabs.Tab value="lodging" leftSection={<IconBed size={16} />}>
                Lodging Info
              </Tabs.Tab>
            )}
            <Tabs.Tab value="relationships" leftSection={<IconHash size={16} />}>
              Relationships
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Location Information</Title>

                  <TextInput
                    label="Location Name"
                    placeholder="Enter location name"
                    required
                    description="The name of the place, destination, or lodging"
                    {...form.getInputProps('name')}
                  />

                  <Group grow align="flex-end">
                    <TextInput
                      label="Slug"
                      placeholder="location-slug"
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

                  <Select
                    label="Location Type"
                    required
                    description="The type of location"
                    data={[
                      { value: 'PLACE', label: 'Place (General location)' },
                      { value: 'DESTINATION', label: 'Destination (Tourist attraction)' },
                      { value: 'LOCATION', label: 'Location (Specific spot)' },
                      { value: 'LODGING', label: 'Lodging (Hotels, resorts, etc.)' },
                    ]}
                    {...form.getInputProps('locationType')}
                  />

                  {form.isFieldVisible('lodgingType') && (
                    <Select
                      label="Lodging Type"
                      description="Specific type of lodging"
                      data={[
                        { value: 'DISNEY_RESORT', label: 'Disney Resort' },
                        { value: 'UNIVERSAL_RESORT', label: 'Universal Resort' },
                        { value: 'ONSITE_HOTEL', label: 'On-site Hotel' },
                        { value: 'OFFSITE_HOTEL', label: 'Off-site Hotel' },
                        { value: 'SHIP', label: 'Cruise Ship' },
                        { value: 'CAMPGROUND', label: 'Campground' },
                        { value: 'OTHER', label: 'Other' },
                      ]}
                      {...form.getInputProps('lodgingType')}
                    />
                  )}

                  <Checkbox
                    label="Fictional Location"
                    description="Check if this is a fictional location, uncheck for real places"
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
                  <Title order={5}>Location Details</Title>

                  <Textarea
                    label="Description"
                    placeholder="Describe the location"
                    description="Overview of the location"
                    minRows={3}
                    maxRows={6}
                    {...form.getInputProps('description')}
                  />

                  {!form.values.isFictional && (
                    <>
                      <TextInput
                        label="Address"
                        placeholder="123 Main St, City, State"
                        description="Physical address for real locations"
                        {...form.getInputProps('address')}
                      />

                      <Group grow>
                        <NumberInput
                          label="Latitude"
                          placeholder="40.7128"
                          description="GPS latitude coordinate"
                          precision={6}
                          min={-90}
                          max={90}
                          value={form.values.coordinates?.latitude}
                          onChange={(value) =>
                            form.setFieldValue('coordinates', {
                              ...form.values.coordinates,
                              latitude: value || undefined,
                            } as any)
                          }
                        />
                        <NumberInput
                          label="Longitude"
                          placeholder="-74.0060"
                          description="GPS longitude coordinate"
                          precision={6}
                          min={-180}
                          max={180}
                          value={form.values.coordinates?.longitude}
                          onChange={(value) =>
                            form.setFieldValue('coordinates', {
                              ...form.values.coordinates,
                              longitude: value || undefined,
                            } as any)
                          }
                        />
                      </Group>

                      <TextInput
                        label="Phone Number"
                        placeholder="+1 (555) 123-4567"
                        description="Contact phone number"
                        {...form.getInputProps('phoneNumber')}
                      />
                    </>
                  )}

                  <TextInput
                    label="Operating Hours"
                    placeholder="Mon-Fri 9AM-5PM, Sat-Sun 10AM-6PM"
                    description="Hours of operation"
                    {...form.getInputProps('operatingHours')}
                  />

                  <TextInput
                    label="Website"
                    placeholder="https://example.com"
                    description="Official website URL"
                    {...form.getInputProps('website')}
                  />

                  <Group grow>
                    {form.isFieldVisible('capacity') && (
                      <NumberInput
                        label="Capacity"
                        placeholder="Number of guests/visitors"
                        description="Maximum capacity"
                        min={0}
                        {...form.getInputProps('capacity')}
                      />
                    )}

                    {form.isFieldVisible('priceRange') && (
                      <TextInput
                        label="Price Range"
                        placeholder="$$$"
                        description="Price level ($-$$$$)"
                        {...form.getInputProps('priceRange')}
                      />
                    )}

                    <NumberInput
                      label="Rating"
                      placeholder="4.5"
                      description="Average rating (0-5)"
                      precision={1}
                      min={0}
                      max={5}
                      step={0.5}
                      {...form.getInputProps('rating')}
                    />
                  </Group>
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>

          {form.isFieldVisible('amenities') && (
            <Tabs.Panel value="lodging" pt="xs">
              <Stack>
                <Card>
                  <Stack>
                    <Title order={5}>Lodging Amenities</Title>

                    <MultiSelect
                      label="Amenities"
                      placeholder="Select amenities"
                      description="Available amenities and features"
                      data={AMENITIES_OPTIONS}
                      searchable
                      clearable
                      {...form.getInputProps('amenities')}
                    />
                  </Stack>
                </Card>
              </Stack>
            </Tabs.Panel>
          )}

          <Tabs.Panel value="relationships" pt="xs">
            <Stack>
              <Card>
                <Stack>
                  <Title order={5}>Fandom Associations</Title>
                  <Text size="sm" c="dimmed">
                    Associate this location with fandoms it appears in
                  </Text>

                  <MultiSelect
                    label="Fandoms"
                    placeholder="Select fandoms"
                    description="Fandoms where this location appears"
                    data={
                      options.fandoms?.map((f: any) => ({
                        value: f.id,
                        label: `${f.name} ${f.isFictional ? '(Fictional)' : '(Real)'}`,
                      })) || []
                    }
                    searchable
                    clearable
                    {...form.getInputProps('fandomIds')}
                  />
                </Stack>
              </Card>

              <Card>
                <Stack>
                  <Title order={5}>Additional Metadata</Title>

                  <JsonInput
                    label="Location Metadata (JSON)"
                    placeholder='{\n  "parkingSpots": 200,\n  "nearbyAttractions": ["Beach", "Museum"],\n  "transportOptions": ["Bus", "Train"]\n}'
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
              {isEditing ? 'Updating location' : 'Creating new location'}
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
              {isEditing ? 'Update Location' : 'Create Location'}
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
