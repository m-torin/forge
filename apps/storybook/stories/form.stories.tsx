import type { Meta, StoryObj } from '@storybook/nextjs';
import { TextInput, Button, Box, Text, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';

// Mock form component for Storybook
const MockForm = () => {
  const form = useForm({
    initialValues: {
      username: 'test-user',
    },
    validate: {
      username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
    },
  });

  return (
    <Box component="form" onSubmit={form.onSubmit(() => {})} w={400}>
      <Stack>
        <TextInput
          label="Username"
          placeholder="Enter your username"
          description="This is your public display name."
          {...form.getInputProps('username')}
        />
        <Button type="submit" fullWidth>
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
  title: 'ui/Form',
  component: MockForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
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
        initialValues: {
          username: 'ab', // Too short to trigger error
        },
        validate: {
          username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
        },
      });

      // Trigger validation to show error
      form.validate();

      return (
        <Box component="form" onSubmit={form.onSubmit(() => {})} w={400}>
          <Stack>
            <TextInput
              label="Username"
              placeholder="Enter your username"
              description="This is your public display name."
              {...form.getInputProps('username')}
            />
            <Button type="submit" fullWidth>
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
        initialValues: {
          username: '',
          email: '',
          password: '',
        },
        validate: {
          username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
          email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
          password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
        },
      });

      return (
        <Box component="form" onSubmit={form.onSubmit(() => {})} w={400}>
          <Stack>
            <TextInput
              label="Username"
              placeholder="Enter your username"
              description="This is your public display name."
              {...form.getInputProps('username')}
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="your@email.com"
              description="We'll never share your email."
              {...form.getInputProps('email')}
            />
            <TextInput
              label="Password"
              type="password"
              placeholder="••••••••"
              description="Must be at least 6 characters."
              {...form.getInputProps('password')}
            />
            <Button type="submit" fullWidth mt="md">
              Create Account
            </Button>
          </Stack>
        </Box>
      );
    };

    return <MultiFieldForm />;
  },
};
