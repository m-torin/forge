'use client';

import { Badge } from '@mantine/core';
import { IconWifi, IconWifiOff } from '@tabler/icons-react';

interface PresenceIndicatorProps {
  isConnected: boolean;
  variant?: 'subtle' | 'filled' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function PresenceIndicator({
  isConnected,
  variant = 'subtle',
  size = 'sm',
}: PresenceIndicatorProps) {
  return (
    <Badge
      variant={variant}
      size={size}
      color={isConnected ? 'green' : 'red'}
      leftSection={isConnected ? <IconWifi size={12} /> : <IconWifiOff size={12} />}
    >
      {isConnected ? 'Connected' : 'Disconnected'}
    </Badge>
  );
}
