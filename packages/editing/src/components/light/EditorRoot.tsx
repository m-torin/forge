'use client';

import { Provider as JotaiProvider } from 'jotai';
import type { FC, ReactNode } from 'react';
import { createContext, useContext, useRef } from 'react';
import tunnel from 'tunnel-rat';

/**
 * Tunnel context for command menu portals
 */
export const EditorTunnelContext = createContext<ReturnType<typeof tunnel> | null>(null);

/**
 * Hook to access the editor tunnel
 */
export function useEditorTunnel() {
  const tunnelInstance = useContext(EditorTunnelContext);
  if (!tunnelInstance) {
    throw new Error('useEditorTunnel must be used within EditorRoot');
  }
  return tunnelInstance;
}

export interface EditorRootProps {
  /** Child components */
  children: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom Jotai store (optional) */
  store?: any;
}

/**
 * EditorRoot component
 *
 * Provides Jotai state management and tunnel context for the editor
 *
 * @example
 * ```tsx
 * <EditorRoot>
 *   <EditorContent extensions={extensions} />
 * </EditorRoot>
 * ```
 */
export const EditorRoot: FC<EditorRootProps> = ({ children, className, store }) => {
  const tunnelInstance = useRef(tunnel()).current;

  const content = (
    <EditorTunnelContext.Provider value={tunnelInstance}>
      <div className={className} data-editor-root="">
        {children}
      </div>
    </EditorTunnelContext.Provider>
  );

  // Use custom store or default provider
  if (store) {
    return <JotaiProvider store={store}>{content}</JotaiProvider>;
  }

  return <JotaiProvider>{content}</JotaiProvider>;
};
