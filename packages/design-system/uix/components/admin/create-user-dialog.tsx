'use client';

import {
  Badge,
  Button,
  Group,
  Modal,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconUserPlus, IconX } from '@tabler/icons-react';
import React, { useState } from 'react';

import { createUser } from '@repo/auth-new/client';

interface CreateUserDialogProps {
  onSuccess?: () => void;
}

interface FormValues {
  additionalRoles: string[];
  customData: Record<string, any>;
  email: string;
  name: string;
  password: string;
  role: string;
}

export function CreateUserDialog({ onSuccess }: CreateUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [customField, setCustomField] = useState({ key: '', value: '' });

  const form = useForm<FormValues>({
    validate: {
      name: (value) => (!value.trim() ? 'Name is required' : null),
      email: (value) => {
        if (!value.trim()) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email address';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return null;
      },
    },
    initialValues: {
      name: '',
      additionalRoles: [],
      customData: {},
      email: '',
      password: '',
      role: 'user',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      await createUser({
        name: values.name,
        data: values.customData,
        email: values.email,
        password: values.password,
        role: values.role as 'admin' | 'super-admin' | 'moderator' | 'support' | 'user',
      });

      notifications.show({
        color: 'green',
        message: 'User created successfully',
        title: 'Success',
      });
      setIsOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create user:', error);
      notifications.show({
        color: 'red',
        message: 'Failed to create user',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = () => {
    if (newRole && !form.values.additionalRoles.includes(newRole) && newRole !== form.values.role) {
      form.setFieldValue('additionalRoles', [...form.values.additionalRoles, newRole]);
      setNewRole('');
    }
  };

  const handleRemoveRole = (role: string) => {
    form.setFieldValue(
      'additionalRoles',
      form.values.additionalRoles.filter((r) => r !== role),
    );
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldValue('password', password);
  };

  return (
    <>
      <Button leftSection={<IconUserPlus size={16} />} onClick={() => setIsOpen(true)}>
        Create User
      </Button>

      <Modal
        onClose={() => {
          setIsOpen(false);
          form.reset();
          setNewRole('');
          setCustomField({ key: '', value: '' });
        }}
        opened={isOpen}
        size="md"
        title="Create New User"
      >
        <Text c="dimmed" mb="lg" size="sm">
          Create a new user account with specific roles and permissions.
        </Text>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              placeholder="John Doe"
              label="Name"
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              placeholder="john@example.com"
              label="Email"
              required
              type="email"
              {...form.getInputProps('email')}
            />
            <PasswordInput
              placeholder="············"
              label="Password"
              required
              {...form.getInputProps('password')}
              rightSection={
                <Button onClick={generatePassword} size="xs" type="button" variant="subtle">
                  Generate
                </Button>
              }
            />
            <Select
              label="Primary Role"
              {...form.getInputProps('role')}
              data={[
                { label: 'User', value: 'user' },
                { label: 'Admin', value: 'admin' },
                { label: 'Super Admin', value: 'super-admin' },
                { label: 'Moderator', value: 'moderator' },
                { label: 'Support', value: 'support' },
              ]}
            />
            <Stack gap="xs">
              <Text fw={500} size="sm">
                Additional Roles
              </Text>
              <Group gap="xs">
                <TextInput
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRole();
                    }
                  }}
                  placeholder="Add role..."
                  style={{ flex: 1 }}
                  value={newRole}
                />
                <Button onClick={handleAddRole} size="sm" type="button" variant="light">
                  Add
                </Button>
              </Group>
              {form.values.additionalRoles.length > 0 && (
                <Group gap="xs">
                  {form.values.additionalRoles.map((role) => (
                    <Badge
                      key={role}
                      rightSection={
                        <IconX
                          onClick={() => handleRemoveRole(role)}
                          style={{ cursor: 'pointer' }}
                          size={14}
                        />
                      }
                      variant="light"
                    >
                      {role}
                    </Badge>
                  ))}
                </Group>
              )}
            </Stack>
            <Stack gap="xs">
              <Text fw={500} size="sm">
                Custom Fields
              </Text>
              <Group gap="xs">
                <TextInput
                  onChange={(e) => setCustomField((prev) => ({ ...prev, key: e.target.value }))}
                  placeholder="Field name"
                  style={{ flex: 1 }}
                  value={customField.key}
                />
                <TextInput
                  onChange={(e) => setCustomField((prev) => ({ ...prev, value: e.target.value }))}
                  placeholder="Field value"
                  style={{ flex: 1 }}
                  value={customField.value}
                />
                <Button
                  onClick={() => {
                    if (customField.key && customField.value) {
                      form.setFieldValue('customData', {
                        ...form.values.customData,
                        [customField.key]: customField.value,
                      });
                      setCustomField({ key: '', value: '' });
                    }
                  }}
                  size="sm"
                  type="button"
                  variant="light"
                >
                  Add
                </Button>
              </Group>
              {Object.keys(form.values.customData).length > 0 && (
                <Stack gap="xs">
                  {Object.entries(form.values.customData).map(([key, value]) => (
                    <Badge
                      key={key}
                      rightSection={
                        <IconX
                          onClick={() => {
                            const newData = { ...form.values.customData };
                            delete newData[key];
                            form.setFieldValue('customData', newData);
                          }}
                          style={{ cursor: 'pointer' }}
                          size={14}
                        />
                      }
                      variant="light"
                    >
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </Stack>
              )}
            </Stack>
          </Stack>
          <Group justify="flex-end" mt="md">
            <Button
              onClick={() => {
                setIsOpen(false);
                form.reset();
                setNewRole('');
                setCustomField({ key: '', value: '' });
              }}
              type="button"
              variant="default"
            >
              Cancel
            </Button>
            <Button loading={loading} type="submit">
              Create User
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
}
