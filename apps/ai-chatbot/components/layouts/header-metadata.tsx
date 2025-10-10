'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface MetadataItem {
  id?: string;
  type: 'text' | 'badge' | 'button';
  content: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
}

export interface HeaderMetadataProps {
  items: MetadataItem[];
  showBullets?: boolean;
  className?: string;
}

const generatedKeyMap = new WeakMap<MetadataItem, string>();
const generateKey = (item: MetadataItem) => {
  if (item.id) {
    return item.id;
  }

  const existingKey = generatedKeyMap.get(item);
  if (existingKey) {
    return existingKey;
  }

  const randomKey =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  generatedKeyMap.set(item, randomKey);
  return randomKey;
};

export function HeaderMetadata({ items, showBullets = true, className }: HeaderMetadataProps) {
  const getVariantClasses = (variant: MetadataItem['variant'] = 'default') => {
    const variants = {
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    };
    return variants[variant];
  };

  const renderItem = (item: MetadataItem, key: string) => {
    const itemClasses = cn(
      item.hideOnMobile && 'hidden sm:inline',
      item.hideOnDesktop && 'sm:hidden',
      item.className,
    );

    switch (item.type) {
      case 'badge':
        return (
          <span
            key={key}
            className={cn(
              'whitespace-nowrap rounded px-2 py-1 text-xs',
              getVariantClasses(item.variant),
              itemClasses,
            )}
          >
            {item.content}
          </span>
        );

      case 'button':
        return (
          <Button
            key={key}
            variant="ghost"
            size="sm"
            onClick={item.onClick}
            disabled={item.disabled}
            className={cn('h-6 whitespace-nowrap px-2 text-xs', itemClasses)}
          >
            {item.content}
          </Button>
        );

      case 'text':
      default:
        return (
          <span key={key} className={cn('whitespace-nowrap', itemClasses)}>
            {item.content}
          </span>
        );
    }
  };

  if (items.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-1 sm:gap-2', className)}>
      {items.map((item, index) => {
        const key = generateKey(item);
        return (
          <div key={key} className="flex items-center gap-1 sm:gap-2">
            {index > 0 && showBullets && (
              <span className="hidden text-muted-foreground sm:inline">•</span>
            )}
            {renderItem(item, key)}
          </div>
        );
      })}
    </div>
  );
}
