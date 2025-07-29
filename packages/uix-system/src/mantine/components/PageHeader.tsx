'use client';

import { ActionIcon, Button, Group, Text, Title, Tooltip } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

export interface PageHeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'filled' | 'light' | 'outline' | 'subtle' | 'default';
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  actions?: {
    primary?: PageHeaderAction;
    secondary?: PageHeaderAction[];
  };
  onRefresh?: () => void;
  refreshing?: boolean;

  // Customization
  titleOrder?: 1 | 2 | 3 | 4 | 5 | 6;
  align?: 'flex-start' | 'center' | 'flex-end';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  subtitle,
  actions,
  onRefresh,
  refreshing = false,
  titleOrder = 2,
  align = 'flex-start',
  spacing = 'md',
  wrap = true,
  children,
}: PageHeaderProps) {
  return (
    <Group justify="space-between" align={align} gap={spacing} wrap={wrap ? 'wrap' : 'nowrap'}>
      <div style={{ flex: 1 }}>
        <Title order={titleOrder}>{title}</Title>
        {subtitle && (
          <Text size="lg" c="dimmed" mt={2}>
            {subtitle}
          </Text>
        )}
        {description && (
          <Text c="dimmed" size="sm" mt={subtitle ? 2 : 5}>
            {description}
          </Text>
        )}
        {children && <div style={{ marginTop: 12 }}>{children}</div>}
      </div>

      <Group gap="xs" wrap="nowrap">
        {onRefresh && (
          <Tooltip label="Refresh data">
            <ActionIcon
              variant="subtle"
              onClick={onRefresh}
              loading={refreshing}
              data-testid="refresh-button"
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        )}

        {actions?.secondary?.map((action, index) => (
          <Button
            key={action.label || index}
            variant={action.variant || 'subtle'}
            size={action.size || 'sm'}
            color={action.color}
            leftSection={action.icon}
            onClick={action.onClick}
            loading={action.loading}
            disabled={action.disabled}
          >
            {action.label}
          </Button>
        ))}

        {actions?.primary && (
          <Button
            variant={actions.primary.variant || 'filled'}
            size={actions.primary.size || 'sm'}
            color={actions.primary.color}
            leftSection={actions.primary.icon}
            onClick={actions.primary.onClick}
            loading={actions.primary.loading}
            disabled={actions.primary.disabled}
            data-testid="primary-action"
          >
            {actions.primary.label}
          </Button>
        )}
      </Group>
    </Group>
  );
}
