'use client';

import React, { ReactNode, useCallback, memo, useState, useMemo } from 'react';
import * as Sentry from '@sentry/react';
import { Paper as MantinePaper, rem, Popover, Box } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { Position, useReactFlow } from '@xyflow/react';
import { logError } from '@repo/observability';

import { FbNode, FbEdge } from '#/flows/types';
import { NodePreview } from './NodePreview';
import { PopoverContent } from './PopoverContent';
import { useCombinedContext } from './contextHook';
import { FlowModal } from './NodeModal';
import { CustomHandle } from './CustomHandle';

/**
 * Props for the NodeWrapper component
 */
interface NodeWrapperProps {
  /** Child components to be rendered inside the node */
  children?: ReactNode;
  /** Data for UI options to be passed to the FlowModal */
  uiOptionsData?: React.ReactNode;
  /** Data for variables to be passed to the FlowModal */
  variablesData?: React.ReactNode;
}

/**
 * NodeWrapper component that wraps a flow node with additional UI elements
 */
export const NodeWrapper = memo((props: NodeWrapperProps) => {
  const { children, uiOptionsData, variablesData } = props;
  const { node: nodeCC } = useCombinedContext();

  const {
    nodeProps: { id },
    nodeMeta: { color: colorBase },
    openModal,
  } = nodeCC;

  const { getNode } = useReactFlow<FbNode, FbEdge>();
  const { ref: hoverRef, hovered } = useHover();
  const [popoverOpened, setPopoverOpened] = useState(false);

  const handleMouseEnter = useCallback(() => setPopoverOpened(true), []);
  const handleMouseLeave = useCallback(() => setPopoverOpened(false), []);

  const node = getNode(id);
  // Determine if the node is a source or destination based on its type
  const isSource = useMemo(
    () => node?.type?.toLowerCase().endsWith('source') ?? false,
    [node?.type],
  );
  const isDestination = useMemo(
    () => node?.type?.toLowerCase().endsWith('destination') ?? false,
    [node?.type],
  );

  // Memoize popover styles to prevent unnecessary re-renders
  const popoverStyles = useMemo(
    () => ({
      arrow: { borderColor: `var(--mantine-color-${colorBase}-4)` },
    }),
    [colorBase],
  );

  /**
   * Render the popover component
   */
  const renderPopover = useCallback(
    () => (
      <Popover
        width={200}
        position="bottom"
        withArrow
        shadow="md"
        opened={hovered && popoverOpened}
        styles={popoverStyles}
        onOpen={() => setPopoverOpened(true)}
        onClose={() => setPopoverOpened(false)}
        trapFocus
      >
        <Popover.Target>
          <Box
            ref={hoverRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={() => setPopoverOpened(true)}
            onBlur={() => setPopoverOpened(false)}
          >
            <MantinePaper
              onClick={openModal}
              withBorder
              style={{ borderColor: `var(--mantine-color-${colorBase}-4)` }}
              w={rem(200)}
              p="0"
              h={rem(45)}
            >
              <NodePreview />
            </MantinePaper>
          </Box>
        </Popover.Target>

        <Popover.Dropdown
          role="dialog"
          aria-labelledby={`popover-${id}`}
          style={{ pointerEvents: 'none' }}
          p="0"
        >
          <PopoverContent />
        </Popover.Dropdown>
      </Popover>
    ),
    [
      hovered,
      popoverOpened,
      popoverStyles,
      hoverRef,
      handleMouseEnter,
      handleMouseLeave,
      openModal,
      id,
      colorBase,
    ],
  );

  if (!node) {
    logError('Node not found', { nodeId: id });
    return null;
  }

  return (
    <Sentry.ErrorBoundary
      fallback={
        <div>An error has occurred in this node. Please try again.</div>
      }
    >
      <>
        {renderPopover()}

        <FlowModal
          nodeId={id}
          uiOptionsData={uiOptionsData}
          variablesData={variablesData}
        >
          {children}
        </FlowModal>

        {(isSource || (!isSource && !isDestination)) && (
          <CustomHandle
            type="source"
            position={Position.Bottom}
            id={`${id}-source`}
            isConnectable={node.connectable ?? true}
            colorBase={colorBase}
          />
        )}

        {(isDestination || (!isSource && !isDestination)) && (
          <CustomHandle
            type="target"
            position={Position.Top}
            id={`${id}-target`}
            isConnectable={node.connectable ?? true}
            colorBase={colorBase}
          />
        )}
      </>
    </Sentry.ErrorBoundary>
  );
});

NodeWrapper.displayName = 'NodeWrapper';
