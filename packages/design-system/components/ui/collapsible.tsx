'use client';

// Use Mantine Collapse for Collapsible functionality
import { Collapse, UnstyledButton } from '@mantine/core';
import * as React from 'react';

export const Collapsible = ({ children, onOpenChange, open }: any) => {
  const [isOpen, setIsOpen] = React.useState(open || false);

  React.useEffect(() => {
    if (open !== undefined) setIsOpen(open);
  }, [open]);

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (child?.type === CollapsibleTrigger) {
          return React.cloneElement(child, {
            onClick: () => {
              const newOpen = !isOpen;
              setIsOpen(newOpen);
              onOpenChange?.(newOpen);
            },
          });
        }
        if (child?.type === CollapsibleContent) {
          return <Collapse in={isOpen}>{child.props.children}</Collapse>;
        }
        return child;
      })}
    </div>
  );
};

export const CollapsibleTrigger = ({ children, onClick }: any) => (
  <UnstyledButton onClick={onClick}>{children}</UnstyledButton>
);

export const CollapsibleContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
