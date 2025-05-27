'use client';

// Use Mantine Modal for AlertDialog functionality
import { Button, Group, Modal, Text } from '@mantine/core';
import * as React from 'react';

export const AlertDialog = ({ children, ...props }: any) => {
  const [opened, setOpened] = React.useState(false);
  return (
    <>
      {React.Children.map(children, (child) => {
        if (child?.type === AlertDialogTrigger) {
          return React.cloneElement(child, { onClick: () => setOpened(true) });
        }
        if (child?.type === AlertDialogContent) {
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

export const AlertDialogTrigger = ({ children, onClick }: any) => {
  return React.cloneElement(children, { onClick });
};

export const AlertDialogContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const AlertDialogTitle = Modal.Title;
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
export const AlertDialogAction = Button;
export const AlertDialogCancel = (props: any) => <Button variant="subtle" {...props} />;
