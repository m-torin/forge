'use client';

// Use Mantine Spotlight for Command functionality
import { List, type ListItemProps, TextInput, type TextInputProps } from '@mantine/core';

import type React from 'react';

export const Command: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

export const CommandInput: React.FC<TextInputProps> = (props) => <TextInput {...props} />;
export const CommandList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <List>{children}</List>
);
export const CommandEmpty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);
export const CommandGroup: React.FC<{ children: React.ReactNode; heading?: React.ReactNode }> = ({
  children,
  heading,
}) => (
  <div>
    {heading && <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{heading}</div>}
    {children}
  </div>
);
export const CommandItem: React.FC<
  { children: React.ReactNode; onSelect?: (value: any) => void } & Omit<ListItemProps, 'onClick'>
> = ({ children, onSelect, ...props }) => (
  <List.Item onClick={() => onSelect?.(children)} style={{ cursor: 'pointer' }} {...props}>
    {children}
  </List.Item>
);
export const CommandSeparator: React.FC = () => (
  <div style={{ borderTop: '1px solid var(--mantine-color-default-border)', margin: '0.5rem 0' }} />
);
