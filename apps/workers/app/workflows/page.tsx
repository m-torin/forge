import { Container, Stack, Text, Title } from '@mantine/core';

import { WorkflowGrid } from './_components/workflow-grid';
import { loadAllWorkflowMetadata } from './loader';

export default async function WorkflowsPage() {
  // Load all workflow metadata at request time
  const workflowMetadata = await loadAllWorkflowMetadata();

  return (
    <Container py="xl" size="lg">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            Self-Contained Workflows
          </Title>
          <Text c="dimmed" size="lg">
            Dynamically loaded workflows with auto-discovery
          </Text>
        </div>

        <WorkflowGrid workflows={Object.values(workflowMetadata)} />
      </Stack>
    </Container>
  );
}
