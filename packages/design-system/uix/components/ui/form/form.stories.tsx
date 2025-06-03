import { Box, Button, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

import type { Meta, StoryObj } from '@storybook/react';

// Mock form component for Storybook
const MockForm = () => {
  const form = useForm({
    validate: {
      username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
    },
    initialValues: {
      username: 'test-user',
    },
  });

  return (
    <Box component="form" onSubmit={form.onSubmit(() => {})} w={400}>
      <Stack>
        <TextInput
          description="This is your public display name."
          placeholder="Enter your username"
          label="Username"
          {...form.getInputProps('username')}
        />
        <Button fullWidth type="submit">
          Submit
        </Button>
      </Stack>
    </Box>
  );
};

/**
 * Building forms with Mantine Form.
 * This demonstrates a simple form with validation.
 */
const meta = {
  component: MockForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'uix/ui/Form',
} satisfies Meta<typeof MockForm>;

export default meta;

type Story = StoryObj<typeof MockForm>;

/**
 * The default form with Mantine components.
 */
export const Default: Story = {
  args: {},
  render: () => <MockForm />,
};

/**
 * Form with error state.
 */
export const WithError: Story = {
  render: () => {
    const FormWithError = () => {
      const form = useForm({
        validate: {
          username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
        },
        initialValues: {
          username: 'ab', // Too short to trigger error
        },
      });

      // Trigger validation to show error
      form.validate();

      return (
        <Box component="form" onSubmit={form.onSubmit(() => {})} w={400}>
          <Stack>
            <TextInput
              description="This is your public display name."
              placeholder="Enter your username"
              label="Username"
              {...form.getInputProps('username')}
            />
            <Button fullWidth type="submit">
              Submit
            </Button>
          </Stack>
        </Box>
      );
    };

    return <FormWithError />;
  },
};

/**
 * Form with multiple fields.
 */
export const MultipleFields: Story = {
  render: () => {
    const MultiFieldForm = () => {
      const form = useForm({
        validate: {
          username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
          email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
          password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
        },
        initialValues: {
          username: '',
          email: '',
          password: '',
        },
      });

      return (
        <Box component="form" onSubmit={form.onSubmit(() => {})} w={400}>
          <Stack>
            <TextInput
              description="This is your public display name."
              placeholder="Enter your username"
              label="Username"
              {...form.getInputProps('username')}
            />
            <TextInput
              description="We'll never share your email."
              placeholder="your@email.com"
              label="Email"
              type="email"
              {...form.getInputProps('email')}
            />
            <TextInput
              description="Must be at least 6 characters."
              placeholder="••••••••"
              label="Password"
              type="password"
              {...form.getInputProps('password')}
            />
            <Button fullWidth mt="md" type="submit">
              Create Account
            </Button>
          </Stack>
        </Box>
      );
    };

    return <MultiFieldForm />;
  },
};
