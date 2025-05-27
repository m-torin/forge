'use client';

// Use Mantine Spotlight for Command functionality
import { List, TextInput } from '@mantine/core';
import * as React from 'react';

export const Command = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

export const CommandInput = (props: any) => <TextInput {...props} />;
export const CommandList = ({ children }: { children: React.ReactNode }) => <List>{children}</List>;
export const CommandEmpty = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const CommandGroup = ({ children, heading }: any) => (
  <div>
    {heading && <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{heading}</div>}
    {children}
  </div>
);
export const CommandItem = ({ children, onSelect, ...props }: any) => (
  <List.Item onClick={() => onSelect?.(children)} style={{ cursor: 'pointer' }} {...props}>
    {children}
  </List.Item>
);
export const CommandSeparator = () => (
  <div style={{ borderTop: '1px solid var(--mantine-color-default-border)', margin: '0.5rem 0' }} />
);
