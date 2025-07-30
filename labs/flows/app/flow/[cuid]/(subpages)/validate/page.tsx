import { Metadata } from 'next';
import { PageFrame } from '#/ui/shared';
import { FlowValidation } from './UI';
import { Container } from '@mantine/core';

interface NewFlowPageProps {
  params: Promise<{
    domain: string;
    cuid: string; // Added since it's in the URL path
  }>;
}

export const metadata: Metadata = {
  title: 'Test & Validate Flow | Flowbuilder',
};

const NewFlowPage = async ({ params }: NewFlowPageProps) => {
  // Await the params if you need to use them
  const { domain: _domain, cuid: _cuid } = await params;

  return (
    <Container size="lg">
      <PageFrame title="Test & Validate">
        <FlowValidation />
      </PageFrame>
    </Container>
  );
};

export default NewFlowPage;
