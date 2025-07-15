import React, { useMemo } from 'react';
import { getBezierPath, BaseEdge } from '@xyflow/react';
import { logDebug } from '@repo/observability';
import { EdgeRenderer } from './ui';
import { FbEdgeProps } from '../types';

// Default edge styles using CSS variables
const DEFAULT_STYLE = {
  stroke: 'var(--edge-color, #b1b1b7)',
  strokeWidth: 2,
} as const;

export const CustomEdge = (props: FbEdgeProps) => {
  logDebug('CustomEdge props', { props });

  const {
    id,
    label,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    animated,
    style = {},
    selected,
    markerStart,
    markerEnd,
    interactionWidth = 20,
    ...restProps
  } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeStyle = useMemo(
    () => ({
      ...DEFAULT_STYLE,
      ...style,
      ...(animated && {
        strokeDasharray: '5,5',
        animation: 'dashdraw 0.5s linear infinite',
        stroke: 'var(--edge-animated-color, #ff0000)',
        strokeWidth: 2,
      }),
      ...(selected && {
        strokeWidth: 3,
        stroke: 'var(--edge-selected-color, #1a192b)',
      }),
    }),
    [style, animated, selected],
  );

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={edgeStyle}
        {...(markerStart && { markerStart })}
        {...(markerEnd && { markerEnd })}
        interactionWidth={interactionWidth}
        className={selected ? 'selected' : ''}
        {...restProps}
      />
      <EdgeRenderer
        id={id}
        label={label}
        labelKey="label"
        x={labelX}
        y={labelY}
        isEditable={data?.isEditable ?? true}
        isDeletable={data?.isDeletable ?? true}
        selected={selected ?? false}
      />
    </>
  );
};

// Export edge styles for global usage
export const edgeStyles = `
  .react-flow__edge-path {
    stroke: var(--edge-color, #b1b1b7);
    stroke-width: 2;
    transition: stroke 0.2s ease;
  }

  .react-flow__edge.selected .react-flow__edge-path {
    stroke: var(--edge-selected-color, #1a192b);
    stroke-width: 3;
  }

  @keyframes dashdraw {
    from {
      stroke-dashoffset: 10;
    }
  }
`;
