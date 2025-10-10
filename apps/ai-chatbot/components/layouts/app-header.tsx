'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface AppHeaderProps {
  leftSlot?: ReactNode;
  centerSlot?: ReactNode;
  rightSlot?: ReactNode;
  variant?: 'chat' | 'editor';
  className?: string;
}

export function AppHeader({
  leftSlot,
  centerSlot,
  rightSlot,
  variant = 'chat',
  className,
}: AppHeaderProps) {
  const baseClasses = 'flex sticky top-0 bg-background items-center gap-2';

  const variantClasses =
    variant === 'editor'
      ? 'border-b p-2 sm:p-4 flex-col sm:flex-row sm:justify-between'
      : 'py-1.5 px-2 md:px-2';

  return (
    <header className={cn(baseClasses, variantClasses, className)}>
      {variant === 'editor' ? (
        <>
          {/* Editor header layout */}
          <div className="flex flex-1 items-center space-x-2 sm:space-x-4">
            {leftSlot}
            {centerSlot}
          </div>
          {rightSlot && (
            <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:gap-4 sm:text-sm">
              {rightSlot}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Chat header layout */}
          {leftSlot}
          {centerSlot}
          <div className="ml-auto">{rightSlot}</div>
        </>
      )}
    </header>
  );
}
