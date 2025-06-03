import React from 'react';

import {
  EmailVerificationBanner,
  EmailVerificationPage,
  EmailVerificationPrompt,
} from './email-verification';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof EmailVerificationBanner> = {
  component: EmailVerificationBanner,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Email verification components for user account validation and security.',
      },
    },
    layout: 'centered',
  },
  title: 'UIX/Auth/Email Verification',
};

export default meta;
type Story = StoryObj<typeof EmailVerificationBanner>;

// EmailVerificationBanner Stories
export const Banner: Story = {
  args: {
    onVerified: () => console.log('Email verified'),
  },
};

export const BannerWithLongEmail: Story = {
  args: {
    onVerified: () => console.log('Email verified'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Email verification banner with a long email address.',
      },
    },
  },
};

export const BannerNoDismiss: Story = {
  args: {
    onVerified: () => console.log('Email verified'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Email verification banner without dismiss functionality.',
      },
    },
  },
};

export const BannerInteractive: Story = {
  args: {
    onVerified: () => console.log('Email verified'),
  },
};

// EmailVerificationPage Stories
export const Page: StoryObj<typeof EmailVerificationPage> = {
  args: {
    onComplete: () => console.log('Verification complete'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Full-page email verification component with instructions and actions.',
      },
    },
  },
  render: (args) => <EmailVerificationPage {...args} />,
};

export const PageWithoutBackButton: StoryObj<typeof EmailVerificationPage> = {
  args: {
    onComplete: () => console.log('Verification complete'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Email verification page without back to sign-in option.',
      },
    },
  },
  render: (args) => <EmailVerificationPage {...args} />,
};

export const PageInteractive: StoryObj<typeof EmailVerificationPage> = {
  args: {
    onComplete: () => console.log('Verification complete'),
  },
  render: (args) => <EmailVerificationPage {...args} />,
};

// EmailVerificationPrompt Stories
export const Prompt: StoryObj<typeof EmailVerificationPrompt> = {
  args: {
    email: 'user@example.com',
    onResend: () => console.log('Resend verification email'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Email verification prompt for encouraging users to verify their email.',
      },
    },
  },
  render: (args) => <EmailVerificationPrompt {...args} />,
};

export const PromptNoSkip: StoryObj<typeof EmailVerificationPrompt> = {
  args: {
    email: 'user@example.com',
  },
  parameters: {
    docs: {
      description: {
        story: 'Email verification prompt without skip option (required verification).',
      },
    },
  },
  render: (args) => <EmailVerificationPrompt {...args} />,
};

export const PromptInteractive: StoryObj<typeof EmailVerificationPrompt> = {
  args: {
    email: 'user@example.com',
    onResend: () => console.log('Resend verification email'),
  },
  render: (args) => <EmailVerificationPrompt {...args} />,
};

// Different Email Types
export const DifferentEmailTypes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Email verification banners with different email address formats.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <EmailVerificationBanner onVerified={() => console.log('Gmail verified')} />
      <EmailVerificationBanner onVerified={() => console.log('Business verified')} />
      <EmailVerificationBanner onVerified={() => console.log('Complex verified')} />
    </div>
  ),
};

// Verification States
export const VerificationStates: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Email verification with loading states and success feedback.',
      },
    },
  },
  render: () => {
    const [isVerified, setIsVerified] = React.useState(false);

    const handleVerified = () => {
      setIsVerified(true);
      console.log('Email verified');
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <EmailVerificationBanner onVerified={handleVerified} />

        {isVerified && (
          <div
            style={{
              backgroundColor: '#d4edda',
              borderRadius: '4px',
              color: '#155724',
              padding: '1rem',
            }}
          >
            ✅ Email verified successfully!
          </div>
        )}
      </div>
    );
  },
};

// Complete Verification Flow
export const CompleteFlow: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Complete email verification flow showing all component states and transitions.',
      },
    },
  },
  render: () => {
    const [currentStep, setCurrentStep] = React.useState<'prompt' | 'page' | 'banner'>('prompt');
    const email = 'user@example.com';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {currentStep === 'prompt' && (
          <EmailVerificationPrompt
            onResend={() => {
              console.log('Resend from prompt');
            }}
            email={email}
          />
        )}

        {currentStep === 'page' && (
          <EmailVerificationPage
            onComplete={() => {
              setCurrentStep('banner');
              console.log('Verification complete');
            }}
          />
        )}

        {currentStep === 'banner' && (
          <EmailVerificationBanner onVerified={() => console.log('Email verified from banner')} />
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={() => setCurrentStep('prompt')}>Show Prompt</button>
          <button onClick={() => setCurrentStep('page')}>Show Page</button>
          <button onClick={() => setCurrentStep('banner')}>Show Banner</button>
        </div>
      </div>
    );
  },
};
