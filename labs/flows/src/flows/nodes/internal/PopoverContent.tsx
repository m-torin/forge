'use client';

import React from 'react';
import { rem, Text, Stack, Table, Box } from '@mantine/core';
import { IconHistoryToggle, IconArtboard } from '@tabler/icons-react';
import { useCombinedContext } from '#/flows/nodes/internal';
import { FbNodeData } from '../../types';

interface Element {
  position: React.ReactNode;
  name: React.ReactNode;
}

export const PopoverContent: React.FC = () => {
  const {
    node: {
      nodeMeta: { color: colorBase },
      nodeProps: {
        data: { popoverName, additionalElements } = {} as Partial<FbNodeData>,
      },
    },
  } = useCombinedContext();

  const elements: Element[] = [
    {
      position: <IconArtboard color="var(--mantine-color-dark-6)" />,
      name: popoverName,
    },
    ...(Array.isArray(additionalElements) ? additionalElements : []),
    {
      position: <IconHistoryToggle color="var(--mantine-color-dark-6)" />,
      name: (
        <>
          Last run{' '}
          <Text c="teal.7" span>
            successful
          </Text>
        </>
      ),
    },
  ];

  return (
    <Stack
      bg="var(--mantine-color-body)"
      align="stretch"
      justify="center"
      gap="md"
      style={{ border: `1px solid var(--mantine-color-${colorBase}-4)` }}
    >
      <Table withColumnBorders borderColor={`${colorBase}.4`}>
        <Table.Tbody>
          {elements.map((element, index) => (
            <Table.Tr key={`element-${element.position || index}`}>
              <Table.Td
                px={4}
                py={1}
                bg={`var(--mantine-color-${colorBase}-0)`}
                valign="middle"
                w={rem(24)}
                style={{ padding: 0 }}
              >
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%',
                  }}
                >
                  {element.position}
                </Box>
              </Table.Td>
              <Table.Td>{element.name}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
};
