'use client';

import React, { memo } from 'react';
import { ActionIcon, Box, Flex, Text, Title, rem } from '@mantine/core';
import { useCombinedContext } from '#/flows/nodes/internal';
import { getIconByName } from '../iconMap';
import type { IconName } from '../iconMap';

interface CustomIconProps {
  icon: IconName;
  size?: number;
  stroke?: number;
  baseColor?: string;
  className?: string;
}

/**
 * CustomIcon component for rendering icons with consistent styling
 */
export const CustomIcon: React.FC<CustomIconProps> = memo(
  ({ icon, size = 24, stroke = 2, baseColor = 'gray', className }) => {
    const IconComponent = getIconByName(icon);

    return (
      <IconComponent
        size={size}
        stroke={stroke}
        className={className}
        style={{
          color: `var(--mantine-color-${baseColor}-0)`,
        }}
      />
    );
  },
);

CustomIcon.displayName = 'CustomIcon';

/**
 * NodePreview component displays a preview of a node with its icon and name.
 * It uses the context provided by useCombinedContext to access node-specific data.
 *
 * @returns {JSX.Element} The rendered NodePreview component
 */
export const NodePreview = memo(() => {
  const {
    form,
    node: {
      nodeMeta: { icon: iconName, color: colorBase, displayName: nodeTypeName },
    },
  } = useCombinedContext();

  const values = form.getValues();

  return (
    <>
      {values.heading && (
        <Box pos="absolute" top={rem(-40)} w={rem(250)}>
          <Title size="h4" component="h3" lineClamp={2} fw={500}>
            {values.heading}
          </Title>
        </Box>
      )}

      <Flex pos="relative" gap="xs" align="center" p="0" h="100%" pr={rem(3)}>
        <ActionIcon
          variant="filled"
          ml="-1px"
          color={`${colorBase}.4`}
          size={rem(44)}
          aria-label={`Settings for ${values.name || nodeTypeName}`}
          my={rem(3)}
          style={{
            borderBottomRightRadius: 0,
            borderTopRightRadius: 0,
          }}
        >
          <CustomIcon
            icon={iconName}
            size={32}
            stroke={1.5}
            baseColor={colorBase}
          />
        </ActionIcon>
        <Text lineClamp={2} c="dark" lh={1.1}>
          {values.name ?? nodeTypeName}
        </Text>
      </Flex>
    </>
  );
});

NodePreview.displayName = 'NodePreview';
