import React, { memo } from 'react';
import { Tooltip, ActionIcon } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

interface InfoTooltipProps {
  label: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = memo(({ label }) => (
  <Tooltip label={label} position="left" withArrow>
    <ActionIcon>
      <IconInfoCircle size={16} />
    </ActionIcon>
  </Tooltip>
));
