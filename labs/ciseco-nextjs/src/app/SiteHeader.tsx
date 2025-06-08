'use client'

import { Header, Header2, useThemeMode } from '@repo/design-system/ciseco'
import { usePathname } from 'next/navigation'

const SiteHeader = () => {
  useThemeMode()

  let pathname = usePathname()

  return pathname === '/home-2' ? <Header /> : <Header2 />
}

export default SiteHeader
