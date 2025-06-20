'use client';

import {
  Button,
  Divider,
  Drawer,
  Group,
  LoadingOverlay,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconCheck } from '@tabler/icons-react';
import { type ReactNode, useCallback } from 'react';

export interface ModelFormDrawerProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ size?: number | string }>;
  isCreating?: boolean;
  isSaving?: boolean;
  isDirty?: boolean;
  onSubmit: () => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  tabs?: {
    value: string;
    label: string;
    icon?: React.ComponentType<{ size?: number | string }>;
    content: ReactNode;
  }[];
  children?: ReactNode;
  size?: string | number;
}

export function ModelFormDrawer({
  opened,
  onClose,
  title,
  subtitle,
  icon: Icon,
  isCreating = false,
  isSaving = false,
  isDirty = false,
  onSubmit,
  onCancel,
  submitLabel,
  tabs,
  children,
  size,
}: ModelFormDrawerProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleClose = useCallback(() => {
    if (isDirty && !isSaving) {
      modals.openConfirmModal({
        title: 'Unsaved Changes',
        children: (
          <Text size="sm">
            You have unsaved changes. Are you sure you want to close without saving?
          </Text>
        ),
        labels: { cancel: 'Keep Editing', confirm: 'Discard Changes' },
        confirmProps: { color: 'red' },
        onConfirm: onClose,
      });
    } else {
      onClose();
    }
  }, [isDirty, isSaving, onClose]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      handleClose();
    }
  }, [onCancel, handleClose]);

  const submitButtonLabel = submitLabel || (isCreating ? 'Create' : 'Save Changes');

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          {Icon && (
            <ThemeIcon color="blue" variant="light">
              <Icon size={20} />
            </ThemeIcon>
          )}
          <div>
            <Text fw={600}>{title}</Text>
            {subtitle && (
              <Text c="dimmed" size="xs">
                {subtitle}
              </Text>
            )}
          </div>
        </Group>
      }
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      position="right"
      size={size || (isMobile ? '100%' : 'xl')}
      padding="lg"
      closeButtonProps={{ 'aria-label': 'Close drawer' }}
      lockScroll
      trapFocus
      returnFocus
      withCloseButton={!isSaving}
      transitionProps={{ duration: 250, transition: 'slide-left' }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <LoadingOverlay visible={isSaving} zIndex={1000} overlayProps={{ blur: 2, radius: 'sm' }} />

        {/* Content */}
        <Stack gap="md" style={{ flex: 1, overflow: 'auto' }}>
          {tabs && tabs.length > 0 ? (
            <Tabs defaultValue={tabs[0].value} variant="pills">
              <Tabs.List grow>
                {tabs.map((tab) => (
                  <Tabs.Tab
                    key={tab.value}
                    value={tab.value}
                    leftSection={tab.icon && <tab.icon size={16} />}
                  >
                    {tab.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>

              {tabs.map((tab) => (
                <Tabs.Panel key={tab.value} value={tab.value} pt="md">
                  {tab.content}
                </Tabs.Panel>
              ))}
            </Tabs>
          ) : (
            children
          )}
        </Stack>

        {/* Actions */}
        <div>
          <Divider my="md" />
          <Group justify="space-between">
            <Button variant="subtle" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSaving}
              disabled={isSaving}
              leftSection={isSaving ? null : <IconCheck size={16} />}
            >
              {submitButtonLabel}
            </Button>
          </Group>
        </div>
      </form>
    </Drawer>
  );
}
