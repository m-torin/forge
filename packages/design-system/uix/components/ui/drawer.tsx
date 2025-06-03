'use client';

// For compatibility
import {
  Drawer,
  type DrawerHeaderProps,
  type DrawerRootProps,
  type DrawerTitleProps,
} from '@mantine/core';

import type React from 'react';

// Export Mantine Drawer directly
export { Drawer, type DrawerProps } from '@mantine/core';
export const DrawerContent: React.FC<DrawerRootProps> = Drawer.Root;
export const DrawerHeader: React.FC<DrawerHeaderProps> = Drawer.Header;
export const DrawerTitle: React.FC<DrawerTitleProps> = Drawer.Title;
export const DrawerDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ color: 'var(--mantine-color-dimmed)' }}>{children}</div>
);
export const DrawerFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ borderTop: '1px solid var(--mantine-color-default-border)', padding: '1rem' }}>
    {children}
  </div>
);
export const DrawerTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);
export const DrawerClose: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);
