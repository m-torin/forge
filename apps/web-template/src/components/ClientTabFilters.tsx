'use client';

import { TabFilters, TabFiltersPopover } from '@/components/ui';

export function ClientTabFilters({ className }: { className?: string }) {
  return <TabFilters className={className} />;
}

export function ClientTabFiltersPopover({ className }: { className?: string }) {
  return <TabFiltersPopover className={className} />;
}
