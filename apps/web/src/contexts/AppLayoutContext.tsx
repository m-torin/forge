"use client";

import { useDisclosure } from "@mantine/hooks";
import { createContext, type ReactNode, useContext } from "react";

interface AppLayoutContextType {
  cartOpened: boolean;
  closeCart: () => void;
  closeNav: () => void;
  navOpened: boolean;
  openCart: () => void;
  openNav: () => void;
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
        closeCart,
        closeNav,
        navOpened,
        openCart,
        openNav,
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
