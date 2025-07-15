import React from 'react';
import { rem } from '@mantine/core';

interface CustomIconProps {
  icon: React.ComponentType<any>;
  size?: number;
  stroke?: number;
  color?: string;
  baseColor?: string;
}

export const CustomIcon: React.FC<CustomIconProps> = ({
  icon: Icon,
  size = 24,
  stroke = 1.5,
  baseColor,
}) => {
  return (
    <Icon
      style={{ width: rem(size), height: rem(size) }}
      stroke={stroke}
      color={baseColor}
      // You can use baseColor here if needed, e.g.:
      // fill={`var(--mantine-color-${baseColor}-0)`}
    />
  );
};
