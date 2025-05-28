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
