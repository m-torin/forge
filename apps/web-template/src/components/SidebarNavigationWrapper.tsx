'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

import { SidebarNavigation } from '@/components/ui';

import { TNavigationItem } from '@/types';

interface SidebarNavigationWrapperProps {
  data: TNavigationItem[];
  onClose: () => void;
}

export function SidebarNavigationWrapper({ data, onClose }: SidebarNavigationWrapperProps) {
  const pathname = usePathname();

  // Close the drawer when the pathname changes (navigation occurred)
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return <SidebarNavigation data={data} />;
}
