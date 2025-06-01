'use client';

// Use Mantine Modal for AlertDialog functionality
import { Button, Group, Modal, Text, type ButtonProps, type ModalProps, type ModalTitleProps } from '@mantine/core';
import * as React from 'react';

interface AlertDialogProps extends Omit<ModalProps, 'opened' | 'onClose'> {
  children: React.ReactNode;
}

interface AlertDialogTriggerProps {
  children: React.ReactElement;
  onClick?: () => void;
}

export const AlertDialog = ({ children, ...props }: AlertDialogProps) => {
  const [opened, setOpened] = React.useState(false);
  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === AlertDialogTrigger) {
          return React.cloneElement(child, { onClick: () => setOpened(true) } as any);
        }
        if (React.isValidElement(child) && child.type === AlertDialogContent) {
          return (
            <Modal onClose={() => setOpened(false)} opened={opened} {...props}>
              {child}
            </Modal>
          );
        }
        return child;
      })}
    </>
  );
};

export const AlertDialogTrigger = ({ children, onClick }: AlertDialogTriggerProps) => {
  return React.cloneElement(children, { onClick } as any);
};

export const AlertDialogContent = ({ children }: { children: React.ReactNode }) => children;
export const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => children;
export const AlertDialogTitle: React.FC<ModalTitleProps> = Modal.Title;
export const AlertDialogDescription = ({ children }: { children: React.ReactNode }) => (
  <Text c="dimmed" mt="xs" size="sm">
    {children}
  </Text>
);
export const AlertDialogFooter = ({ children }: { children: React.ReactNode }) => (
  <Group justify="flex-end" mt="xl">
    {children}
  </Group>
);
export const AlertDialogAction: React.FC<ButtonProps> = Button;
export const AlertDialogCancel: React.FC<ButtonProps> = (props) => <Button variant="subtle" {...props} />;
