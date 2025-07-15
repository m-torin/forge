import { Button } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { AddPasskeyModal, type AddPasskeyFormValues } from './AddPasskeyModal';

const AddPasskeyModalWrapper = (props: any) => {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: AddPasskeyFormValues) => {
    setLoading(true);
    setError(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (values.name.toLowerCase().includes('error')) {
      throw new Error('Simulated error: Failed to add passkey');
    }

    console.log('Passkey added:', values);
    setLoading(false);
  };

  const handleSuccess = () => {
    console.log('Passkey added successfully');
  };

  return (
    <>
      <Button onClick={() => setOpened(true)}>Open Add Passkey Modal</Button>
      <AddPasskeyModal
        {...props}
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        loading={loading}
        error={error}
        onErrorDismiss={() => setError(null)}
      />
    </>
  );
};

const meta: Meta<typeof AddPasskeyModal> = {
  title: 'Auth/Modals/AddPasskeyModal',
  component: AddPasskeyModalWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomTitles: Story = {
  args: {
    title: 'Register Security Key',
    description: 'Add a new security key to your account for enhanced protection.',
    submitButtonText: 'Register Key',
    nameLabel: 'Security key name',
    namePlaceholder: 'e.g., YubiKey 5C',
    nameDescription: 'Choose a name to identify this security key',
    infoText: 'Your browser will prompt you to touch or activate your security key.',
  },
};

export const LargeSize: Story = {
  args: {
    size: 'lg',
    title: 'Add New Passkey',
    description:
      'Passkeys provide secure, passwordless authentication using your device biometrics.',
  },
};

export const SmallSize: Story = {
  args: {
    size: 'sm',
    title: 'Quick Setup',
    description: 'Add passkey for faster login.',
  },
};

export const MinimalContent: Story = {
  args: {
    title: 'Add Passkey',
    description: '',
    nameDescription: '',
    infoText: '',
  },
};

export const ErrorDemo: Story = {
  args: {
    title: 'Add Passkey (Error Demo)',
    description: 'Type "error" in the name field to simulate an error.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates error handling. Type "error" in the passkey name field to trigger a simulated error.',
      },
    },
  },
};
