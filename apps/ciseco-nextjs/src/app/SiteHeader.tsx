'use client'

import Header from '@/components/Header/Header'
import Header2 from '@/components/Header/Header2'
import { useThemeMode } from '@/hooks/useThemeMode'
import { usePathname } from 'next/navigation'

const SiteHeader = () => {
  useThemeMode()

  let pathname = usePathname()

  return pathname === '/home-2' ? <Header /> : <Header2 />
}

export default SiteHeader
