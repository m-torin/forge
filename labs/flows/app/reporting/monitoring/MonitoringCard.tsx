'use client';

import { ReactNode } from 'react';
import { ActionIcon, Box, Card, Group, Menu, Text, rem } from '@mantine/core';
import { IconDots, IconFileZip, IconEye, IconTrash } from '@tabler/icons-react';

interface MonitoringCardProps {
  title: string;
  children: ReactNode;
}

export const MonitoringCard = ({ title, children }: MonitoringCardProps) => (
  <Card shadow="xs" padding="sm" radius="sm">
    <Card.Section withBorder inheritPadding py="xs" mb="lg">
      <Group justify="space-between">
        <Text fw={500}>{title}</Text>
        <Menu withinPortal position="bottom-end" shadow="sm">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <IconDots style={{ width: rem(16), height: rem(16) }} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={
                <IconFileZip style={{ width: rem(14), height: rem(14) }} />
              }
            >
              Download zip
            </Menu.Item>
            <Menu.Item
              leftSection={
                <IconEye style={{ width: rem(14), height: rem(14) }} />
              }
            >
              Preview all
            </Menu.Item>
            <Menu.Item
              leftSection={
                <IconTrash style={{ width: rem(14), height: rem(14) }} />
              }
              color="red"
            >
              Delete all
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Card.Section>

    <Box>{children}</Box>
  </Card>
);

export default MonitoringCard;
