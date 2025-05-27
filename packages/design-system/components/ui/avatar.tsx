// Export Mantine Avatar components
import { Avatar as MantineAvatar, type AvatarProps as MantineAvatarProps } from '@mantine/core';

export { MantineAvatar as Avatar };
export type AvatarProps = MantineAvatarProps;

// For compatibility with shadcn/ui compound components
export const AvatarImage = MantineAvatar;
export const AvatarFallback = ({ children }: { children: React.ReactNode }) => <>{children}</>;
