import { Container, Title, Text, Stack } from '@mantine/core';

import { loadAllWorkflowMetadata } from './loader';
import { WorkflowGrid } from './_components/workflow-grid';

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