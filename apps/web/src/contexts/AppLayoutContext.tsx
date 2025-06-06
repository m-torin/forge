"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useDisclosure } from "@mantine/hooks";

interface AppLayoutContextType {
  cartOpened: boolean;
  navOpened: boolean;
  openCart: () => void;
  closeCart: () => void;
  openNav: () => void;
  closeNav: () => void;
}

const AppLayoutContext = createContext<AppLayoutContextType | undefined>(
  undefined,
);

export function AppLayoutProvider({ children }: { children: ReactNode }) {
  const [cartOpened, { close: closeCart, open: openCart }] =
    useDisclosure(false);
  const [navOpened, { close: closeNav, open: openNav }] = useDisclosure(false);

  return (
    <AppLayoutContext.Provider
      value={{
        cartOpened,
        navOpened,
        openCart,
        closeCart,
        openNav,
        closeNav,
      }}
    >
      {children}
    </AppLayoutContext.Provider>
  );
}

export function useAppLayout() {
  const context = useContext(AppLayoutContext);
  if (!context) {
    throw new Error("useAppLayout must be used within AppLayoutProvider");
  }
  return context;
}
