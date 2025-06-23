'use client';

import {
  ActionIcon,
  Button,
  Group,
  Tooltip,
  Alert,
  Modal,
  Stack,
  Text,
  Badge,
  Kbd,
} from '@mantine/core';
import { useHotkeys, useDisclosure } from '@mantine/hooks';
import {
  IconAlertTriangle,
  IconCheck,
  IconTrash,
  IconKeyboard,
  IconAccessible,
} from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

interface AccessibleActionProps {
  action: 'delete' | 'ban' | 'unban' | 'enable' | 'disable';
  target: string; // user name, org name, etc.
  onConfirm: () => Promise<void> | void;
  disabled?: boolean;
  variant?: 'icon' | 'button';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  children?: React.ReactNode;
  hotkey?: string;
}

const ACTION_CONFIG = {
  delete: {
    color: 'red',
    icon: IconTrash,
    title: 'Delete Confirmation',
    message: (target: string) =>
      `Are you sure you want to delete "${target}"? This action cannot be undone.`,
    confirmText: 'Delete Permanently',
    successMessage: (target: string) => `${target} has been deleted successfully`,
  },
  ban: {
    color: 'orange',
    icon: IconAlertTriangle,
    title: 'Ban User',
    message: (target: string) =>
      `Are you sure you want to ban "${target}"? They will lose access immediately.`,
    confirmText: 'Ban User',
    successMessage: (target: string) => `${target} has been banned`,
  },
  unban: {
    color: 'green',
    icon: IconCheck,
    title: 'Unban User',
    message: (target: string) =>
      `Are you sure you want to unban "${target}"? They will regain access.`,
    confirmText: 'Unban User',
    successMessage: (target: string) => `${target} has been unbanned`,
  },
  enable: {
    color: 'green',
    icon: IconCheck,
    title: 'Enable Item',
    message: (target: string) => `Are you sure you want to enable "${target}"?`,
    confirmText: 'Enable',
    successMessage: (target: string) => `${target} has been enabled`,
  },
  disable: {
    color: 'gray',
    icon: IconAlertTriangle,
    title: 'Disable Item',
    message: (target: string) => `Are you sure you want to disable "${target}"?`,
    confirmText: 'Disable',
    successMessage: (target: string) => `${target} has been disabled`,
  },
};

export function AccessibleAction({
  action,
  target,
  onConfirm,
  disabled = false,
  variant = 'icon',
  size = 'sm',
  color,
  children,
  hotkey,
}: AccessibleActionProps) {
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  const config = ACTION_CONFIG[action];
  const Icon = config.icon;

  // Setup hotkey if provided
  useHotkeys(hotkey ? [[hotkey, openConfirm]] : []);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      notifications.show({
        title: 'Success',
        message: config.successMessage(target),
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      closeConfirm();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to ${action} ${target}`,
        color: 'red',
        icon: <IconAlertTriangle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const buttonProps = {
    onClick: openConfirm,
    disabled,
    color: color || config.color,
    size,
    'aria-label': `${config.title} for ${target}${hotkey ? ` (${hotkey})` : ''}`,
    'aria-describedby': `${action}-description`,
  };

  return (
    <>
      {variant === 'icon' ? (
        <Tooltip
          label={
            <Group gap="xs">
              <Text size="sm">{config.title}</Text>
              {hotkey && <Kbd size="xs">{hotkey}</Kbd>}
            </Group>
          }
          withArrow
        >
          <ActionIcon variant="light" {...buttonProps}>
            <Icon size={16} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Button leftSection={<Icon size={16} />} variant="light" {...buttonProps}>
          {children || config.title}
          {hotkey && (
            <Kbd size="xs" ml="xs">
              {hotkey}
            </Kbd>
          )}
        </Button>
      )}

      {/* Accessible confirmation modal */}
      <Modal
        opened={confirmOpened}
        onClose={closeConfirm}
        title={config.title}
        centered
        withCloseButton={!loading}
        closeOnClickOutside={!loading}
        closeOnEscape={!loading}
      >
        <Stack gap="lg">
          <Alert icon={<Icon size={20} />} color={config.color} variant="light">
            <Text size="sm" id={`${action}-description`}>
              {config.message(target)}
            </Text>
          </Alert>

          {action === 'delete' && (
            <Alert color="red" variant="filled" icon={<IconAlertTriangle size={16} />}>
              <Text size="sm" fw={600}>
                ⚠️ This action is permanent and cannot be undone
              </Text>
            </Alert>
          )}

          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={closeConfirm} disabled={loading}>
              Cancel
            </Button>
            <Button color={config.color} onClick={handleConfirm} loading={loading} autoFocus>
              {config.confirmText}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export function KeyboardShortcutsHelp() {
  const [opened, { toggle }] = useDisclosure(false);

  const shortcuts = [
    { key: '⌘ + K', description: 'Open global search' },
    { key: '/', description: 'Focus search (when not typing)' },
    { key: 'Esc', description: 'Close modals and menus' },
    { key: '⌘ + Enter', description: 'Submit forms' },
    { key: 'Tab', description: 'Navigate between elements' },
    { key: 'Space', description: 'Activate buttons and checkboxes' },
    { key: 'Enter', description: 'Activate focused element' },
    { key: '⌘ + R', description: 'Refresh page/data' },
  ];

  return (
    <>
      <Tooltip label="Keyboard shortcuts">
        <ActionIcon
          variant="light"
          color="gray"
          onClick={toggle}
          aria-label="Show keyboard shortcuts"
        >
          <IconKeyboard size={16} />
        </ActionIcon>
      </Tooltip>

      <Modal opened={opened} onClose={toggle} title="Keyboard Shortcuts" size="md">
        <Stack gap="sm">
          <Alert icon={<IconAccessible size={16} />} color="blue" variant="light">
            This application is designed to be fully keyboard accessible. Use Tab to navigate and
            Enter/Space to interact.
          </Alert>

          {shortcuts.map((shortcut, index) => (
            <Group key={index} justify="space-between" p="xs">
              <Text size="sm">{shortcut.description}</Text>
              <Badge variant="light" color="gray">
                {shortcut.key}
              </Badge>
            </Group>
          ))}

          <Alert variant="light" mt="md">
            <Text size="sm">
              <strong>Tip:</strong> Most actions have keyboard shortcuts. Look for the keyboard icon
              or check tooltips for shortcuts.
            </Text>
          </Alert>
        </Stack>
      </Modal>
    </>
  );
}
