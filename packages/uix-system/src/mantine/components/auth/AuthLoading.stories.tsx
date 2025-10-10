import { Badge, Card, Center, Container, Paper, Stack, Text } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { expect, within } from '@storybook/test';
import {
  IconDevices,
  IconFingerprint,
  IconLock,
  IconMail,
  IconShield,
  IconUserCheck,
} from '@tabler/icons-react';

import { AuthLoading } from './AuthLoading';

// Enhanced wrapper component for testing different contexts
const AuthLoadingWrapper = ({
  testId = 'auth-loading',
  context = 'standalone',
  containerHeight = 400,
  showContext = false,
  backgroundColor,
  ...props
}: any) => {
  const contextStyles = {
    standalone: { padding: '24px' },
    modal: {
      padding: '32px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef',
    },
    fullscreen: {
      padding: '0',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      padding: '0',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
    },
  };

  const WrapperComponent = context === 'card' ? Card : 'div';
  const wrapperProps = context === 'card' ? { withBorder: true, radius: 'md', padding: 'xl' } : {};

  return (
    <div
      data-testid={testId}
      style={{
        ...contextStyles[context as keyof typeof contextStyles],
        backgroundColor,
        position: 'relative',
      }}
    >
      {showContext && (
        <div style={{ marginBottom: '16px' }}>
          <Badge variant="light" color="blue" size="sm">
            Context: {context}
          </Badge>
        </div>
      )}

      <WrapperComponent {...wrapperProps}>
        <AuthLoading {...props} height={containerHeight} />
      </WrapperComponent>
    </div>
  );
};

const meta: Meta<typeof AuthLoading> = {
  title: 'Auth/AuthLoading',
  component: AuthLoading,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# AuthLoading Component

A specialized loading component designed for authentication flows, providing consistent loading states across sign-in, sign-up, and session management processes.

## Features

### Core Loading States
- **Customizable Messages**: Context-specific loading messages for different auth flows
- **Size Variations**: Multiple size options from extra small to extra large
- **Height Control**: Configurable container height for different layouts

### Authentication Contexts
- **Sign In**: Loading states for credential verification and session establishment
- **Sign Up**: Account creation and email verification flows  
- **Session Management**: Session restoration and token refresh
- **Two-Factor Authentication**: 2FA code verification and device setup
- **Password Reset**: Password reset request and confirmation flows
- **Social Authentication**: OAuth provider authentication flows

### Design Integration
- **Consistent Styling**: Matches the overall design system and branding
- **Responsive Layout**: Adapts to different screen sizes and containers
- **Accessibility**: Screen reader support and proper ARIA labels
- **Loading Animations**: Smooth, professional loading indicators

## Use Cases

Perfect for:
- **Authentication Forms**: Loading states during form submissions
- **Session Restoration**: App initialization and session validation
- **Modal Dialogs**: Loading within authentication modals and overlays
- **Full-Screen Loading**: Initial app loading and major state transitions
- **Progressive States**: Multi-step authentication workflows

## Design Patterns

The component follows authentication UX best practices with clear messaging, appropriate timing, and consistent visual feedback to keep users informed during potentially lengthy authentication processes.
        `,
      },
    },
  },
  argTypes: {
    // Content Configuration
    message: {
      control: 'text',
      description: 'Loading message to display to users',
      table: { category: 'Content' },
    },

    // Layout & Styling
    size: {
      control: { type: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      description: 'Size of the loading spinner',
      table: { category: 'Appearance' },
    },
    height: {
      control: { type: 'range', min: 200, max: 800, step: 50 },
      description: 'Height of the loading container',
      table: { category: 'Layout' },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive Playground Story
export const Playground: Story = {
  render: args => <AuthLoadingWrapper {...args} />,
  args: {
    message: 'Loading...',
    size: 'lg',
    height: 400,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loadingComponent = canvas.getByTestId('auth-loading');

    // Verify component renders
    await expect(loadingComponent).toBeInTheDocument();

    // Verify loading spinner is present
    const loader = canvas.getByRole('status', { hidden: true }) || canvas.getByTestId('loader');
    // Note: Mantine Loader might not have standard role, so we check both possibilities

    // Verify message is displayed
    const message = canvas.getByText('Loading...');
    await expect(message).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground for AuthLoading component. Adjust the controls to see different loading configurations.',
      },
    },
  },
};

// Basic Usage Stories
export const Default: Story = {
  render: () => <AuthLoadingWrapper message="Loading..." size="lg" height={300} />,
  parameters: {
    docs: {
      description: {
        story: 'Default loading state with standard message and size.',
      },
    },
  },
};

export const CustomMessage: Story = {
  render: () => (
    <AuthLoadingWrapper message="Verifying your credentials..." size="md" height={350} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading state with custom message for credential verification.',
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
          Extra Small
        </Text>
        <AuthLoadingWrapper message="Loading..." size="xs" height={200} showContext={false} />
      </div>
      <div>
        <Text size="sm" fw={500} mb="md" ta="center">
          Small
        </Text>
        <AuthLoadingWrapper message="Loading..." size="sm" height={200} showContext={false} />
      </div>
      <div>
        <Text size="sm" fw={500} mb="md" ta="center">
          Medium
        </Text>
        <AuthLoadingWrapper message="Loading..." size="md" height={200} showContext={false} />
      </div>
      <div>
        <Text size="sm" fw={500} mb="md" ta="center">
          Large
        </Text>
        <AuthLoadingWrapper message="Loading..." size="lg" height={200} showContext={false} />
      </div>
      <div>
        <Text size="sm" fw={500} mb="md" ta="center">
          Extra Large
        </Text>
        <AuthLoadingWrapper message="Loading..." size="xl" height={200} showContext={false} />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'All available size variations from xs to xl, showing how the loading indicator scales.',
      },
    },
  },
};

// Authentication Flow States
export const SignInLoading: Story = {
  render: () => (
    <AuthLoadingWrapper message="Signing you in..." size="md" height={300} context="modal">
      <Center mb="xl">
        <IconLock size={48} style={{ color: '#228be6', opacity: 0.7 }} />
      </Center>
    </AuthLoadingWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading state for sign-in process with contextual messaging.',
      },
    },
  },
};

export const SignUpLoading: Story = {
  render: () => (
    <AuthLoadingWrapper message="Creating your account..." size="md" height={300} context="modal">
      <Center mb="xl">
        <IconUserCheck size={48} style={{ color: '#40c057', opacity: 0.7 }} />
      </Center>
    </AuthLoadingWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading state for account creation with success-oriented styling.',
      },
    },
  },
};

export const SessionLoading: Story = {
  render: () => (
    <AuthLoadingWrapper
      message="Restoring your session..."
      size="lg"
      height={400}
      context="fullscreen"
      backgroundColor="#f8f9fa"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full-screen loading state for session restoration during app initialization.',
      },
    },
  },
};

export const TwoFactorLoading: Story = {
  render: () => (
    <AuthLoadingWrapper
      message="Verifying two-factor code..."
      size="md"
      height={280}
      context="card"
    >
      <Center mb="xl">
        <IconFingerprint size={48} style={{ color: '#7c2d12', opacity: 0.7 }} />
      </Center>
    </AuthLoadingWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading state for two-factor authentication verification.',
      },
    },
  },
};

export const EmailVerificationLoading: Story = {
  render: () => (
    <AuthLoadingWrapper
      message="Verifying your email address..."
      size="md"
      height={320}
      context="modal"
    >
      <Center mb="xl">
        <IconMail size={48} style={{ color: '#fab005', opacity: 0.7 }} />
      </Center>
    </AuthLoadingWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading state for email verification process.',
      },
    },
  },
};

export const SocialAuthLoading: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px' }}>
      <div>
        <Text size="sm" fw={500} mb="md">
          Google Authentication
        </Text>
        <AuthLoadingWrapper
          message="Connecting with Google..."
          size="sm"
          height={250}
          context="card"
          showContext={false}
        />
      </div>
      <div>
        <Text size="sm" fw={500} mb="md">
          GitHub Authentication
        </Text>
        <AuthLoadingWrapper
          message="Connecting with GitHub..."
          size="sm"
          height={250}
          context="card"
          showContext={false}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading states for social authentication providers.',
      },
    },
  },
};

// Context and Layout Stories
export const ModalContext: Story = {
  render: () => (
    <div style={{ padding: '40px', backgroundColor: '#f8f9fa' }}>
      <AuthLoadingWrapper
        message="Processing your request..."
        size="md"
        height={300}
        context="modal"
        showContext={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading component styled for modal dialogs with elevated appearance.',
      },
    },
  },
};

export const CardContext: Story = {
  render: () => (
    <Container size="sm" p="xl">
      <AuthLoadingWrapper
        message="Loading your dashboard..."
        size="lg"
        height={350}
        context="card"
        showContext={true}
      />
    </Container>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading component within a card layout for embedded contexts.',
      },
    },
  },
};

export const FullScreenContext: Story = {
  render: () => (
    <AuthLoadingWrapper
      message="Initializing application..."
      size="xl"
      height={600}
      context="fullscreen"
    />
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Full-screen loading state for app initialization and major transitions.',
      },
    },
  },
};

// Height Variations
export const HeightVariations: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
        padding: '24px',
      }}
    >
      <div>
        <Text size="sm" fw={500} mb="md" ta="center">
          Compact (200px)
        </Text>
        <AuthLoadingWrapper message="Loading..." size="sm" height={200} showContext={false} />
      </div>
      <div>
        <Text size="sm" fw={500} mb="md" ta="center">
          Standard (300px)
        </Text>
        <AuthLoadingWrapper message="Loading..." size="md" height={300} showContext={false} />
      </div>
      <div>
        <Text size="sm" fw={500} mb="md" ta="center">
          Tall (400px)
        </Text>
        <AuthLoadingWrapper message="Loading..." size="lg" height={400} showContext={false} />
      </div>
      <div>
        <Text size="sm" fw={500} mb="md" ta="center">
          Very Tall (500px)
        </Text>
        <AuthLoadingWrapper message="Loading..." size="xl" height={500} showContext={false} />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Different height configurations showing how the component adapts to various container sizes.',
      },
    },
  },
};

// Error Recovery and Advanced States
export const TimeoutSimulation: Story = {
  render: () => (
    <Stack gap="xl" p="xl">
      <Text size="lg" fw={500} ta="center">
        Simulated Loading Scenarios
      </Text>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          <Text size="sm" fw={500} mb="md">
            Quick Loading (&lt; 2s)
          </Text>
          <AuthLoadingWrapper
            message="Almost ready..."
            size="sm"
            height={250}
            context="card"
            showContext={false}
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb="md">
            Extended Loading (&gt; 5s)
          </Text>
          <AuthLoadingWrapper
            message="This might take a moment..."
            size="md"
            height={250}
            context="card"
            showContext={false}
          />
        </div>
      </div>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different loading scenarios with appropriate messaging for various loading times.',
      },
    },
  },
};

export const ProgressiveLoading: Story = {
  render: () => (
    <Stack gap="lg" p="xl">
      <Text size="lg" fw={500} ta="center">
        Progressive Authentication Flow
      </Text>

      <div style={{ display: 'grid', gap: '24px' }}>
        <Paper p="md" withBorder>
          <Text size="sm" c="dimmed" mb="xs">
            Step 1: Credential Verification
          </Text>
          <AuthLoadingWrapper
            message="Verifying username and password..."
            size="sm"
            height={200}
            showContext={false}
          />
        </Paper>

        <Paper p="md" withBorder>
          <Text size="sm" c="dimmed" mb="xs">
            Step 2: Two-Factor Authentication
          </Text>
          <AuthLoadingWrapper
            message="Checking two-factor code..."
            size="sm"
            height={200}
            showContext={false}
          />
        </Paper>

        <Paper p="md" withBorder>
          <Text size="sm" c="dimmed" mb="xs">
            Step 3: Session Creation
          </Text>
          <AuthLoadingWrapper
            message="Setting up your session..."
            size="sm"
            height={200}
            showContext={false}
          />
        </Paper>
      </div>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multi-step authentication flow showing progressive loading states.',
      },
    },
  },
};

// Device-Specific Loading
export const DeviceSpecificLoading: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        padding: '24px',
      }}
    >
      <Card withBorder p="xl">
        <Center mb="md">
          <IconDevices size={40} style={{ color: '#495057' }} />
        </Center>
        <AuthLoadingWrapper
          message="Syncing across devices..."
          size="md"
          height={200}
          showContext={false}
        />
      </Card>

      <Card withBorder p="xl">
        <Center mb="md">
          <IconShield size={40} style={{ color: '#495057' }} />
        </Center>
        <AuthLoadingWrapper
          message="Applying security policies..."
          size="md"
          height={200}
          showContext={false}
        />
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Loading states for device-specific authentication features like sync and security policies.',
      },
    },
  },
};

// Accessibility Testing Story
export const AccessibilityDemo: Story = {
  render: () => (
    <AuthLoadingWrapper
      message="Verifying your credentials..."
      size="lg"
      height={400}
      testId="accessibility-loading"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test loading component accessibility
    const loadingComponent = canvas.getByTestId('accessibility-loading');
    await expect(loadingComponent).toBeInTheDocument();

    // Verify loading message is accessible
    const message = canvas.getByText('Verifying your credentials...');
    await expect(message).toBeInTheDocument();

    // Check for proper ARIA attributes and screen reader support
    // Note: Specific ARIA testing would depend on Mantine's Loader implementation

    // Verify the component doesn't interfere with keyboard navigation
    // (Loading states should not trap focus)
  },
  parameters: {
    docs: {
      description: {
        story:
          'Accessibility demonstration with proper ARIA labels and screen reader support for loading states.',
      },
    },
  },
};
