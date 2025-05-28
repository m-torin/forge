import {
  Anchor,
  Box,
  Container,
  Group,
  Stack,
  Text,
  Title,
  TypographyStylesProvider,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';

import { createMetadata } from '@repo/seo/metadata';

import type { Metadata, Route } from 'next';

interface LegalPageProperties {
  readonly params: Promise<{
    slug: string;
  }>;
}

export const generateMetadata = async ({ params }: LegalPageProperties): Promise<Metadata> => {
  const { slug } = await params;

  return createMetadata({
    description: `${slug === 'privacy' ? 'Privacy Policy' : 'Terms of Service'} for Forge Ahead`,
    title: slug === 'privacy' ? 'Privacy Policy' : 'Terms of Service',
  });
};

export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
  return [{ slug: 'privacy' }, { slug: 'terms' }];
};

const LegalPage = async ({ params }: LegalPageProperties) => {
  const { slug } = await params;

  return (
    <Container py={64}>
      <Anchor href={'/' as Route} component={Link} c="dimmed" mb={16} size="sm" underline="never">
        <Group align="center" gap={4}>
          <IconArrowLeft size={16} />
          Back to Home
        </Group>
      </Anchor>
      <Box maw={800} mt={64}>
        <Title order={1} fw={800} mb={32} size="h1">
          {slug === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
        </Title>
        <TypographyStylesProvider>
          <Stack gap="xl">
            <Text c="dimmed">Last updated: {new Date().toLocaleDateString()}</Text>

            <div>
              <Title order={2} mb="md" size="h2">
                Hello World
              </Title>
              <Text>
                This is a placeholder for the{' '}
                {slug === 'privacy' ? 'Privacy Policy' : 'Terms of Service'} content.
              </Text>
            </div>

            <div>
              <Title order={3} mb="sm" size="h3">
                Acceptance
              </Title>
              <Text>By using our service, you agree to these terms.</Text>
            </div>

            <div>
              <Title order={3} mb="sm" size="h3">
                Changes
              </Title>
              <Text>We may update this policy from time to time.</Text>
            </div>

            <div>
              <Title order={3} mb="sm" size="h3">
                Contact
              </Title>
              <Text>If you have any questions, please contact us.</Text>
            </div>
          </Stack>
        </TypographyStylesProvider>
      </Box>
    </Container>
  );
};

export default LegalPage;
