import React from 'react';
import { Handle, Position, HandleProps } from '@xyflow/react';
import { Box, MantineTheme, useMantineTheme } from '@mantine/core';
import {
  motion,
  useAnimation,
  MotionProps,
  HTMLMotionProps,
} from 'framer-motion';
import { handleVariants } from './animations';

type MotionHandleProps = Omit<HandleProps, keyof MotionProps> &
  HTMLMotionProps<'div'>;

const MotionHandle = motion(Handle) as React.ComponentType<MotionHandleProps>;

const getPositionStyles = (position: Position, _theme: MantineTheme) => {
  const offsetSize = 12;
  switch (position) {
    case Position.Top:
      return {
        top: -offsetSize,
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    case Position.Bottom:
      return {
        bottom: -offsetSize,
        left: '50%',
        transform: 'translate(-50%, 50%)',
      };
    case Position.Left:
      return {
        left: -offsetSize,
        top: '50%',
        transform: 'translate(-50%, -50%)',
      };
    case Position.Right:
      return {
        right: -offsetSize,
        top: '50%',
        transform: 'translate(50%, -50%)',
      };
    default:
      return {};
  }
};

const getBoxStyles = (theme: MantineTheme, position: Position) => ({
  width: 0,
  height: 0,
  position: 'absolute' as const,
  ...getPositionStyles(position, theme),
});

export const CustomHandle = ({
  colorBase = 'blue',
  ...props
}: MotionHandleProps & { colorBase?: string }): React.JSX.Element => {
  const theme = useMantineTheme();
  const controls = useAnimation();

  const handleStyle = {
    backgroundColor: theme.colors[colorBase]?.[6] ?? theme.colors.blue[6],
    border: `2px solid ${theme.colors[colorBase]?.[2] ?? theme.colors.blue[2]}`,
    width: theme.spacing.sm,
    height: theme.spacing.sm,
    borderRadius: '50%',
    transition: 'transform 0.2s ease',
  };

  return (
    <Box style={() => getBoxStyles(theme, props.position)}>
      <MotionHandle
        variants={handleVariants}
        initial="disconnected"
        animate={controls}
        whileHover={{ scale: 2 }}
        style={handleStyle}
        transition={{ duration: 0.1 }}
        {...props}
      />
    </Box>
  );
};
