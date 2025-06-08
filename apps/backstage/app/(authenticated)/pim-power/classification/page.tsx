'use client';

import { Container, Stack, Text, Title } from '@mantine/core';

import { TaxonomyVerificationList } from './components/TaxonomyVerificationList';

export default function TaxonomyVerificationPage() {
  return (
    <Container py="xl" size="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>Taxonomy Verification</Title>
          <Text c="dimmed" mt="xs">
            Review and approve product classifications to improve accuracy
          </Text>
        </div>

        <TaxonomyVerificationList />
      </Stack>
    </Container>
  );
}
