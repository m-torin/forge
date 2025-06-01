// Export Mantine Avatar components
import { Avatar as MantineAvatar, type AvatarProps as MantineAvatarProps } from '@mantine/core';
import type React from 'react';

export { MantineAvatar as Avatar };
export type AvatarProps = MantineAvatarProps;

// For compatibility with shadcn/ui compound components
export const AvatarImage: React.FC<MantineAvatarProps> = MantineAvatar;
export const AvatarFallback: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
