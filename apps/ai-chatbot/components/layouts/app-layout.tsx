'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface AppLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  variant?: 'chat' | 'editor';
  defaultSidebarOpen?: boolean;
  className?: string;
}

export function AppLayout({
  children,
  sidebar,
  variant = 'chat',
  defaultSidebarOpen = true,
  className,
}: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      {sidebar}
      <SidebarInset
        className={cn(
          'flex flex-col',
          variant === 'chat' ? 'h-dvh min-w-0 bg-background' : 'h-screen !bg-gray-50',
          className,
        )}
      >
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

export interface AppMainContentProps {
  children: ReactNode;
  variant?: 'chat' | 'editor';
  className?: string;
}

export function AppMainContent({ children, variant = 'chat', className }: AppMainContentProps) {
  return (
    <div className={cn('flex-1 overflow-auto', className)}>
      {variant === 'editor' ? (
        <div className="mx-auto h-full max-w-4xl px-2 py-3 sm:px-4 sm:py-6 lg:px-6">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}
