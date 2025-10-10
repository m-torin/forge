'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface HeaderTitleProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function HeaderTitle({
  value,
  onChange,
  placeholder = 'Untitled',
  editable = true,
  className,
}: HeaderTitleProps) {
  if (!editable) {
    return (
      <div className={cn('px-0 text-base font-semibold sm:text-lg', className)}>
        {value || placeholder}
      </div>
    );
  }

  return (
    <Input
      value={value}
      onChange={e => onChange?.(e.target.value)}
      className={cn(
        'border-none px-0 text-base font-semibold focus-visible:ring-0 sm:text-lg',
        className,
      )}
      placeholder={placeholder}
    />
  );
}
