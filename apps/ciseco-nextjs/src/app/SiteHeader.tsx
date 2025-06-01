'use client';

import { usePathname } from 'next/navigation';

import { Header } from '@repo/design-system/ciesco2';
import { Header2 } from '@repo/design-system/ciesco2';
import { useThemeMode } from '@repo/design-system/ciesco2';

const SiteHeader = () => {
  useThemeMode();

  const pathname = usePathname();

  return pathname === '/home-2' ? <Header /> : <Header2 />;
};

export default SiteHeader;
