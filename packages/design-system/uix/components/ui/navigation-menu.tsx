'use client';

// Simple navigation menu implementation using Mantine
import { Group, UnstyledButton } from '@mantine/core';
import * as React from 'react';

export const NavigationMenu = ({ children }: { children: React.ReactNode }) => (
  <nav>{children}</nav>
);

export const NavigationMenuList = ({ children }: { children: React.ReactNode }) => (
  <Group gap="md">{children}</Group>
);

export const NavigationMenuItem = ({ children }: { children: React.ReactNode }) => children;

export const NavigationMenuTrigger = ({ children, ...props }: any) => (
  <UnstyledButton {...props}>{children}</UnstyledButton>
);

export const NavigationMenuContent = ({ children }: { children: React.ReactNode }) => children;

export const NavigationMenuLink = ({ children, href, ...props }: any) => (
  <a href={href} {...props}>
    {children}
  </a>
);

// Additional navigation menu components
export const NavigationMenuIndicator = ({ children }: { children?: React.ReactNode }) => children;

export const NavigationMenuViewport = ({ children }: { children?: React.ReactNode }) => children;

// Navigation menu style helper
export const navigationMenuTriggerStyle = () =>
  'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50';
