// layout.tsx

import { sanitizeFormName } from '#/lib';
import { getFlowByIdAction } from '#/lib/prisma';
import { FlowProvider } from './FlowProvider';
import { logInfo } from '@repo/observability';
import { env } from '#/root/env';

interface FlowLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    cuid: string;
  }>;
}

export default async function FlowLayout({
  children,
  params,
}: FlowLayoutProps) {
  // Await the params since they're now a Promise
  const { cuid } = await params;

  const flowData = await getFlowByIdAction(cuid);
  logInfo('Flow Data retrieved for layout', { 
    flowData, 
    cuid
  });

  const sanitizedCuid = sanitizeFormName(cuid);
  if (!sanitizedCuid) {
    throw new Error('Invalid CUID after sanitization');
  }

  const formOptions = {
    mode: 'uncontrolled' as const,
    name: `flow-${sanitizedCuid}`,
  };

  // In demo mode or if instanceId is missing, use demo instance
  const instanceId = flowData?.flow?.instanceId || env.DEMO_INSTANCE_ID;

  return (
    <FlowProvider
      formOptions={formOptions}
      nextParams={await params} // Pass the resolved params
      instanceId={instanceId}
      prismaData={flowData}
      error={null}
    >
      {children}
    </FlowProvider>
  );
}
