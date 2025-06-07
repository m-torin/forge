'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Loader,
  Progress,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconGift,
  IconMail,
  IconRefresh,
  IconRocket,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface OnboardingStep {
  description: string;
  icon: React.ComponentType<any>;
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'create-user-profile',
    name: 'Create Profile',
    description: 'Initialize user profile with defaults',
    icon: IconUser,
    status: 'pending',
  },
  {
    id: 'send-welcome-email',
    name: 'Welcome Email',
    description: 'Send personalized welcome email',
    icon: IconMail,
    status: 'pending',
  },
  {
    id: 'check-referral',
    name: 'Check Referral',
    description: 'Validate referral code if provided',
    icon: IconGift,
    status: 'pending',
  },
  {
    id: 'create-workspace',
    name: 'Setup Workspace',
    description: 'Create initial workspace and project',
    icon: IconSettings,
    status: 'pending',
  },
  {
    id: 'finalize-onboarding',
    name: 'Complete Setup',
    description: 'Finalize onboarding process',
    icon: IconRocket,
    status: 'pending',
  },
];

export default function UserOnboardingWorkflowPage() {
  const [steps, setSteps] = useState<OnboardingStep[]>(onboardingSteps);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    preferences: {
      marketingEmails: false,
      newsletter: true,
      productUpdates: true,
    },
    referralCode: '',
    signupSource: 'organic',
    userId: '',
  });

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep && isRunning) return 'running';
    if (stepIndex === currentStep && !isRunning && currentStep > 0) return 'failed';
    return 'pending';
  };

  const getStepIcon = (step: OnboardingStep, stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    const IconComponent = step.icon;

    if (status === 'completed') {
      return <IconCheck size={16} />;
    }
    if (status === 'running') {
      return <Loader size={16} />;
    }
    if (status === 'failed') {
      return <IconAlertCircle size={16} />;
    }
    return <IconComponent size={16} />;
  };

  const getStepColor = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    switch (status) {
      case 'completed':
        return 'green';
      case 'running':
        return 'blue';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const simulateWorkflow = async () => {
    setIsRunning(true);
    setCurrentStep(0);

    try {
      // Start workflow execution via API
      const response = await fetch('/api/workflows/simple-test', {
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start workflow');
      }

      const { executionId } = await response.json();

      // Poll for status updates
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `/api/workflows/simple-test?executionId=${executionId}`,
          );
          const execution = await statusResponse.json();

          // Update current step based on completed steps
          const completedSteps = execution.steps.filter(
            (s: any) => s.status === 'completed',
          ).length;
          const runningStep = execution.steps.findIndex((s: any) => s.status === 'running');

          setCurrentStep(runningStep >= 0 ? runningStep : completedSteps);

          if (execution.status === 'completed') {
            setCurrentStep(steps.length);
            setIsRunning(false);
            clearInterval(pollInterval);
          } else if (execution.status === 'failed') {
            setIsRunning(false);
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Error polling workflow status:', error);
          setIsRunning(false);
          clearInterval(pollInterval);
        }
      }, 1000);

      // Cleanup after 30 seconds to prevent infinite polling
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isRunning) {
          setIsRunning(false);
        }
      }, 30000);
    } catch (error) {
      console.error('Workflow execution error:', error);
      setIsRunning(false);
    }
  };

  const resetWorkflow = () => {
    setCurrentStep(0);
    setIsRunning(false);
    setSteps(onboardingSteps);
  };

  const progress = currentStep > 0 ? (currentStep / steps.length) * 100 : 0;

  useEffect(() => {
    // Track page view
    console.log('Page Viewed: user_onboarding_workflow');
  }, []);

  return (
    <Container py="xl" size="lg">
      <Stack gap="xl">
        <div>
          <Title order={1}>User Onboarding Workflow</Title>
          <Text c="dimmed" mt="md">
            Test and manage the automated user onboarding process
          </Text>
        </div>

        {/* Workflow Configuration */}
        <Card shadow="sm" withBorder p="lg">
          <Title order={3} mb="md">
            Workflow Configuration
          </Title>

          <Stack gap="md">
            <Group grow>
              <TextInput
                data-testid="user-id-input"
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                placeholder="user_123456"
                label="User ID"
                value={formData.userId}
              />
              <TextInput
                data-testid="email-input"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                label="Email Address"
                value={formData.email}
              />
            </Group>

            <Group grow>
              <Select
                data-testid="signup-source-select"
                onChange={(value) => setFormData({ ...formData, signupSource: value || 'organic' })}
                data={[
                  { label: 'Organic', value: 'organic' },
                  { label: 'Social Media', value: 'social' },
                  { label: 'Referral', value: 'referral' },
                  { label: 'Paid Campaign', value: 'paid' },
                ]}
                label="Signup Source"
                value={formData.signupSource}
              />
              <TextInput
                data-testid="referral-code-input"
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                placeholder="REF123456"
                label="Referral Code (Optional)"
                value={formData.referralCode}
              />
            </Group>

            <div>
              <Text fw={500} mb="xs" size="sm">
                Email Preferences
              </Text>
              <Stack gap="xs">
                <Switch
                  data-testid="newsletter-switch"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, newsletter: e.currentTarget.checked },
                    })
                  }
                  checked={formData.preferences.newsletter}
                  label="Newsletter subscription"
                />
                <Switch
                  data-testid="product-updates-switch"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        productUpdates: e.currentTarget.checked,
                      },
                    })
                  }
                  checked={formData.preferences.productUpdates}
                  label="Product updates"
                />
                <Switch
                  data-testid="marketing-emails-switch"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        marketingEmails: e.currentTarget.checked,
                      },
                    })
                  }
                  checked={formData.preferences.marketingEmails}
                  label="Marketing emails"
                />
              </Stack>
            </div>
          </Stack>
        </Card>

        {/* Workflow Progress */}
        <Card shadow="sm" withBorder p="lg">
          <Group justify="space-between" mb="md">
            <Title order={3}>Workflow Progress</Title>
            <Group>
              <ActionIcon
                data-testid="reset-workflow-button"
                onClick={resetWorkflow}
                disabled={isRunning}
                variant="light"
              >
                <IconRefresh size={16} />
              </ActionIcon>
              <Button
                data-testid="start-workflow-button"
                loading={isRunning}
                onClick={simulateWorkflow}
                disabled={!formData.userId || !formData.email}
              >
                {isRunning ? 'Running Workflow...' : 'Start Onboarding'}
              </Button>
            </Group>
          </Group>

          <Progress data-testid="workflow-progress" mb="lg" value={progress} />

          <Stack gap="sm">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const color = getStepColor(index);

              return (
                <Group key={step.id} data-testid={`step-${step.id}`} wrap="nowrap">
                  <ThemeIcon color={color} size="sm" variant="light">
                    {getStepIcon(step, index)}
                  </ThemeIcon>
                  <div style={{ flex: 1 }}>
                    <Group justify="space-between">
                      <Text fw={500} size="sm">
                        {step.name}
                      </Text>
                      <Badge color={color} size="xs" variant="light">
                        {status}
                      </Badge>
                    </Group>
                    <Text c="dimmed" size="xs">
                      {step.description}
                    </Text>
                  </div>
                </Group>
              );
            })}
          </Stack>
        </Card>

        {/* Status Messages */}
        {currentStep === steps.length && !isRunning && (
          <Alert
            data-testid="success-alert"
            color="green"
            icon={<IconCheck size={16} />}
            title="Onboarding Complete!"
          >
            User onboarding workflow completed successfully. All steps have been executed.
          </Alert>
        )}

        {!isRunning && currentStep > 0 && currentStep < steps.length && (
          <Alert
            data-testid="error-alert"
            color="red"
            icon={<IconAlertCircle size={16} />}
            title="Workflow Failed"
          >
            The workflow failed at step {currentStep + 1}: {steps[currentStep]?.name}. Check the
            logs for more details.
          </Alert>
        )}

        {isRunning && (
          <Alert
            data-testid="running-alert"
            color="blue"
            icon={<IconClock size={16} />}
            title="Workflow Running"
          >
            Executing step {currentStep + 1} of {steps.length}: {steps[currentStep]?.name}
          </Alert>
        )}

        <Divider />

        {/* Workflow Information */}
        <Card shadow="sm" withBorder p="lg">
          <Title order={4} mb="md">
            Workflow Details
          </Title>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text c="dimmed" size="sm">
                Workflow ID
              </Text>
              <Text ff="monospace" size="sm">
                user-onboarding
              </Text>
            </Group>
            <Group justify="space-between">
              <Text c="dimmed" size="sm">
                Version
              </Text>
              <Text size="sm">1.0.0</Text>
            </Group>
            <Group justify="space-between">
              <Text c="dimmed" size="sm">
                Max Duration
              </Text>
              <Text size="sm">2 minutes</Text>
            </Group>
            <Group justify="space-between">
              <Text c="dimmed" size="sm">
                Critical Steps
              </Text>
              <Text size="sm">create-user-profile, create-workspace</Text>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
