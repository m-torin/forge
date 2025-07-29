'use client';

import { Avatar, Indicator, Tooltip } from '@mantine/core';
import { Collaborator } from '../types/collaboration';

interface CollaboratorAvatarProps {
  collaborator: Collaborator;
  size?: string | number;
  showStatus?: boolean;
}

export function CollaboratorAvatar({
  collaborator,
  size = 'sm',
  showStatus = true,
}: CollaboratorAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatar = (
    <Avatar
      size={size}
      src={collaborator.avatar}
      style={{
        backgroundColor: collaborator.color,
        border: `2px solid ${collaborator.color}`,
      }}
    >
      {getInitials(collaborator.name)}
    </Avatar>
  );

  const avatarWithStatus =
    showStatus && collaborator.isActive ? (
      <Indicator color="green" size={8} position="bottom-end" offset={2} withBorder>
        {avatar}
      </Indicator>
    ) : (
      avatar
    );

  return (
    <Tooltip
      label={`${collaborator.name}${collaborator.isActive ? ' (active)' : ' (away)'}`}
      position="top"
    >
      {avatarWithStatus}
    </Tooltip>
  );
}
