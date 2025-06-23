'use client';

import {
  Modal,
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  Text,
  Alert,
  LoadingOverlay,
  Divider,
  Switch,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import {
  IconMapPin,
  IconUser,
  IconBuilding,
  IconPhone,
  IconHome,
  IconCheck,
  IconAlertCircle,
  IconRefresh,
} from '@tabler/icons-react';
import { useForm, zodResolver } from '@mantine/form';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';

import { getAddress, createAddress, updateAddress, validateAddress } from '@/actions/pim3/actions';
import { AddressType } from '@repo/database/prisma';

const addressSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  type: z.nativeEnum(AddressType, {
    required_error: 'Address type is required',
  }),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required').default('US'),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

interface AddressFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  addressId?: string | null;
  userId?: string;
  mode?: 'create' | 'edit' | 'view';
}

export function AddressForm({
  opened,
  onClose,
  onSuccess,
  addressId,
  userId,
  mode = 'create',
}: AddressFormProps) {
  const [loading, setLoading] = useState(false);
  const [addressData, setAddressData] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const form = useForm({
    validate: zodResolver(addressSchema),
    initialValues: {
      userId: userId || '',
      type: AddressType.SHIPPING,
      firstName: '',
      lastName: '',
      company: '',
      street1: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      phone: '',
      isDefault: false,
    },
  });

  // Load address data when editing
  useEffect(() => {
    if (opened && addressId) {
      loadAddress();
    } else if (opened && !addressId) {
      form.reset();
      form.setValues({
        userId: userId || '',
        type: AddressType.SHIPPING,
        firstName: '',
        lastName: '',
        company: '',
        street1: '',
        street2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
        phone: '',
        isDefault: false,
      });
    }
  }, [opened, addressId, userId]);

  const loadAddress = async () => {
    if (!addressId) return;

    try {
      setLoading(true);
      const result = await getAddress(addressId);

      if (result.success && result.data) {
        setAddressData(result.data);
        form.setValues({
          userId: result.data.userId,
          type: result.data.type,
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          company: result.data.company || '',
          street1: result.data.street1,
          street2: result.data.street2 || '',
          city: result.data.city,
          state: result.data.state,
          postalCode: result.data.postalCode,
          country: result.data.country,
          phone: result.data.phone || '',
          isDefault: result.data.isDefault,
        });
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load address',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load address',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValidateAddress = async () => {
    const values = form.values;

    try {
      setValidating(true);
      setValidationErrors([]);

      const result = await validateAddress({
        street1: values.street1,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country,
      });

      if (result.success) {
        if (result.isValid) {
          notifications.show({
            title: 'Address Valid',
            message: 'Address format is valid',
            color: 'green',
          });
        } else {
          setValidationErrors(result.errors || []);
          notifications.show({
            title: 'Address Invalid',
            message: 'Address has validation errors',
            color: 'orange',
          });
        }
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to validate address',
        color: 'red',
      });
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      let result;
      if (addressId && mode === 'edit') {
        result = await updateAddress(addressId, values);
      } else {
        result = await createAddress(values);
      }

      if (result.success) {
        notifications.show({
          title: 'Success',
          message: addressId ? 'Address updated successfully' : 'Address created successfully',
          color: 'green',
        });
        onSuccess?.();
        onClose();
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to save address',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save address',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    if (mode === 'view') return 'View Address';
    if (addressId) return 'Edit Address';
    return 'Add Address';
  };

  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'MX', label: 'Mexico' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'FR', label: 'France' },
    { value: 'DE', label: 'Germany' },
    { value: 'IT', label: 'Italy' },
    { value: 'ES', label: 'Spain' },
    { value: 'AU', label: 'Australia' },
    { value: 'JP', label: 'Japan' },
  ];

  const addressTypes = [
    { value: 'SHIPPING', label: 'Shipping Address' },
    { value: 'BILLING', label: 'Billing Address' },
    { value: 'BOTH', label: 'Both Shipping & Billing' },
  ];

  return (
    <Modal opened={opened} onClose={onClose} title={getModalTitle()} size="lg">
      <LoadingOverlay visible={loading} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {validationErrors.length > 0 && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="orange"
              title="Address Validation Issues"
            >
              <Stack gap="xs">
                {validationErrors.map((error, index) => (
                  <Text key={index} size="sm">
                    {error}
                  </Text>
                ))}
              </Stack>
            </Alert>
          )}

          <Group grow>
            <TextInput
              label="User ID"
              placeholder="Enter user ID"
              required
              leftSection={<IconUser size={16} />}
              {...form.getInputProps('userId')}
              disabled={!!userId || mode === 'view'}
            />
            <Select
              label="Address Type"
              placeholder="Select address type"
              required
              data={addressTypes}
              leftSection={<IconMapPin size={16} />}
              {...form.getInputProps('type')}
              disabled={mode === 'view'}
            />
          </Group>

          <Divider label="Personal Information" labelPosition="left" />

          <Group grow>
            <TextInput
              label="First Name"
              placeholder="Enter first name"
              required
              leftSection={<IconUser size={16} />}
              {...form.getInputProps('firstName')}
              disabled={mode === 'view'}
            />
            <TextInput
              label="Last Name"
              placeholder="Enter last name"
              required
              leftSection={<IconUser size={16} />}
              {...form.getInputProps('lastName')}
              disabled={mode === 'view'}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Company"
              placeholder="Company name (optional)"
              leftSection={<IconBuilding size={16} />}
              {...form.getInputProps('company')}
              disabled={mode === 'view'}
            />
            <TextInput
              label="Phone"
              placeholder="Phone number (optional)"
              leftSection={<IconPhone size={16} />}
              {...form.getInputProps('phone')}
              disabled={mode === 'view'}
            />
          </Group>

          <Divider label="Address Information" labelPosition="left" />

          <TextInput
            label="Street Address"
            placeholder="Enter street address"
            required
            leftSection={<IconHome size={16} />}
            {...form.getInputProps('street1')}
            disabled={mode === 'view'}
          />

          <TextInput
            label="Street Address 2"
            placeholder="Apartment, suite, unit, etc. (optional)"
            leftSection={<IconHome size={16} />}
            {...form.getInputProps('street2')}
            disabled={mode === 'view'}
          />

          <Group grow>
            <TextInput
              label="City"
              placeholder="Enter city"
              required
              {...form.getInputProps('city')}
              disabled={mode === 'view'}
            />
            <TextInput
              label="State/Province"
              placeholder="Enter state or province"
              required
              {...form.getInputProps('state')}
              disabled={mode === 'view'}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Postal Code"
              placeholder="Enter postal code"
              required
              {...form.getInputProps('postalCode')}
              disabled={mode === 'view'}
            />
            <Select
              label="Country"
              placeholder="Select country"
              required
              data={countries}
              {...form.getInputProps('country')}
              disabled={mode === 'view'}
            />
          </Group>

          {mode !== 'view' && (
            <Group justify="space-between">
              <Switch
                label="Set as default address"
                description="Use this address as the default for this address type"
                {...form.getInputProps('isDefault', { type: 'checkbox' })}
              />
              <Tooltip label="Validate address format">
                <ActionIcon variant="light" loading={validating} onClick={handleValidateAddress}>
                  <IconRefresh size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          )}

          {mode === 'view' && addressData && (
            <Alert color="blue" icon={<IconCheck size={16} />}>
              <Stack gap="xs">
                <Text size="sm">
                  <strong>Created:</strong> {new Date(addressData.createdAt).toLocaleString()}
                </Text>
                <Text size="sm">
                  <strong>Updated:</strong> {new Date(addressData.updatedAt).toLocaleString()}
                </Text>
                {addressData.isDefault && (
                  <Text size="sm" c="green">
                    ✓ This is the default {addressData.type.toLowerCase()} address
                  </Text>
                )}
              </Stack>
            </Alert>
          )}

          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && (
              <Button
                type="submit"
                loading={loading}
                leftSection={addressId ? <IconCheck size={16} /> : <IconMapPin size={16} />}
              >
                {addressId ? 'Update Address' : 'Create Address'}
              </Button>
            )}
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
