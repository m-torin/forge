// Temporarily disabled due to client/server import conflicts
// TODO: Fix feature flags client/server separation

'use client';

import { Alert, Badge, Card, Group, Stack, Text, Title } from '@mantine/core';
// import { useFlag } from '@repo/feature-flags/client/next';

// import {
//   aiSuggestionsFlag,
//   enhancedPIMFlag,
//   newAdminDashboardFlag,
//   tableLayoutVariantFlag,
//   workflowAutomationFlag,
// } from '../lib/feature-flags';

export function FeatureFlagDemo() {
  // Temporarily disabled - use mock values
  const newDashboard = false;
  const enhancedPIM = false;
  const workflowAutomation = false;
  const aiSuggestions = false;
  const tableLayout: 'default' | 'compact' | 'expanded' = 'default';

  return (
    <Stack>
      <Title order={3}>Feature Flags Demo</Title>
      <Text size="sm" c="dimmed">
        This component demonstrates how feature flags are integrated with the Vercel Toolbar. Toggle
        flags in the toolbar to see changes in real-time.
      </Text>

      <Group>
        <Badge color={newDashboard ? 'green' : 'gray'} variant="filled">
          New Dashboard: {newDashboard ? 'Enabled' : 'Disabled'}
        </Badge>
        <Badge color={enhancedPIM ? 'green' : 'gray'} variant="filled">
          Enhanced PIM: {enhancedPIM ? 'Enabled' : 'Disabled'}
        </Badge>
        <Badge color={workflowAutomation ? 'green' : 'gray'} variant="filled">
          Workflow Automation: {workflowAutomation ? 'Enabled' : 'Disabled'}
        </Badge>
        <Badge color={aiSuggestions ? 'green' : 'gray'} variant="filled">
          AI Suggestions: {aiSuggestions ? 'Enabled' : 'Disabled'}
        </Badge>
      </Group>

      <Card withBorder>
        <Stack>
          <Text fw={500}>Table Layout Variant: {tableLayout}</Text>
          {tableLayout !== 'default' && tableLayout === 'compact' && (
            <Alert color="blue" title="Compact Layout">
              Tables will use compact spacing for better density.
            </Alert>
          )}
          {tableLayout !== 'default' && tableLayout === 'expanded' && (
            <Alert color="green" title="Expanded Layout">
              Tables will use expanded spacing for better readability.
            </Alert>
          )}
          {tableLayout === 'default' && (
            <Alert color="gray" title="Default Layout">
              Tables will use the standard layout.
            </Alert>
          )}
        </Stack>
      </Card>

      {newDashboard && (
        <Alert color="green" title="New Dashboard Enabled">
          You&apos;re seeing the new admin dashboard layout!
        </Alert>
      )}

      {enhancedPIM && (
        <Alert color="blue" title="Enhanced PIM Enabled">
          The Product Information Management interface has enhanced features.
        </Alert>
      )}

      {workflowAutomation && (
        <Alert color="purple" title="Workflow Automation Beta">
          Workflow automation features are now available.
        </Alert>
      )}

      {aiSuggestions && (
        <Alert color="orange" title="AI Suggestions Active">
          AI-powered suggestions are enabled throughout the interface.
        </Alert>
      )}
    </Stack>
  );
}
