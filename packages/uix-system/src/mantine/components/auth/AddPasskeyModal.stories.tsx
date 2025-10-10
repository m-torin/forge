import { Alert, Badge, Button, Card, Container, Group, Paper, Stack, Text } from '@mantine/core';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { expect, userEvent, within } from '@storybook/test';
import {
  IconBrandAndroid,
  IconBrandApple,
  IconBrandWindows,
  IconCheck,
  IconDevices,
  IconFingerprint,
  IconKey,
  IconLock,
  IconSecurity,
  IconShield,
  IconUserCheck,
  IconX,
} from '@tabler/icons-react';
import { useCallback, useState } from 'react';

import { AddPasskeyModal, type AddPasskeyFormValues } from './AddPasskeyModal';

// Enhanced wrapper component for testing different contexts and scenarios
const AddPasskeyModalWrapper = ({
  testId = 'add-passkey-modal',
  onSubmit,
  onSuccess,
  onError,
  simulateError = false,
  errorTrigger = 'error',
  delayTime = 1500,
  showContext = false,
  contextType = 'security',
  autoOpen = false,
  successMessage = 'Passkey added successfully!',
  ...props
}: any) => {
  const [opened, setOpened] = useState(autoOpen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);

  const handleSubmit = useCallback(
    async (values: AddPasskeyFormValues) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setSubmissionCount(prev => prev + 1);

      // Log action
      action('submitPasskey')(values);
      onSubmit?.(values);

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, delayTime));

        // Simulate error conditions
        if (simulateError && values.name.toLowerCase().includes(errorTrigger)) {
          throw new Error(`Simulated error: Failed to add passkey "${values.name}"`);
        }

        // Simulate specific WebAuthn errors based on name patterns
        if (values.name.toLowerCase().includes('notallowed')) {
          const error = new Error('The operation was cancelled or not allowed.');
          error.name = 'NotAllowedError';
          throw error;
        }

        if (values.name.toLowerCase().includes('notsupported')) {
          const error = new Error('Passkeys are not supported on this device.');
          error.name = 'NotSupportedError';
          throw error;
        }

        if (values.name.toLowerCase().includes('invalidstate')) {
          const error = new Error('This device may already be registered.');
          error.name = 'InvalidStateError';
          throw error;
        }

        setSuccess(successMessage);
        setTimeout(() => setSuccess(null), 3000); // Auto-hide success message
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMsg);
        onError?.(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoading(false);
      }
    },
    [simulateError, errorTrigger, delayTime, successMessage, onSubmit, onError],
  );

  const handleSuccess = useCallback(() => {
    action('passkeySuccess')();
    onSuccess?.();
    setOpened(false);
  }, [onSuccess]);

  const handleOpen = () => {
    setOpened(true);
    setError(null);
    setSuccess(null);
    action('openModal')();
  };

  const handleClose = () => {
    setOpened(false);
    setError(null);
    setSuccess(null);
    action('closeModal')();
  };

  const contextIcons = {
    security: IconShield,
    devices: IconDevices,
    authentication: IconLock,
    profile: IconUserCheck,
  };

  const ContextIcon = contextIcons[contextType as keyof typeof contextIcons] || IconShield;

  return (
    <div data-testid={testId} style={{ minWidth: '300px' }}>
      {showContext && (
        <div style={{ marginBottom: '16px' }}>
          <Badge variant="light" color="blue" size="sm">
            <ContextIcon size={12} style={{ marginRight: '4px' }} />
            Context: {contextType}
          </Badge>
        </div>
      )}

      <Button onClick={handleOpen} leftSection={<IconFingerprint size={16} />}>
        Add Passkey
      </Button>

      <AddPasskeyModal
        {...props}
        opened={opened}
        onClose={handleClose}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        loading={loading}
        error={error}
        onErrorDismiss={() => setError(null)}
      />

      {/* Status messages */}
      {success && (
        <Alert
          icon={<IconCheck size={14} />}
          color="green"
          mt="md"
          onClose={() => setSuccess(null)}
          withCloseButton
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          icon={<IconX size={14} />}
          color="red"
          mt="md"
          onClose={() => setError(null)}
          withCloseButton
        >
          {error}
        </Alert>
      )}

      {submissionCount > 0 && (
        <Text size="xs" c="dimmed" mt="sm">
          Submissions: {submissionCount}
        </Text>
      )}
    </div>
  );
};

const meta: Meta<typeof AddPasskeyModal> = {
  title: 'Auth/AddPasskeyModal',
  component: AddPasskeyModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# AddPasskeyModal Component

A comprehensive modal for adding passkeys to user accounts, providing secure WebAuthn-based authentication setup with biometric and device-based authentication methods.

## Features

### Core Functionality
- **Passkey Registration**: WebAuthn-based passkey creation and registration
- **Device Detection**: Automatic device name detection and suggestions
- **Form Validation**: Comprehensive validation with Zod schema integration
- **Error Handling**: Specific WebAuthn error handling and user-friendly messages
- **Loading States**: Visual feedback during registration process

### User Experience
- **Smart Defaults**: Auto-generated device-specific passkey names
- **Intuitive Interface**: Clear instructions and visual cues
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Adapts to different screen sizes and modal contexts

### Security Features
- **WebAuthn Integration**: Standards-compliant passkey implementation
- **Error Recovery**: Graceful handling of authentication failures
- **Validation**: Input validation and sanitization
- **Device Recognition**: Contextual device-specific messaging

### Customization Options
- **Modal Sizing**: Multiple size options (sm, md, lg, xl)
- **Custom Labels**: Configurable text for all interface elements
- **Custom Icons**: Replaceable icons for branding consistency
- **Flexible Messaging**: Customizable descriptions and help text

## Use Cases

Perfect for:
- **Initial Setup**: First-time passkey registration for new users
- **Security Enhancement**: Adding additional authentication methods
- **Multi-Device**: Registering passkeys across multiple devices
- **Enterprise**: Corporate security policy compliance
- **Personal Accounts**: Consumer-facing authentication improvements

## Design Patterns

The component follows modern authentication UX patterns with clear visual feedback, progressive disclosure, and secure-by-default behaviors to ensure successful passkey registration.
        `,
      },
    },
  },
  argTypes: {
    // Modal Configuration
    opened: {
      control: 'boolean',
      description: 'Controls modal visibility',
      table: { category: 'Modal' },
    },
    size: {
      control: { type: 'select', options: ['sm', 'md', 'lg', 'xl'] },
      description: 'Modal size variant',
      table: { category: 'Modal' },
    },

    // Content Configuration
    title: {
      control: 'text',
      description: 'Modal title text',
      table: { category: 'Content' },
    },
    description: {
      control: 'text',
      description: 'Modal description text',
      table: { category: 'Content' },
    },
    infoText: {
      control: 'text',
      description: 'Additional information text',
      table: { category: 'Content' },
    },
    icon: {
      control: false,
      description: 'Icon to display with form elements',
      table: { category: 'Content' },
    },

    // Form Configuration
    nameLabel: {
      control: 'text',
      description: 'Label for passkey name field',
      table: { category: 'Form' },
    },
    namePlaceholder: {
      control: 'text',
      description: 'Placeholder text for name field',
      table: { category: 'Form' },
    },
    nameDescription: {
      control: 'text',
      description: 'Help text for name field',
      table: { category: 'Form' },
    },

    // Button Configuration
    submitButtonText: {
      control: 'text',
      description: 'Submit button text',
      table: { category: 'Actions' },
    },
    cancelButtonText: {
      control: 'text',
      description: 'Cancel button text',
      table: { category: 'Actions' },
    },

    // State Management
    loading: {
      control: 'boolean',
      description: 'Show loading state',
      table: { category: 'States' },
    },
    error: {
      control: 'text',
      description: 'Error message to display',
      table: { category: 'States' },
    },

    // Event Handlers
    onClose: {
      action: 'close',
      description: 'Callback when modal is closed',
      table: { category: 'Events' },
    },
    onSubmit: {
      action: 'submit',
      description: 'Callback when form is submitted',
      table: { category: 'Events' },
    },
    onSuccess: {
      action: 'success',
      description: 'Callback when passkey is successfully added',
      table: { category: 'Events' },
    },
    onErrorDismiss: {
      action: 'errorDismiss',
      description: 'Callback when error is dismissed',
      table: { category: 'Events' },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive Playground Story
export const Playground: Story = {
  render: args => <AddPasskeyModalWrapper {...args} />,
  args: {
    title: 'Add a passkey',
    description: 'Passkeys let you sign in securely with your fingerprint, face, or device lock.',
    submitButtonText: 'Add passkey',
    cancelButtonText: 'Cancel',
    nameLabel: 'Passkey name',
    namePlaceholder: 'e.g., MacBook Pro',
    nameDescription: 'Give this passkey a name to help you identify it later',
    infoText:
      'When you click "Add passkey", your browser will ask you to authenticate using your device\'s security features.',
    size: 'md',
    loading: false,
    error: null,
    simulateError: false,
    delayTime: 1500,
    errorTrigger: 'error',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvas.getByTestId('add-passkey-modal');

    // Verify wrapper renders
    await expect(wrapper).toBeInTheDocument();

    // Find and click the trigger button to open modal
    const triggerButton = canvas.getByText('Add Passkey');
    await userEvent.click(triggerButton);

    // Wait for modal to appear
    await expect(canvas.getByRole('dialog')).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground for the AddPasskeyModal component. Try different configurations and test the passkey registration flow.',
      },
    },
  },
};

// Basic Usage Stories
export const Default: Story = {
  render: () => <AddPasskeyModalWrapper autoOpen={false} />,
  parameters: {
    docs: {
      description: {
        story: 'Default passkey modal with standard configuration and auto-generated device name.',
      },
    },
  },
};

export const CustomContent: Story = {
  render: () => (
    <AddPasskeyModalWrapper
      title="Register Security Key"
      description="Add a new security key to your account for enhanced protection."
      submitButtonText="Register Key"
      nameLabel="Security key name"
      namePlaceholder="e.g., YubiKey 5C"
      nameDescription="Choose a name to identify this security key"
      infoText="Your browser will prompt you to touch or activate your security key."
      icon={<IconKey size={16} />}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Customized modal with security key terminology and custom icon.',
      },
    },
  },
};

export const MinimalSetup: Story = {
  render: () => (
    <AddPasskeyModalWrapper
      title="Quick Setup"
      description=""
      nameDescription=""
      infoText=""
      size="sm"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Minimal modal configuration with reduced content for quick setup flows.',
      },
    },
  },
};

// Size Variations
export const SizeVariations: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        padding: '24px',
      }}
    >
      <div>
        <Text size="sm" fw={500} mb="md" ta="center">
          Small Modal
        </Text>
        <AddPasskeyModalWrapper
          size="sm"
          title="Quick Setup"
          description="Add passkey for faster login."
          showContext={false}
        />
      </div>
      <div>
        <Text size="sm" fw={500} mb="md" ta="center">
          Medium Modal
        </Text>
        <AddPasskeyModalWrapper
          size="md"
          title="Add Passkey"
          description="Secure your account with biometric authentication."
          showContext={false}
        />
      </div>
      <div>
        <Text size="sm" fw={500} mb="md" ta="center">
          Large Modal
        </Text>
        <AddPasskeyModalWrapper
          size="lg"
          title="Add New Passkey"
          description="Passkeys provide secure, passwordless authentication using your device biometrics."
          showContext={false}
        />
      </div>
      <div>
        <Text size="sm" fw={500} mb="md" ta="center">
          Extra Large Modal
        </Text>
        <AddPasskeyModalWrapper
          size="xl"
          title="Enterprise Security Setup"
          description="Configure advanced passkey authentication for your organization with comprehensive security features."
          showContext={false}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'All available modal size variations from small to extra large, showing content adaptation.',
      },
    },
  },
};

// Device-Specific Stories
export const DeviceSpecific: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        padding: '24px',
      }}
    >
      <Card withBorder p="lg">
        <Group gap="md" mb="md">
          <IconBrandApple size={24} />
          <Text fw={500}>macOS/iOS Setup</Text>
        </Group>
        <AddPasskeyModalWrapper
          title="Add Touch ID Passkey"
          description="Use your Mac's Touch ID or iPhone's Face ID for secure authentication."
          nameLabel="Device name"
          namePlaceholder="MacBook Pro"
          submitButtonText="Set up Touch ID"
          icon={<IconBrandApple size={16} />}
          showContext={false}
        />
      </Card>

      <Card withBorder p="lg">
        <Group gap="md" mb="md">
          <IconBrandWindows size={24} />
          <Text fw={500}>Windows Setup</Text>
        </Group>
        <AddPasskeyModalWrapper
          title="Add Windows Hello Passkey"
          description="Use Windows Hello with your fingerprint, face, or PIN for secure access."
          nameLabel="Device name"
          namePlaceholder="Surface Pro"
          submitButtonText="Set up Windows Hello"
          icon={<IconBrandWindows size={16} />}
          showContext={false}
        />
      </Card>

      <Card withBorder p="lg">
        <Group gap="md" mb="md">
          <IconBrandAndroid size={24} />
          <Text fw={500}>Android Setup</Text>
        </Group>
        <AddPasskeyModalWrapper
          title="Add Android Passkey"
          description="Use your Android device's biometric authentication for secure login."
          nameLabel="Device name"
          namePlaceholder="Pixel 8"
          submitButtonText="Set up Biometric"
          icon={<IconBrandAndroid size={16} />}
          showContext={false}
        />
      </Card>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Device-specific passkey setup flows with platform-appropriate branding and messaging.',
      },
    },
  },
};

// Error Handling Stories
export const ErrorHandling: Story = {
  render: () => (
    <Stack gap="lg" p="xl">
      <Text size="lg" fw={500} ta="center">
        Error Handling Scenarios
      </Text>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <Text size="sm" fw={500} mb="md">
            Generic Error (type "error")
          </Text>
          <AddPasskeyModalWrapper
            title="Test Generic Error"
            description="Type 'error' in the passkey name to simulate a generic error."
            simulateError={true}
            errorTrigger="error"
            delayTime={1000}
            showContext={false}
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb="md">
            Not Allowed Error (type "notallowed")
          </Text>
          <AddPasskeyModalWrapper
            title="Test Not Allowed Error"
            description="Type 'notallowed' to simulate user cancellation error."
            simulateError={true}
            errorTrigger="notallowed"
            delayTime={800}
            showContext={false}
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb="md">
            Not Supported Error (type "notsupported")
          </Text>
          <AddPasskeyModalWrapper
            title="Test Not Supported Error"
            description="Type 'notsupported' to simulate device incompatibility."
            simulateError={true}
            errorTrigger="notsupported"
            delayTime={500}
            showContext={false}
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb="md">
            Invalid State Error (type "invalidstate")
          </Text>
          <AddPasskeyModalWrapper
            title="Test Invalid State Error"
            description="Type 'invalidstate' to simulate device already registered."
            simulateError={true}
            errorTrigger="invalidstate"
            delayTime={1200}
            showContext={false}
          />
        </div>
      </div>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive error handling scenarios showing different WebAuthn error types and their user-friendly messages.',
      },
    },
  },
};

// Loading States
export const LoadingStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', padding: '24px' }}>
      <div>
        <Text size="sm" fw={500} mb="md">
          Normal Speed (1.5s)
        </Text>
        <AddPasskeyModalWrapper
          title="Standard Registration"
          description="Normal passkey registration speed"
          delayTime={1500}
          showContext={false}
        />
      </div>

      <div>
        <Text size="sm" fw={500} mb="md">
          Slow Network (3s)
        </Text>
        <AddPasskeyModalWrapper
          title="Slow Network Simulation"
          description="Simulates slower network or complex authentication"
          delayTime={3000}
          showContext={false}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Different loading scenarios showing how the modal handles various registration speeds.',
      },
    },
  },
};

// Context-Specific Stories
export const SecurityContext: Story = {
  render: () => (
    <Container size="sm" p="xl">
      <Paper p="xl" withBorder>
        <Group gap="md" mb="xl" justify="center">
          <IconSecurity size={32} />
          <Text size="xl" fw={600}>
            Security Enhancement
          </Text>
        </Group>

        <Text size="sm" c="dimmed" mb="xl" ta="center">
          Strengthen your account security by adding passkey authentication
        </Text>

        <AddPasskeyModalWrapper
          title="Add Security Passkey"
          description="Enhance your account security with biometric authentication. This adds an additional layer of protection beyond your password."
          submitButtonText="Enhance Security"
          nameLabel="Security device name"
          nameDescription="Choose a name to identify this security method"
          infoText="Your device will prompt you to authenticate using your biometric features for maximum security."
          icon={<IconSecurity size={16} />}
          contextType="security"
          showContext={true}
          successMessage="Security passkey added successfully! Your account is now more secure."
        />
      </Paper>
    </Container>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Security-focused context with enhanced messaging around account protection and security benefits.',
      },
    },
  },
};

export const OnboardingFlow: Story = {
  render: () => (
    <Container size="md" p="xl">
      <Stack gap="xl">
        <div style={{ textAlign: 'center' }}>
          <Text size="xl" fw={700} mb="sm">
            Welcome to Your Account!
          </Text>
          <Text c="dimmed" mb="xl">
            Let's set up secure authentication for your account
          </Text>
        </div>

        <Paper p="xl" withBorder radius="lg">
          <Stack gap="lg">
            <Group justify="center">
              <IconFingerprint size={48} style={{ color: '#228be6' }} />
            </Group>

            <div style={{ textAlign: 'center' }}>
              <Text fw={500} mb="xs">
                Step 2 of 3: Security Setup
              </Text>
              <Text size="sm" c="dimmed">
                Add a passkey for secure, password-free login
              </Text>
            </div>

            <AddPasskeyModalWrapper
              title="Set Up Your Passkey"
              description="Skip passwords forever! Use your device's built-in security features to sign in quickly and securely."
              submitButtonText="Set Up Passkey"
              cancelButtonText="Skip for now"
              nameLabel="Give your passkey a name"
              nameDescription="This helps you identify which device you're using to sign in"
              infoText="We'll guide you through the setup process using your device's security features."
              contextType="authentication"
              showContext={false}
              successMessage="Great! You can now sign in with just your fingerprint or face."
            />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Onboarding flow integration showing how the passkey modal fits into user setup processes.',
      },
    },
  },
};

// Enterprise and Team Stories
export const EnterpriseSetup: Story = {
  render: () => (
    <Container size="lg" p="xl">
      <Stack gap="xl">
        <Paper p="lg" withBorder>
          <Group gap="md" mb="md">
            <IconShield size={24} />
            <Text size="lg" fw={600}>
              Enterprise Security Policy
            </Text>
          </Group>
          <Text size="sm" c="dimmed" mb="lg">
            Your organization requires multi-factor authentication. Please set up a passkey to
            comply with security policies.
          </Text>

          <AddPasskeyModalWrapper
            title="Corporate Security Compliance"
            description="Set up passkey authentication to meet your organization's security requirements. This ensures secure access to company resources."
            submitButtonText="Complete Compliance"
            nameLabel="Corporate device name"
            namePlaceholder="Company Laptop - Dept"
            nameDescription="Use your corporate device identifier for IT tracking"
            infoText="This setup will be logged for security compliance purposes. Contact IT support if you need assistance."
            icon={<IconShield size={16} />}
            size="lg"
            contextType="security"
            showContext={true}
            successMessage="Compliance setup complete! You now meet corporate security requirements."
          />
        </Paper>

        <Alert icon={<IconShield size={16} />} color="blue" variant="light">
          <Text size="sm">
            <strong>Security Notice:</strong> All passkey registrations are logged for compliance
            purposes. Contact your IT administrator if you have questions about this security
            requirement.
          </Text>
        </Alert>
      </Stack>
    </Container>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Enterprise context with compliance messaging, security policies, and IT administration considerations.',
      },
    },
  },
};

// Accessibility Testing Story
export const AccessibilityDemo: Story = {
  render: () => (
    <Stack gap="lg">
      <Text size="lg" fw={500}>
        Accessibility Features
      </Text>
      <AddPasskeyModalWrapper
        title="Accessible Passkey Setup"
        description="This modal demonstrates proper accessibility implementation with ARIA labels, keyboard navigation, and screen reader support."
        testId="accessibility-modal"
        contextType="authentication"
        showContext={true}
      />
      <Text size="sm" c="dimmed">
        This component supports full keyboard navigation, screen readers, ARIA labels, and focus
        management.
      </Text>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test modal accessibility
    const wrapper = canvas.getByTestId('accessibility-modal');
    await expect(wrapper).toBeInTheDocument();

    // Test trigger button accessibility
    const triggerButton = canvas.getByText('Add Passkey');
    await expect(triggerButton).toBeAccessible();

    // Test keyboard navigation
    triggerButton.focus();
    await expect(triggerButton).toHaveFocus();

    // Open modal with keyboard
    await userEvent.keyboard('{Enter}');

    // Test modal accessibility
    await expect(canvas.getByRole('dialog')).toBeInTheDocument();

    // Test form field accessibility
    const nameInput = canvas.getByTestId('passkey-name');
    await expect(nameInput).toBeAccessible();

    // Test escape key handling
    await userEvent.keyboard('{Escape}');
  },
  parameters: {
    docs: {
      description: {
        story:
          'Accessibility demonstration with keyboard navigation, ARIA labels, focus management, and screen reader support.',
      },
    },
  },
};
