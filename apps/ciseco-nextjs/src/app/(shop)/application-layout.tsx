import AsideProductQuickView from '@/components/aside-product-quickview';
import AsideSidebarCart from '@/components/aside-sidebar-cart';
import AsideSidebarNavigation from '@/components/aside-sidebar-navigation';
import Header from '@/components/Header/Header';
import Footer from '@/shared/Footer/Footer';
import 'rc-slider/assets/index.css';
import React, { type ReactNode } from 'react';

interface ComponentProps {
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
}

const ApplicationLayout: React.FC<ComponentProps> = ({ children, footer, header }) => {
  return (
    <div>
      {header ? header : <Header hasBorderBottom />}
      {children}
      {footer ? footer : <Footer />}

      {/* ASIDES */}
      <AsideSidebarNavigation />
      <AsideSidebarCart />
      <AsideProductQuickView />
    </div>
  );
};

export { ApplicationLayout };
