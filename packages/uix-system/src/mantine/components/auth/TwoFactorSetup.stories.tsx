import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { TwoFactorSetup, type TwoFactorStep } from './TwoFactorSetup';

// Wrapper component to handle state for interactive stories
const TwoFactorSetupWrapper = (props: any) => {
  const [currentStep, setCurrentStep] = useState<TwoFactorStep>(props.currentStep || 'qr');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStepChange = (step: TwoFactorStep) => {
    setCurrentStep(step);
    console.log('Step changed:', step);
  };

  const handleEnable = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setLoading(false);
    handleStepChange('verify');
  };

  const handleVerify = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    if (verificationCode === '123456') {
      setError(null);
      setLoading(false);
      handleStepChange('backup');
    } else {
      setError('Invalid verification code. Please try again.');
      setLoading(false);
    }
  };

  const handleComplete = () => {
    console.log('Setup completed');
  };

  return (
    <TwoFactorSetup
      {...props}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      verificationCode={verificationCode}
      onVerificationCodeChange={setVerificationCode}
      onEnable={handleEnable}
      onVerify={handleVerify}
      onComplete={handleComplete}
      loading={loading}
      error={error}
    />
  );
};

const meta: Meta<typeof TwoFactorSetup> = {
  title: 'Auth/Security/TwoFactorSetup',
  component: TwoFactorSetupWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentStep: {
      control: 'select',
      options: ['qr', 'verify', 'backup'],
    },
    qrSize: { control: 'number' },
    pinLength: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockQrCode =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
const mockSecret = 'JBSWY3DPEHPK3PXP';
const mockBackupCodes = [
  'a1b2c3d4e5f6',
  'g7h8i9j0k1l2',
  'm3n4o5p6q7r8',
  's9t0u1v2w3x4',
  'y5z6a7b8c9d0',
  'e1f2g3h4i5j6',
  'k7l8m9n0o1p2',
  'q3r4s5t6u7v8',
];

export const QRCodeStep: Story = {
  args: {
    currentStep: 'qr',
    qrCode: mockQrCode,
    secret: mockSecret,
  },
};

export const QRCodeLoading: Story = {
  args: {
    currentStep: 'qr',
    qrCode: null,
    secret: null,
  },
};

export const VerifyStep: Story = {
  args: {
    currentStep: 'verify',
  },
};

export const BackupCodesStep: Story = {
  args: {
    currentStep: 'backup',
    backupCodes: mockBackupCodes,
  },
};

export const CustomSizes: Story = {
  args: {
    currentStep: 'qr',
    qrCode: mockQrCode,
    secret: mockSecret,
    qrSize: 150,
    pinLength: 8,
  },
};

export const CustomTitles: Story = {
  args: {
    currentStep: 'qr',
    qrCode: mockQrCode,
    secret: mockSecret,
    title: {
      qr: 'Enable 2FA Security',
      verify: 'Confirm Your Setup',
      backup: 'Save Recovery Codes',
    },
    subtitle: {
      qr: 'Scan the QR code with your preferred authenticator app',
      verify: 'Enter the code from your authenticator to confirm setup',
      backup: 'Store these codes safely - they are your backup access method',
    },
  },
};

export const Interactive: Story = {
  args: {
    currentStep: 'qr',
    qrCode: mockQrCode,
    secret: mockSecret,
    backupCodes: mockBackupCodes,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo - enter "123456" in the verify step to proceed to backup codes.',
      },
    },
  },
};
