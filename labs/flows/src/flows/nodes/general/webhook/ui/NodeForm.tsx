'use client';

import React, { FC, memo } from 'react';
import { Stack, Badge, Group, Alert } from '@mantine/core';
import { useCombinedContext } from '#/flows/nodes/internal';
import { FormValues } from '../formSchema';
import {
  IconArrowDown,
  IconArrowUp,
  IconRefresh,
  IconAlertCircle,
} from '@tabler/icons-react';
import { SourceConfig } from './u/SourceConfig';
import { DestinationConfig } from './u/DestinationConfig';
import { EnrichmentConfig } from './u/EnrichmentConfig';
import { SharedConfig } from './u/SharedConfig';
import { ButtonCopy } from '#/ui/shared';

type NodeMode = 'source' | 'destination' | 'enrichment' | string;

// Add error boundary component
class NodeFormErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Something went wrong"
          color="red"
          variant="filled"
        >
          There was an error loading the form. Please try refreshing the page.
        </Alert>
      );
    }

    return this.props.children;
  }
}

interface NodeFormHeaderProps {
  mode: NodeMode;
  nodeId?: string; // Make nodeId optional
}

const NodeFormHeader: FC<NodeFormHeaderProps> = memo(({ mode, nodeId }) => {
  // Early return with fallback UI if nodeId is missing
  if (!nodeId) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Configuration Error"
        color="yellow"
        variant="filled"
      >
        Node ID is not available. Please ensure the node is properly configured.
      </Alert>
    );
  }

  const fullUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/webhook/${nodeId}`
      : `/api/webhook/${nodeId}`;

  const getBadgeProps = (currentMode: NodeMode) => {
    switch (currentMode) {
      case 'source':
        return {
          color: 'green.6',
          icon: <IconArrowDown size={14} />,
          label: 'Incoming',
        };
      case 'destination':
        return {
          color: 'red',
          icon: <IconArrowUp size={14} />,
          label: 'Outgoing',
        };
      case 'enrichment':
        return {
          color: 'blue',
          icon: <IconRefresh size={14} />,
          label: 'Enrichment',
        };
      default:
        return {
          color: 'gray',
          icon: null,
          label: 'Unknown Mode',
        };
    }
  };

  const badgeProps = getBadgeProps(mode);

  return (
    <Group justify="space-between" align="center" mb="md">
      <Badge
        size="lg"
        leftSection={badgeProps.icon}
        color={badgeProps.color}
        variant="filled"
      >
        {badgeProps.label}
      </Badge>

      <Group gap="xs">
        <Badge radius="sm" size="lg" variant="light" color="gray.6">
          {`/api/webhook/${nodeId}`}
        </Badge>

        <ButtonCopy copyThis={fullUrl} size="sm">
          Copy
        </ButtonCopy>
      </Group>
    </Group>
  );
});

NodeFormHeader.displayName = 'NodeFormHeader';

const NodeFormContent: FC = () => {
  const context = useCombinedContext<FormValues>();

  // Handle null context
  if (!context) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Missing Configuration"
        color="yellow"
        variant="filled"
      >
        Unable to load form configuration. Please ensure you&apos;re accessing this
        page correctly.
      </Alert>
    );
  }

  const { form, node } = context;

  // Handle missing form
  if (!form) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Form Initialization Error"
        color="yellow"
        variant="filled"
      >
        Form configuration is not available. Please try refreshing the page.
      </Alert>
    );
  }

  const currentMode = form.getValues()?.metadata?.nodeMode || 'unknown';

  return (
    <Stack bg="var(--mantine-color-body)" gap="md" p="md">
      <NodeFormHeader mode={currentMode} nodeId={node?.nodeId ?? ''} />

      <SharedConfig />

      {currentMode === 'source' && <SourceConfig key="source-config" />}
      {currentMode === 'destination' && (
        <DestinationConfig key="destination-config" />
      )}
      {currentMode === 'enrichment' && (
        <EnrichmentConfig key="enrichment-config" />
      )}
    </Stack>
  );
};

export const NodeForm: FC = memo(() => {
  return (
    <NodeFormErrorBoundary>
      <NodeFormContent />
    </NodeFormErrorBoundary>
  );
});

NodeForm.displayName = 'WebhookForm';

export default NodeForm;
