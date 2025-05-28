'use client';

// For compatibility
import { Drawer } from '@mantine/core';

// Export Mantine Drawer directly
export { Drawer, type DrawerProps } from '@mantine/core';
export const DrawerContent = Drawer.Root;
export const DrawerHeader = Drawer.Header;
export const DrawerTitle = Drawer.Title;
export const DrawerDescription = ({ children }: { children: React.ReactNode }) => (
  <div style={{ color: 'var(--mantine-color-dimmed)' }}>{children}</div>
);
export const DrawerFooter = ({ children }: { children: React.ReactNode }) => (
  <div style={{ borderTop: '1px solid var(--mantine-color-default-border)', padding: '1rem' }}>
    {children}
  </div>
);
