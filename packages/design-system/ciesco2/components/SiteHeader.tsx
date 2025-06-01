'use client';

import Header from './Header/Header';
import Header2 from './Header/Header2';
import { useThemeMode } from '../hooks/useThemeMode';
import { usePathname } from 'next/navigation';

const SiteHeader = () => {
  useThemeMode();

  const pathname = usePathname();

  return pathname === '/home-2' ? <Header /> : <Header2 />;
};

export default SiteHeader;
