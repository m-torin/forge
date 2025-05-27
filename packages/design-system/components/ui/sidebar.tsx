'use client';

import {
  ActionIcon,
  AppShell,
  Divider,
  Drawer,
  NavLink,
  ScrollArea,
  Skeleton,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconMenu2 } from '@tabler/icons-react';
import * as React from 'react';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

interface SidebarContextProps {
  close: () => void;
  isMobile: boolean;
  open: () => void;
  opened: boolean;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean;
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [opened, { close, open, toggle }] = useDisclosure(defaultOpen);

  // Keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  // Save state to cookie
  React.useEffect(() => {
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${opened}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }, [opened]);

  const value = React.useMemo(
    () => ({ close, isMobile: isMobile ?? false, open, opened, toggle }),
    [isMobile, opened, open, close, toggle],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div {...props}>{children}</div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({ children, ...props }: React.ComponentProps<'aside'>) {
  const { close, isMobile, opened } = useSidebar();

  if (isMobile) {
    return (
      <Drawer onClose={close} opened={opened} padding="md" size="sm">
        <ScrollArea h="100%">{children}</ScrollArea>
      </Drawer>
    );
  }

  return (
    <AppShell.Navbar hidden={!opened} p="md" {...props}>
      <ScrollArea h="100%">{children}</ScrollArea>
    </AppShell.Navbar>
  );
}

export function SidebarTrigger({ ...props }: React.ComponentProps<typeof ActionIcon>) {
  const { toggle } = useSidebar();

  return (
    <Tooltip label="Toggle sidebar (⌘B)">
      <ActionIcon onClick={toggle} variant="subtle" {...props}>
        <IconMenu2 size={20} />
      </ActionIcon>
    </Tooltip>
  );
}

export function SidebarHeader({ children, ...props }: React.ComponentProps<'div'>) {
  return <div {...props}>{children}</div>;
}

export function SidebarContent({ children, ...props }: React.ComponentProps<'div'>) {
  return <div {...props}>{children}</div>;
}

export function SidebarFooter({ children, ...props }: React.ComponentProps<'div'>) {
  return <div {...props}>{children}</div>;
}

export function SidebarGroup({ children, ...props }: React.ComponentProps<'div'>) {
  return <div {...props}>{children}</div>;
}

export function SidebarGroupLabel({ children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }} {...props}>
      {children}
    </div>
  );
}

export function SidebarGroupContent({ children, ...props }: React.ComponentProps<'div'>) {
  return <div {...props}>{children}</div>;
}

export function SidebarMenu({ children, ...props }: React.ComponentProps<'nav'>) {
  return <nav {...props}>{children}</nav>;
}

export function SidebarMenuItem({ children, ...props }: React.ComponentProps<'div'>) {
  return <div {...props}>{children}</div>;
}

export function SidebarMenuButton({
  asChild,
  children,
  tooltip,
  ...props
}: React.ComponentPropsWithoutRef<typeof NavLink> & {
  asChild?: boolean;
  tooltip?: string;
  children?: React.ReactNode;
}) {
  const content = <NavLink {...props}>{children}</NavLink>;

  if (tooltip) {
    return <Tooltip label={tooltip}>{content}</Tooltip>;
  }

  return content;
}

export function SidebarMenuAction({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof ActionIcon> & { children?: React.ReactNode }) {
  return (
    <ActionIcon size="sm" variant="subtle" {...props}>
      {children}
    </ActionIcon>
  );
}

export function SidebarMenuSub({ children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div style={{ paddingLeft: '1rem' }} {...props}>
      {children}
    </div>
  );
}

export function SidebarMenuSubItem({ children, ...props }: React.ComponentProps<'div'>) {
  return <div {...props}>{children}</div>;
}

export function SidebarMenuSubButton({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof NavLink> & { children?: React.ReactNode }) {
  return (
    <NavLink {...props} style={{ fontSize: '0.875rem' }}>
      {children}
    </NavLink>
  );
}

export function SidebarSeparator() {
  return <Divider my="xs" />;
}

export function SidebarInput(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput size="sm" {...props} />;
}

export function SidebarMenuSkeleton() {
  return <Skeleton height={36} mb="xs" radius="sm" />;
}

export function SidebarMenuBadge({ children, ...props }: React.ComponentProps<'span'>) {
  return (
    <span style={{ fontSize: '0.75rem', marginLeft: 'auto' }} {...props}>
      {children}
    </span>
  );
}

// For backward compatibility
export const SidebarInset = ({ children, ...props }: React.ComponentProps<'main'>) => (
  <main {...props}>{children}</main>
);

export const SidebarRail = () => null;
