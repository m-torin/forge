'use client';

import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Drawer, Modal, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { createContext, type ReactNode, useContext, useState } from 'react';

import Logo from '../shared/Logo/Logo';

/**
 * Flexible component that can render as either a Drawer or Modal.
 * @param heading - string. Shown at the top of the component.
 * @param openFrom - for Drawer: 'right' | 'left' | 'top' | 'bottom'
 * @param children - react children node.
 * @param type - the aside type identifier
 * @param variant - 'drawer' or 'modal' to determine which component to use
 */
export function Aside({
  type,
  children,
  heading,
  logoOnHeading = false,
  openFrom = 'right',
  showHeading = true,
  size = 'lg',
  variant = 'drawer',
}: {
  heading?: string;
  logoOnHeading?: boolean;
  openFrom?: 'right' | 'left' | 'top' | 'bottom';
  children: React.ReactNode;
  type: AsideType;
  showHeading?: boolean;
  variant?: 'drawer' | 'modal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | string | number;
}) {
  const { type: activeType, close } = useAside();
  const opened = type === activeType;

  const hasHeading = !!heading || logoOnHeading;

  const headerContent = showHeading && hasHeading && (
    <>
      {!!heading && !logoOnHeading && <span className="text-2xl font-medium">{heading}</span>}
      {logoOnHeading && <Logo />}
    </>
  );

  const closeButton = showHeading && (
    <button
      onClick={close}
      className="group -m-2 cursor-pointer p-2"
      aria-label="Close"
      type="button"
    >
      <HugeiconsIcon
        strokeWidth={1}
        icon={Cancel01Icon}
        className="transition-transform duration-200 group-hover:rotate-90"
        size={24}
      />
    </button>
  );

  // Common props for both Drawer and Modal
  const commonProps = {
    classNames: {
      body: 'p-0 h-full',
      content: 'bg-white dark:bg-neutral-800',
    },
    onClose: close,
    opened,
    padding: 0,
    size,
  };

  if (variant === 'modal') {
    return (
      <Modal {...commonProps} withCloseButton={false} centered title={headerContent}>
        <div className="flex h-full flex-col">
          {showHeading && (
            <div className="flex items-center justify-between border-b border-neutral-900/10 px-4 py-4 md:px-8">
              {headerContent}
              {closeButton}
            </div>
          )}
          <ScrollArea className="flex-1 px-4 py-4 md:px-8">{children}</ScrollArea>
        </div>
      </Modal>
    );
  }

  // Default to Drawer
  return (
    <Drawer
      {...commonProps}
      position={openFrom}
      withCloseButton={false}
      styles={{
        content: {
          height: '100vh',
        },
      }}
      title={headerContent}
    >
      <div className="flex h-full flex-col">
        {showHeading && (
          <div className="flex items-center justify-between border-b border-neutral-900/10 px-4 py-4 md:px-8 md:py-5">
            {headerContent}
            {closeButton}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 py-4 md:px-8">{children}</ScrollArea>
        </div>
      </div>
    </Drawer>
  );
}

/* For backward compatibility */
Aside.Title = ({ children }: { children: ReactNode }) => <>{children}</>;

export function useDrawer(openDefault = false) {
  const [opened, { close, open }] = useDisclosure(openDefault);

  return {
    closeDrawer: close,
    isOpen: opened,
    openDrawer: open,
  };
}

type AsideType =
  | 'search'
  | 'cart'
  | 'closed'
  | 'sidebar-navigation'
  | 'category-filters'
  | 'product-quick-view';
interface AsideContextValue {
  close: () => void;
  open: (mode: AsideType) => void;
  productQuickViewHandle?: string;
  setProductQuickViewHandle: (handle: string) => void;
  type: AsideType;
}
//
const AsideContext = createContext<AsideContextValue | null>(null);

export function AsideProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<AsideType>('closed');
  const [productQuickViewHandle, setProductQuickViewHandle] = useState<string>();

  return (
    <AsideContext.Provider
      value={{
        type,
        close: () => setType('closed'),
        open: setType,
        productQuickViewHandle,
        setProductQuickViewHandle,
      }}
    >
      {children}
    </AsideContext.Provider>
  );
}

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
