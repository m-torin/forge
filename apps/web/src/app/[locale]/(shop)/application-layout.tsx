"use client";

import { CartContent } from "@/components/CartContent";
import "rc-slider/assets/index.css";
import { SidebarNavigationWrapper } from "@/components/SidebarNavigationWrapper";
import { Drawer, ScrollArea } from "@mantine/core";
import React, { type ReactNode, useEffect, useState } from "react";

import { Footer, Logo } from "@repo/design-system/mantine-ciseco";
import { getNavigation } from "@repo/design-system/mantine-ciseco/data/navigation";
import { AppLayoutProvider, useAppLayout } from "@/contexts/AppLayoutContext";

interface ComponentProps {
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
}

function ApplicationLayoutInner({ children, footer, header }: ComponentProps) {
  const { cartOpened, navOpened, closeCart, closeNav } = useAppLayout();
  const [navigationData, setNavigationData] = useState<any[]>([]);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const data = await getNavigation();
        setNavigationData(data);
      } catch (error) {
        console.error("Failed to fetch navigation:", error);
      }
    };
    fetchNavigation();
  }, []);

  return (
    <div>
      {header}
      {children}
      {footer ? footer : <Footer />}

      {/* Cart Drawer */}
      <Drawer
        onClose={closeCart}
        opened={cartOpened}
        position="right"
        scrollAreaComponent={ScrollArea.Autosize}
        styles={{
          body: { height: "100%", padding: 0 },
          content: { display: "flex", flexDirection: "column" },
        }}
        size="md"
        title="Shopping Cart"
        zIndex={200}
      >
        <CartContent onClose={closeCart} />
      </Drawer>

      {/* Navigation Drawer */}
      <Drawer
        onClose={closeNav}
        opened={navOpened}
        position="right"
        scrollAreaComponent={ScrollArea.Autosize}
        classNames={{
          content: "max-w-md",
        }}
        styles={{
          body: { height: "100%", padding: 0 },
          content: { display: "flex", flexDirection: "column" },
          header: { borderBottom: "1px solid var(--mantine-color-gray-3)" },
        }}
        size="md"
        title={<Logo />}
        zIndex={200}
      >
        <div style={{ padding: "var(--mantine-spacing-md)" }}>
          <SidebarNavigationWrapper onClose={closeNav} data={navigationData} />
        </div>
      </Drawer>
    </div>
  );
}

function ApplicationLayout(props: ComponentProps) {
  return (
    <AppLayoutProvider>
      <ApplicationLayoutInner {...props} />
    </AppLayoutProvider>
  );
}

export { ApplicationLayout };
