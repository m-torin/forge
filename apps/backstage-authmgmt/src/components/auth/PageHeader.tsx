import { Group, Title, Text, Button, ActionIcon, Tooltip } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: {
    primary?: {
      label: string;
      icon: React.ReactNode;
      onClick: () => void;
    };
    secondary?: Array<{
      label: string;
      onClick: () => void;
    }>;
  };
  onRefresh?: () => void;
}

export function PageHeader({ title, description, actions, onRefresh }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start">
      <div>
        <Title order={2}>{title}</Title>
        <Text c="dimmed" size="sm" mt={5}>
          {description}
        </Text>
      </div>
      <Group gap="xs">
        {onRefresh && (
          <Tooltip label="Refresh data">
            <ActionIcon variant="subtle" onClick={onRefresh}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        )}
        {actions?.secondary?.map((action, index) => (
          <Button key={index} variant="subtle" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
        {actions?.primary && (
          <Button leftSection={actions.primary.icon} size="sm" onClick={actions.primary.onClick}>
            {actions.primary.label}
          </Button>
        )}
      </Group>
    </Group>
  );
}
