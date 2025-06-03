import React, { type ReactNode } from "react";
import "rc-slider/assets/index.css";

import {
  AsideProductQuickview,
  AsideSidebarCart,
  AsideSidebarNavigation,
  Footer,
  Header,
} from "@repo/design-system/ciseco";

interface ComponentProps {
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
}

const ApplicationLayout: React.FC<ComponentProps> = ({
  children,
  footer,
  header,
}) => {
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
  );
};

export { ApplicationLayout };
