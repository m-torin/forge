import {
  AsideProductQuickview,
  AsideSidebarCart,
  AsideSidebarNavigation,
  Footer,
  Header,
} from '@repo/design-system/ciseco'
import 'rc-slider/assets/index.css'
import React, { ReactNode } from 'react'

interface ComponentProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
}

const ApplicationLayout: React.FC<ComponentProps> = ({ children, header, footer }) => {
  return (
    <div>
      {header ? header : <Header hasBorderBottom />}
      {children}
      {footer ? footer : <Footer />}

      {/* ASIDES */}
      <AsideSidebarNavigation />
      <AsideSidebarCart />
      <AsideProductQuickview />
    </div>
  )
}

export { ApplicationLayout }
