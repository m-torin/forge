import React, { type ReactNode } from 'react';

import { AsideProductQuickView } from '@repo/design-system/ciesco2';
import { AsideSidebarCart } from '@repo/design-system/ciesco2';
import { AsideSidebarNavigation } from '@repo/design-system/ciesco2';
import { Header } from '@repo/design-system/ciesco2';

import 'rc-slider/assets/index.css';

import { Footer } from '@repo/design-system/ciesco2';

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
