// page.tsx

import { Metadata } from 'next';
import { Box } from '@mantine/core';
import { ReactFlow12 } from '#/flows/';

/**
 * Defines the shape of the route parameters.
 */
interface FlowPageParams {
  params: Promise<{
    cuid: string;
  }>;
}

/**
 * Generates metadata for the Flow page based on the route parameters.
 * This function is asynchronous and handles Promise-based params.
 */
export const generateMetadata = async ({
  params,
}: FlowPageParams): Promise<Metadata> => {
  const { cuid } = await params;

  return {
    title: `Flow ${cuid} | Flowbuilder`,
  };
};

export default function Page() {
  return (
    <Box pos="relative" h="calc(100vh - 120px)">
      <ReactFlow12 />
    </Box>
  );
}
