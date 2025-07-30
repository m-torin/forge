// components/AdvancedSettings.tsx
import React, { FC, PropsWithChildren } from 'react';
import { Stack, Collapse, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

type AdvancedSettingsProps = PropsWithChildren<{
  label?: string;
  buttonProps?: Omit<React.ComponentPropsWithoutRef<typeof Button>, 'onClick'>;
  collapseProps?: Omit<
    React.ComponentPropsWithoutRef<typeof Collapse>,
    'in' | 'children'
  >;
  stackProps?: React.ComponentPropsWithoutRef<typeof Stack>;
}>;

export const AdvancedSettings: FC<AdvancedSettingsProps> = ({
  children,
  label = 'Advanced Settings',
  buttonProps = {},
  collapseProps = {},
  stackProps = {},
}) => {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <Stack gap="md" {...stackProps}>
      <Button
        variant="light"
        onClick={toggle}
        justify="center"
        fullWidth
        {...buttonProps}
      >
        {opened ? `Hide ${label} ↑` : `Show ${label} ↓`}
      </Button>

      <Collapse
        in={opened}
        transitionDuration={200}
        transitionTimingFunction="ease"
        {...collapseProps}
      >
        <Stack gap="md">{children}</Stack>
      </Collapse>
    </Stack>
  );
};
