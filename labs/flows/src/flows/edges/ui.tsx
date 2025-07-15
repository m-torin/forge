import React from 'react';
import { EdgeLabelRenderer, useReactFlow } from '@xyflow/react';
import {
  Stack,
  ActionIcon,
  TextInput,
  Popover,
  Button,
  Box,
  useComputedColorScheme,
  useMantineTheme,
  rem,
  FocusTrap,
} from '@mantine/core';
import { IconX, IconAdjustments } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useField } from '@mantine/form';
import { FbEdgeProps } from '../types';

interface EdgeRendererProps extends Partial<FbEdgeProps> {
  id: string;
  label?: string | React.ReactNode;
  x: number;
  y: number;
  isEditable?: boolean;
  isDeletable?: boolean;
  selected?: boolean;
  labelKey?: string;
}

export const EdgeRenderer: React.FC<EdgeRendererProps> = ({
  id,
  label = '',
  x,
  y,
  isEditable = false,
  isDeletable = false,
  selected = false,
}) => {
  const { setEdges } = useReactFlow();
  const [opened, { close, open }] = useDisclosure(false);
  const computedColorScheme = useComputedColorScheme('light');
  const theme = useMantineTheme();

  // Use field hook for better form handling
  const labelField = useField({
    initialValue: typeof label === 'string' ? label : '',
    validate: (value) =>
      value.length > 50 ? 'Label must be less than 50 characters' : null,
    validateOnBlur: true,
    onValueChange: (value) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === id
            ? {
                ...edge,
                label: value,
                data: {
                  ...edge.data,
                  label: value,
                },
              }
            : edge,
        ),
      );
    },
  });

  // Delete edge using ReactFlow's edge removal
  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeletable) {
      setEdges((edges) => edges.filter((edge) => edge.id !== id));
      close();
    }
  };

  return (
    <EdgeLabelRenderer>
      <div
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${x}px,${y}px)`,
          pointerEvents: 'all',
        }}
        className="nodrag nopan"
      >
        <Popover
          width={200}
          position="bottom"
          withArrow
          shadow="md"
          opened={opened}
          closeOnEscape={false}
        >
          <Popover.Target>
            {labelField.getValue() ? (
              <Box
                onMouseEnter={open}
                onMouseLeave={close}
                bg={
                  computedColorScheme === 'dark'
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0]
                }
                c={
                  computedColorScheme === 'dark'
                    ? theme.colors.gray[1]
                    : theme.colors.gray[8]
                }
                px="sm"
                py="xs"
                fz="xs"
                style={{
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: selected
                    ? `1px solid ${theme.colors.blue[5]}`
                    : undefined,
                }}
                fw={700}
                className="nodrag nopan"
              >
                {labelField.getValue()}
              </Box>
            ) : (
              <ActionIcon
                variant="light"
                color="gray"
                radius="xl"
                onMouseEnter={open}
                onMouseLeave={close}
                aria-label="Edge settings"
              >
                <IconAdjustments
                  style={{ width: '70%', height: '70%' }}
                  stroke={1.5}
                />
              </ActionIcon>
            )}
          </Popover.Target>
          <Popover.Dropdown onMouseEnter={open} onMouseLeave={close} p={rem(8)}>
            <FocusTrap active={opened}>
              <Stack gap="xs">
                {isEditable && (
                  <TextInput
                    {...labelField.getInputProps()}
                    variant="filled"
                    placeholder="Enter label text"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                        close();
                      }
                    }}
                    size="sm"
                    data-autofocus
                  />
                )}
                {isDeletable && (
                  <Button
                    variant="light"
                    color="red"
                    size="compact-md"
                    onClick={onDelete}
                    leftSection={<IconX size={14} />}
                  >
                    Delete edge
                  </Button>
                )}
              </Stack>
            </FocusTrap>
          </Popover.Dropdown>
        </Popover>
      </div>
    </EdgeLabelRenderer>
  );
};
