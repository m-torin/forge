import { Metadata } from 'next';
import { PageFrame } from '#/ui/shared';
import { FlowSettings } from './UI';
import { Container } from '@mantine/core';

interface NewFlowPageProps {
  params: Promise<{
    domain: string;
    cuid: string; // Added since it's in the URL path
  }>;
}

export const metadata: Metadata = {
  title: 'Create a new Flow | Flowbuilder',
};

const NewFlowPage = async ({ params }: NewFlowPageProps) => {
  // Await the params since they're now a Promise
  const { domain: _domain, cuid: _cuid } = await params;

  return (
    <Container size="lg">
      <PageFrame title="Flow Settings">
        <FlowSettings />
      </PageFrame>
    </Container>
  );
};

export default NewFlowPage;
