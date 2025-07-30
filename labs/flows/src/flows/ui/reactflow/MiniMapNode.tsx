import { MiniMapNodeProps } from '@xyflow/react';

export const MiniMapNode: React.FC<MiniMapNodeProps> = ({
  x,
  y,
  color,
  strokeColor,
  strokeWidth,
  width,
  height,
}) => (
  <circle
    cx={x}
    cy={y}
    r={Math.max(width, height) / 2}
    fill={color || '#eee'}
    stroke={strokeColor}
    strokeWidth={strokeWidth}
  />
);
