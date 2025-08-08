import React from 'react';
import { MiniMapNodeProps } from '@xyflow/react';

interface EnhancedMiniMapNodeProps extends Omit<MiniMapNodeProps, 'className'> {
  selected: boolean;
  className?: string;
}

export const MiniMapNode: React.FC<EnhancedMiniMapNodeProps> = ({
  x,
  y,
  color,
  strokeColor,
  strokeWidth = 1,
  width = 50,
  height = 50,
  selected,
  className = '',
}) => {
  // Enhanced styling based on node state
  const radius = Math.min(width, height) / 3; // More proportional sizing
  const fillColor = selected 
    ? (color ? `${color}dd` : '#3b82f6dd') // Semi-transparent blue for selected
    : (color || '#e5e7eb'); // Default gray
  
  const strokeStyle = selected 
    ? '#1d4ed8' // Darker blue border for selected
    : (strokeColor || '#9ca3af'); // Default gray border
    
  const strokeWidthStyle = selected ? strokeWidth + 1 : strokeWidth;

  return (
    <g className={`minimap-node ${className}`}>
      {/* Main node representation */}
      <circle
        cx={x + width / 2}
        cy={y + height / 2}
        r={radius}
        fill={fillColor}
        stroke={strokeStyle}
        strokeWidth={strokeWidthStyle}
        style={{
          transition: 'all 0.2s ease',
        }}
      />
      
      {/* Selection indicator */}
      {selected && (
        <circle
          cx={x + width / 2}
          cy={y + height / 2}
          r={radius + 2}
          fill="none"
          stroke="#1d4ed8"
          strokeWidth={1}
          strokeDasharray="2,2"
          opacity={0.6}
        >
          <animate
            attributeName="stroke-dashoffset"
            values="0;4"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      
      {/* Node type indicator (small dot) */}
      <circle
        cx={x + width / 2}
        cy={y + height / 2}
        r={2}
        fill={selected ? '#ffffff' : strokeStyle}
        opacity={0.8}
      />
    </g>
  );
};
