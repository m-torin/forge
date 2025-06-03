import React from 'react';

import { PasskeyList, PasskeyManager, PasskeySetup, PasskeySignInButton } from './passkey-setup';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof PasskeySetup> = {
  component: PasskeySetup,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Passkey authentication components for passwordless login and enhanced security.',
      },
    },
    layout: 'centered',
  },
  title: 'UIX/Auth/Passkeys',
};

export default meta;
type Story = StoryObj<typeof PasskeySetup>;

// PasskeySetup Stories
export const Setup: Story = {
  args: {
    onCancel: () => console.log('Passkey setup cancelled'),
    onComplete: () => console.log('Passkey setup completed'),
  },
};

export const SetupWithCustomLabels: Story = {
  args: {
    onCancel: () => console.log('Registration cancelled'),
    onComplete: () => console.log('Passkey registered'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Passkey setup with custom completion and cancellation handlers.',
      },
    },
  },
};

export const SetupInteractive: Story = {
  args: {
    onCancel: () => console.log('Passkey setup cancelled'),
    onComplete: () => console.log('Passkey setup completed'),
  },
};

// PasskeyList Stories
export const ListEmpty: StoryObj<typeof PasskeyList> = {
  args: {
    refreshTrigger: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Passkey list when no passkeys are registered.',
      },
    },
  },
  render: (args) => <PasskeyList {...args} />,
};

export const ListWithPasskeys: StoryObj<typeof PasskeyList> = {
  args: {
    refreshTrigger: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Passkey list displaying multiple registered passkeys.',
      },
    },
  },
  render: (args) => <PasskeyList {...args} />,
};

export const ListInteractive: StoryObj<typeof PasskeyList> = {
  args: {
    refreshTrigger: Date.now(),
  },
  render: (args) => <PasskeyList {...args} />,
};

// PasskeyManager Stories
export const Manager: StoryObj<typeof PasskeyManager> = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Complete passkey management interface with setup and list functionality.',
      },
    },
  },
  render: (args) => <PasskeyManager {...args} />,
};

export const ManagerWithMockData: StoryObj<typeof PasskeyManager> = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Passkey manager with simulated passkey data.',
      },
    },
  },
  render: (args) => <PasskeyManager {...args} />,
};

// PasskeySignInButton Stories
export const SignInButton: StoryObj<typeof PasskeySignInButton> = {
  args: {
    onError: () => console.log('Passkey sign-in failed'),
    onSuccess: () => console.log('Passkey sign-in successful'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Passkey sign-in button for authentication forms.',
      },
    },
  },
  render: (args) => <PasskeySignInButton {...args} />,
};

export const SignInButtonVariants: StoryObj<typeof PasskeySignInButton> = {
  parameters: {
    docs: {
      description: {
        story: 'Multiple passkey sign-in buttons showing consistent styling.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <PasskeySignInButton
        onError={() => console.log('Default error')}
        onSuccess={() => console.log('Default success')}
      />
      <PasskeySignInButton
        onError={() => console.log('Second button error')}
        onSuccess={() => console.log('Second button success')}
      />
      <PasskeySignInButton
        onError={() => console.log('Third button error')}
        onSuccess={() => console.log('Third button success')}
      />
    </div>
  ),
};

export const SignInButtonInteractive: StoryObj<typeof PasskeySignInButton> = {
  args: {
    onError: () => console.log('Passkey authentication failed'),
    onSuccess: () => console.log('Passkey authentication successful'),
  },
  render: (args) => <PasskeySignInButton {...args} />,
};

// Complete Passkey Flow
export const CompleteFlow: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Complete passkey flow showing sign-in, management, and setup components.',
      },
    },
  },
  render: () => {
    const [showSetup, setShowSetup] = React.useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <PasskeySignInButton
          onError={() => console.log('Passkey sign-in failed')}
          onSuccess={() => console.log('Passkey sign-in successful')}
        />

        <PasskeyManager />

        {showSetup && (
          <PasskeySetup
            onCancel={() => {
              setShowSetup(false);
              console.log('Setup cancelled');
            }}
            onComplete={() => {
              setShowSetup(false);
              console.log('New passkey added');
            }}
          />
        )}

        {!showSetup && (
          <button onClick={() => setShowSetup(true)} style={{ padding: '0.5rem 1rem' }}>
            Add New Passkey
          </button>
        )}
      </div>
    );
  },
};
