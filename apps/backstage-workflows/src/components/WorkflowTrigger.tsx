'use client';

import { useState } from 'react';
import {
  Paper,
  Title,
  TextInput,
  Button,
  Stack,
  Group,
  Alert,
  LoadingOverlay,
  Text,
  NumberInput,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconRocket } from '@tabler/icons-react';
import {
  CustomerOnboardingInputSchema,
  triggerCustomerOnboardingAction,
} from '../workflows/customer-onboarding';
import type { CustomerOnboardingInput } from '../workflows/customer-onboarding';

interface WorkflowTriggerProps {
  onWorkflowTriggered?: (workflowRunId: string) => void;
}

export function WorkflowTrigger({ onWorkflowTriggered }: WorkflowTriggerProps) {
  const [loading, setLoading] = useState(false);
  const [lastTriggeredId, setLastTriggeredId] = useState<string | null>(null);

  const form = useForm<CustomerOnboardingInput & { retries: number }>({
    validate: zodResolver(CustomerOnboardingInputSchema),
    initialValues: {
      userId: '',
      email: '',
      name: '',
      company: '',
      role: '',
      retries: 3,
    },
  });

  const handleSubmit = async (values: CustomerOnboardingInput & { retries: number }) => {
    setLoading(true);

    try {
      const { userId, email, name, company, role, retries } = values;

      const result = await triggerCustomerOnboardingAction(
        { userId, email, name, company, role },
        { retries },
      );

      if (result.success && result.workflowRunId) {
        setLastTriggeredId(result.workflowRunId);

        notifications.show({
          title: 'Workflow Started!',
          message: `Customer onboarding workflow triggered for ${name}`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });

        // Reset form after successful submission
        form.reset();

        // Notify parent component
        onWorkflowTriggered?.(result.workflowRunId);
      } else {
        throw new Error(result.error || 'Failed to trigger workflow');
      }
    } catch (error: any) {
      console.error('Failed to trigger workflow:', error);

      notifications.show({
        title: 'Failed to Start Workflow',
        message: error.message || 'An unexpected error occurred',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const sampleUsers = [
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@techcorp.com',
        company: 'TechCorp',
        role: 'Software Engineer',
      },
      {
        name: 'Bob Smith',
        email: 'bob.smith@startup.io',
        company: 'Startup.io',
        role: 'Product Manager',
      },
      {
        name: 'Carol Davis',
        email: 'carol.davis@enterprise.com',
        company: 'Enterprise Solutions',
        role: 'Data Analyst',
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@consulting.biz',
        company: 'Wilson Consulting',
        role: 'Consultant',
      },
    ];

    const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
    const randomUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    form.setValues({
      userId: randomUserId,
      email: randomUser.email,
      name: randomUser.name,
      company: randomUser.company,
      role: randomUser.role,
      retries: 3,
    });
  };

  return (
    <Paper p="md" withBorder radius="md" pos="relative">
      <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 2 }} />

      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Trigger Customer Onboarding</Title>
          <Button variant="light" size="xs" onClick={generateSampleData} disabled={loading}>
            Fill Sample Data
          </Button>
        </Group>

        <Text size="sm" c="dimmed">
          Start a customer onboarding workflow that will send welcome emails, wait for a delay,
          generate an AI follow-up message, and send a personalized email.
        </Text>

        {lastTriggeredId && (
          <Alert color="blue" title="Last Workflow Triggered">
            Workflow ID:{' '}
            <Text component="span" ff="monospace">
              {lastTriggeredId}
            </Text>
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Group grow>
              <TextInput
                label="User ID"
                placeholder="user_12345"
                required
                {...form.getInputProps('userId')}
              />
              <TextInput
                label="Email"
                placeholder="user@example.com"
                type="email"
                required
                {...form.getInputProps('email')}
              />
            </Group>

            <TextInput
              label="Full Name"
              placeholder="John Doe"
              required
              {...form.getInputProps('name')}
            />

            <Group grow>
              <TextInput
                label="Company (Optional)"
                placeholder="Acme Corp"
                {...form.getInputProps('company')}
              />
              <TextInput
                label="Role (Optional)"
                placeholder="Software Engineer"
                {...form.getInputProps('role')}
              />
            </Group>

            <NumberInput
              label="Retries"
              description="Number of retries if the workflow fails"
              min={0}
              max={10}
              {...form.getInputProps('retries')}
            />

            <Button
              type="submit"
              leftSection={<IconRocket size={16} />}
              loading={loading}
              disabled={loading}
            >
              Start Workflow
            </Button>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
