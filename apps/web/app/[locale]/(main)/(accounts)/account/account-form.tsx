'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  IconCalendar,
  IconCamera,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUser,
} from '@tabler/icons-react';
import {
  Button,
  TextInput,
  Textarea,
  Select,
  Stack,
  Group,
  Card,
  Avatar,
  FileButton,
  Text,
  Divider,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { updateUser } from '@/actions/user';
import { z } from 'zod';

const accountSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().max(200, 'Address too long').optional(),
  gender: z.string().optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
});

interface AccountFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    phone?: string | null;
    dateOfBirth?: string | null;
    address?: string | null;
    gender?: string | null;
    bio?: string | null;
  };
  locale: string;
  dict: any;
}

export function AccountForm({ user, locale: _locale, dict: _dict }: AccountFormProps) {
  const router = useRouter();

  const form = useForm({
    mode: 'uncontrolled',
    validate: zodResolver(accountSchema),
    initialValues: {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      address: user.address || '',
      gender: user.gender || '',
      bio: user.bio || '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const result = await updateUser({
        name: values.name,
        // Note: email update should have verification flow
        phone: values.phone || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        address: values.address || undefined,
        gender: values.gender || undefined,
        bio: values.bio || undefined,
      });

      if (result.success) {
        notifications.show({
          title: 'Profile updated',
          message: 'Your profile has been successfully updated.',
          color: 'green',
        });

        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      notifications.show({
        title: 'Update failed',
        message:
          error instanceof Error ? error.message : 'Failed to update profile. Please try again.',
        color: 'red',
      });
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {/* Profile Picture Section */}
          <Card.Section withBorder inheritPadding py="lg">
            <Group>
              <Avatar size={80} src={user.image} alt={user.name} radius="md">
                <IconUser size={40} />
              </Avatar>
              <div>
                <Text fw={500} size="lg">
                  Profile Picture
                </Text>
                <Text c="dimmed" size="sm" mb="sm">
                  Upload a new profile picture
                </Text>
                <FileButton onChange={() => {}} accept="image/*">
                  {(props) => (
                    <Button {...props} variant="light" leftSection={<IconCamera size={16} />}>
                      Upload Photo
                    </Button>
                  )}
                </FileButton>
              </div>
            </Group>
          </Card.Section>

          <Divider />

          {/* Basic Information */}
          <div>
            <Text fw={500} size="lg" mb="md">
              Basic Information
            </Text>
            <Stack gap="md">
              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                leftSection={<IconUser size={16} />}
                key={form.key('name')}
                {...form.getInputProps('name')}
                required
              />

              <TextInput
                label="Email Address"
                placeholder="Enter your email"
                leftSection={<IconMail size={16} />}
                key={form.key('email')}
                {...form.getInputProps('email')}
                required
                disabled // Email changes should go through verification flow
              />

              <TextInput
                label="Phone Number"
                placeholder="Enter your phone number"
                leftSection={<IconPhone size={16} />}
                key={form.key('phone')}
                {...form.getInputProps('phone')}
              />

              <TextInput
                label="Date of Birth"
                placeholder="YYYY-MM-DD"
                leftSection={<IconCalendar size={16} />}
                key={form.key('dateOfBirth')}
                {...form.getInputProps('dateOfBirth')}
                type="date"
              />
            </Stack>
          </div>

          <Divider />

          {/* Additional Information */}
          <div>
            <Text fw={500} size="lg" mb="md">
              Additional Information
            </Text>
            <Stack gap="md">
              <Select
                label="Gender"
                placeholder="Select your gender"
                data={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
                ]}
                key={form.key('gender')}
                {...form.getInputProps('gender')}
              />

              <TextInput
                label="Address"
                placeholder="Enter your address"
                leftSection={<IconMapPin size={16} />}
                key={form.key('address')}
                {...form.getInputProps('address')}
              />

              <Textarea
                label="Bio"
                placeholder="Tell us about yourself..."
                autosize
                minRows={3}
                maxRows={6}
                key={form.key('bio')}
                {...form.getInputProps('bio')}
              />
            </Stack>
          </div>

          {/* Actions */}
          <Group justify="flex-end" pt="md">
            <Button variant="subtle" onClick={() => form.reset()} disabled={form.submitting}>
              Reset
            </Button>
            <Button type="submit" loading={form.submitting} disabled={!form.isDirty()}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
