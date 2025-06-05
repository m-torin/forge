import React, { type ReactNode } from "react";
import "rc-slider/assets/index.css";

import {
  AsideProductQuickview,
  AsideSidebarCart,
  AsideSidebarNavigation,
  Footer,
  Header,
} from "@repo/design-system/mantine-ciseco";

interface ComponentProps {
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
}

function ApplicationLayout({
  children,
  footer,
  header,
}: ComponentProps) {
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
