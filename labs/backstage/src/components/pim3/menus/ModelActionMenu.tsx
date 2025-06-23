'use client';

import { ActionIcon, Menu } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconCopy, IconDotsVertical, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { type ReactNode } from 'react';

export interface ModelAction {
  key: string;
  label: string;
  icon?: React.ComponentType<{ size?: number | string }>;
  color?: string;
  onClick: () => void | Promise<void>;
  hidden?: boolean;
  disabled?: boolean;
  danger?: boolean;
}

export interface ModelActionMenuProps {
  actions?: ModelAction[];
  onEdit?: () => void;
  onView?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  deleteWarning?: {
    title: string;
    message: ReactNode;
  };
  position?: 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end';
  iconSize?: number;
}

export function ModelActionMenu({
  actions = [],
  onEdit,
  onView,
  onDuplicate,
  onDelete,
  deleteWarning,
  position = 'bottom-end',
  iconSize = 16,
}: ModelActionMenuProps) {
  // Build default actions
  const defaultActions: ModelAction[] = [];

  if (onView) {
    defaultActions.push({
      key: 'view',
      label: 'View',
      icon: IconEye,
      onClick: onView,
    });
  }

  if (onEdit) {
    defaultActions.push({
      key: 'edit',
      label: 'Edit',
      icon: IconEdit,
      onClick: onEdit,
    });
  }

  if (onDuplicate) {
    defaultActions.push({
      key: 'duplicate',
      label: 'Duplicate',
      icon: IconCopy,
      onClick: onDuplicate,
    });
  }

  if (onDelete) {
    defaultActions.push({
      key: 'delete',
      label: 'Delete',
      icon: IconTrash,
      color: 'red',
      danger: true,
      onClick: () => {
        if (deleteWarning) {
          modals.openConfirmModal({
            title: deleteWarning.title,
            centered: true,
            children: deleteWarning.message,
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: onDelete,
          });
        } else {
          onDelete();
        }
      },
    });
  }

  // Combine default and custom actions
  const allActions = [...defaultActions, ...actions].filter((action) => !action.hidden);

  if (allActions.length === 0) {
    return null;
  }

  // Group actions by danger level
  const normalActions = allActions.filter((action) => !action.danger);
  const dangerActions = allActions.filter((action) => action.danger);

  return (
    <Menu position={position} withArrow withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" size="sm">
          <IconDotsVertical size={iconSize} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {normalActions.map((action) => (
          <Menu.Item
            key={action.key}
            leftSection={action.icon && <action.icon size={iconSize} />}
            onClick={action.onClick}
            disabled={action.disabled}
            color={action.color}
          >
            {action.label}
          </Menu.Item>
        ))}

        {normalActions.length > 0 && dangerActions.length > 0 && <Menu.Divider />}

        {dangerActions.map((action) => (
          <Menu.Item
            key={action.key}
            leftSection={action.icon && <action.icon size={iconSize} />}
            onClick={action.onClick}
            disabled={action.disabled}
            color={action.color || 'red'}
          >
            {action.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
