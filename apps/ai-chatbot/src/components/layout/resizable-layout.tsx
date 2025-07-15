'use client';

import { Button } from '#/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { useLocalStorage, useToggle, useViewportSize } from '@mantine/hooks';
import { clsx } from 'clsx';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Create cn utility function for this package
const cn = (...classes: (string | undefined | null | boolean)[]) => clsx(classes);

// Note: These UI components should be imported from the consuming app
// as they depend on the specific design system being used

interface ResizablePanelProps {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  onSizeChange?: (size: number) => void;
  children: React.ReactNode;
  className?: string;
  resizeHandle?: 'left' | 'right' | 'top' | 'bottom';
  id?: string;
}

interface ResizableLayoutContextType {
  panels: Map<string, { size: number; collapsed: boolean }>;
  updatePanel: (id: string, size: number, collapsed?: boolean) => void;
  isPanelCollapsed: (id: string) => boolean;
  togglePanel: (id: string) => void;
}

const ResizableLayoutContext = React.createContext<ResizableLayoutContextType>({
  panels: new Map(),
  updatePanel: () => {},
  isPanelCollapsed: () => false,
  togglePanel: () => {},
});

export function ResizableLayoutProvider({ children }: { children: React.ReactNode }) {
  const [panels, setPanels] = useState<Map<string, { size: number; collapsed: boolean }>>(
    new Map(),
  );

  // Use Mantine's useLocalStorage for better error handling and serialization
  const [persistedPanels, setPersistedPanels] = useLocalStorage<
    Record<string, { size: number; collapsed: boolean }>
  >({
    key: 'resizable-panels',
    defaultValue: {},
  });

  const updatePanel = useCallback(
    (id: string, size: number, collapsed = false) => {
      const panelData = { size, collapsed };

      setPanels(prev => {
        const newPanels = new Map(prev);
        newPanels.set(id, panelData);
        return newPanels;
      });

      // Update persisted storage
      setPersistedPanels(prev => ({
        ...prev,
        [id]: panelData,
      }));
    },
    [setPersistedPanels],
  );

  const isPanelCollapsed = useCallback(
    (id: string) => {
      return panels.get(id)?.collapsed ?? false;
    },
    [panels],
  );

  const togglePanel = useCallback(
    (id: string) => {
      const panel = panels.get(id);
      if (panel) {
        updatePanel(id, panel.size, !panel.collapsed);
      }
    },
    [panels, updatePanel],
  );

  // Load persisted panel sizes on mount
  useEffect(() => {
    if (Object.keys(persistedPanels).length > 0) {
      setPanels(new Map(Object.entries(persistedPanels)));
    }
  }, [persistedPanels]);

  return (
    <ResizableLayoutContext.Provider value={{ panels, updatePanel, isPanelCollapsed, togglePanel }}>
      {children}
    </ResizableLayoutContext.Provider>
  );
}

export function useResizableLayout() {
  const context = React.useContext(ResizableLayoutContext);
  if (!context) {
    throw new Error('useResizableLayout must be used within ResizableLayoutProvider');
  }
  return context;
}

export function ResizablePanel({
  defaultSize = 250,
  minSize = 150,
  maxSize = 600,
  collapsible = true,
  onSizeChange,
  children,
  className,
  resizeHandle = 'right',
  id = 'panel',
}: ResizablePanelProps) {
  const {
    panels,
    updatePanel,
    isPanelCollapsed: _isPanelCollapsed,
    togglePanel: _togglePanel,
  } = useResizableLayout();
  const { width } = useViewportSize();
  const isMobile = width < 768;

  const persistedPanel = panels.get(id);
  const [size, setSize] = useState(persistedPanel?.size ?? defaultSize);
  const [collapsed, setCollapsed] = useState(persistedPanel?.collapsed ?? false);
  const [isDragging, setIsDragging] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Calculate panel width/height based on resize handle direction
  const isHorizontal = resizeHandle === 'left' || resizeHandle === 'right';
  const panelSize = collapsed ? (isHorizontal ? 48 : 32) : size;

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = useCallback(
    (event: any, info: any) => {
      if (!panelRef.current) return;

      const delta = isHorizontal ? info.delta.x : info.delta.y;
      const multiplier = resizeHandle === 'left' || resizeHandle === 'top' ? -1 : 1;
      const newSize = Math.max(minSize, Math.min(maxSize, size + delta * multiplier));

      setSize(newSize);
    },
    [size, minSize, maxSize, isHorizontal, resizeHandle],
  );

  const handleDragEnd = useCallback(
    (_event: any, _info: any) => {
      setIsDragging(false);
      x.set(0);
      y.set(0);

      updatePanel(id, size, collapsed);
      onSizeChange?.(size);
    },
    [size, collapsed, id, updatePanel, onSizeChange, x, y],
  );

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile && !collapsed) {
      setCollapsed(true);
      updatePanel(id, size, true);
    }
  }, [isMobile, collapsed, id, size, updatePanel]);

  // Sync with context
  useEffect(() => {
    if (persistedPanel) {
      setSize(persistedPanel.size);
      setCollapsed(persistedPanel.collapsed);
    }
  }, [persistedPanel]);

  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    updatePanel(id, size, newCollapsed);
  };

  return (
    <motion.div
      ref={panelRef}
      className={cn(
        'relative flex-shrink-0 border-border bg-background',
        isHorizontal ? 'border-r' : 'border-b',
        isDragging && 'select-none',
        className,
      )}
      style={{
        width: isHorizontal ? panelSize : undefined,
        height: !isHorizontal ? panelSize : undefined,
      }}
      animate={{
        width: isHorizontal ? panelSize : undefined,
        height: !isHorizontal ? panelSize : undefined,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Panel Content */}
      <div className={cn('h-full w-full overflow-hidden', collapsed && 'hidden')}>{children}</div>

      {/* Collapsed State */}
      {collapsed && collapsible && (
        <div className="flex h-full w-full items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleCollapse}
                className="rotate-0 transition-transform hover:rotate-180"
              >
                {isHorizontal
                  ? resizeHandle === 'right'
                    ? '◀'
                    : '▶'
                  : resizeHandle === 'bottom'
                    ? '▲'
                    : '▼'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Expand panel</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Resize Handle */}
      {!isMobile && (
        <motion.div
          style={{ x, y }}
          drag={isHorizontal ? 'x' : 'y'}
          dragControls={dragControls}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className={cn(
            'group absolute z-10 cursor-col-resize transition-colors',
            'hover:bg-primary/20 active:bg-primary/30',
            isHorizontal ? 'bottom-0 top-0 w-1' : 'left-0 right-0 h-1',
            resizeHandle === 'right' && 'right-0',
            resizeHandle === 'left' && 'left-0',
            resizeHandle === 'bottom' && 'bottom-0',
            resizeHandle === 'top' && 'top-0',
            isDragging && 'bg-primary/30',
          )}
        >
          {/* Resize handle indicator */}
          <div
            className={cn(
              'absolute bg-muted-foreground/30 transition-colors group-hover:bg-primary/60',
              isHorizontal
                ? 'left-1/2 top-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2'
                : 'left-1/2 top-1/2 h-0.5 w-8 -translate-x-1/2 -translate-y-1/2',
            )}
          />
        </motion.div>
      )}

      {/* Collapse Button */}
      {collapsible && !collapsed && !isMobile && (
        <div
          className={cn(
            'absolute z-20',
            resizeHandle === 'right' && 'right-2 top-2',
            resizeHandle === 'left' && 'left-2 top-2',
            resizeHandle === 'bottom' && 'bottom-2 right-2',
            resizeHandle === 'top' && 'right-2 top-2',
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleCollapse}
                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
              >
                {isHorizontal
                  ? resizeHandle === 'right'
                    ? '◀'
                    : '▶'
                  : resizeHandle === 'bottom'
                    ? '▲'
                    : '▼'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Collapse panel</TooltipContent>
          </Tooltip>
        </div>
      )}
    </motion.div>
  );
}

// Pre-built layout components
export function SidebarLayout({
  sidebar,
  main,
  sidebarProps = {},
}: {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  sidebarProps?: Partial<ResizablePanelProps>;
}) {
  return (
    <div className="flex h-full">
      <ResizablePanel
        id="sidebar"
        defaultSize={280}
        minSize={200}
        maxSize={400}
        resizeHandle="right"
        {...sidebarProps}
      >
        {sidebar}
      </ResizablePanel>
      <div className="flex-1 overflow-hidden">{main}</div>
    </div>
  );
}

export function ChatLayout({
  sidebar,
  chat,
  inspector,
  sidebarProps = {},
  inspectorProps = {},
}: {
  sidebar: React.ReactNode;
  chat: React.ReactNode;
  inspector?: React.ReactNode;
  sidebarProps?: Partial<ResizablePanelProps>;
  inspectorProps?: Partial<ResizablePanelProps>;
}) {
  return (
    <div className="flex h-full">
      <ResizablePanel
        id="sidebar"
        defaultSize={280}
        minSize={200}
        maxSize={400}
        resizeHandle="right"
        {...sidebarProps}
      >
        {sidebar}
      </ResizablePanel>

      <div className="flex-1 overflow-hidden">{chat}</div>

      {inspector && (
        <ResizablePanel
          id="inspector"
          defaultSize={320}
          minSize={250}
          maxSize={500}
          resizeHandle="left"
          {...inspectorProps}
        >
          {inspector}
        </ResizablePanel>
      )}
    </div>
  );
}

// Layout presets
export function useLayoutPresets() {
  const { updatePanel } = useResizableLayout();

  const presets = {
    default: () => {
      updatePanel('sidebar', 280, false);
      updatePanel('inspector', 320, true);
    },
    focus: () => {
      updatePanel('sidebar', 200, true);
      updatePanel('inspector', 250, true);
    },
    debug: () => {
      updatePanel('sidebar', 300, false);
      updatePanel('inspector', 400, false);
    },
    mobile: () => {
      updatePanel('sidebar', 250, true);
      updatePanel('inspector', 300, true);
    },
  };

  return { presets, applyPreset: (name: keyof typeof presets) => presets[name]() };
}

// Layout controls component
export function LayoutControls({ className }: { className?: string }) {
  const { presets, applyPreset } = useLayoutPresets();
  const [isOpen, toggleOpen] = useToggle([false, true]);

  return (
    <div className={cn('relative', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={() => toggleOpen()} className="h-8 w-8 p-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Layout presets</TooltipContent>
      </Tooltip>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-32 rounded-lg border bg-popover shadow-lg">
          <div className="p-1">
            {Object.keys(presets).map(preset => (
              <button
                key={preset}
                className="flex w-full items-center rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                onClick={() => {
                  applyPreset(preset as keyof typeof presets);
                  toggleOpen(false);
                }}
              >
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => toggleOpen(false)}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              toggleOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close layout presets menu"
        />
      )}
    </div>
  );
}
