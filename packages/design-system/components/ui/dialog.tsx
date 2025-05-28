'use client';

// Export Mantine Modal as Dialog
import { Modal, type ModalProps } from '@mantine/core';
import * as React from 'react';

export const Dialog = Modal;
export type DialogProps = ModalProps;

// Compatibility components for shadcn/ui API
export const DialogTrigger = ({ children }: { children: React.ReactNode }) => children;
export const DialogContent = ({ children }: { children: React.ReactNode }) => children;
export const DialogHeader = Modal.Header;
export const DialogTitle = Modal.Title;
export const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <div style={{ color: 'var(--mantine-color-dimmed)', marginTop: '0.5rem' }}>{children}</div>
);
export const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
    {children}
  </div>
);
