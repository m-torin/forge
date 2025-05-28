'use client';

// Use Mantine Drawer for Sheet functionality
import { Drawer } from '@mantine/core';

export const Sheet = Drawer;
export const SheetTrigger = ({ children }: { children: React.ReactNode }) => children;
export const SheetContent = ({ children }: { children: React.ReactNode }) => children;
export const SheetHeader = Drawer.Header;
export const SheetTitle = Drawer.Title;
export const SheetDescription = ({ children }: { children: React.ReactNode }) => (
  <div style={{ color: 'var(--mantine-color-dimmed)' }}>{children}</div>
);
export const SheetFooter = ({ children }: { children: React.ReactNode }) => (
  <div style={{ borderTop: '1px solid var(--mantine-color-default-border)', padding: '1rem' }}>
    {children}
  </div>
);
