'use client';

import {
  CornerPosition,
  FIXED_ELEMENTS,
  FixedElementConfig,
  LAYOUT_BREAKPOINTS,
} from '#/lib/ui-constants';
import {
  useMediaQuery,
  usePrevious,
  useResizeObserver,
  useSetState,
  useShallowEffect,
  useViewportSize,
} from '@mantine/hooks';
import { createContext, useCallback, useContext } from 'react';

interface ActiveElement {
  id: string;
  component: string;
  position: CornerPosition;
  visible: boolean;
  zIndex: number;
  priority: number;
}

interface LayoutState {
  activeElements: ActiveElement[];
  cornerOccupancy: Record<CornerPosition, string[]>;
  isMobile: boolean;
}

interface LayoutManagerContextType {
  layoutState: LayoutState;
  registerElement: (id: string, visible: boolean, config?: Partial<FixedElementConfig>) => void;
  unregisterElement: (id: string) => void;
  getElementPosition: (id: string) => { className: string; offset: number; shouldHide: boolean };
  isCornerAvailable: (corner: CornerPosition, maxElements?: number) => boolean;
  requestPosition: (
    id: string,
    preferredCorner: CornerPosition,
    priority?: number,
  ) => CornerPosition;
  isMobile: boolean;
}

const LayoutManagerContext = createContext<LayoutManagerContextType | null>(null);

export function LayoutManagerProvider({ children }: { children: React.ReactNode }) {
  const manager = useLayoutManagerInternal();

  return <LayoutManagerContext.Provider value={manager}>{children}</LayoutManagerContext.Provider>;
}

export function useLayoutManager() {
  const context = useContext(LayoutManagerContext);
  if (!context) {
    throw new Error('useLayoutManager must be used within LayoutManagerProvider');
  }
  return context;
}

function useLayoutManagerInternal() {
  const { width: _width } = useViewportSize();
  const [layoutState, setLayoutState] = useSetState<LayoutState>({
    activeElements: [],
    cornerOccupancy: {
      'top-left': [],
      'top-right': [],
      'bottom-left': [],
      'bottom-right': [],
    },
    isMobile: false,
  });

  // Use media query for more precise mobile detection
  const isMobile = useMediaQuery(`(max-width: ${LAYOUT_BREAKPOINTS.MOBILE}px)`);

  // Register a fixed element
  const registerElement = useCallback(
    (id: string, visible: boolean, config?: Partial<FixedElementConfig>) => {
      // Check if element already exists with same state to prevent unnecessary updates
      const existingElement = layoutState.activeElements.find(el => el.id === id);
      if (
        existingElement &&
        existingElement.visible === visible &&
        existingElement.position ===
          (config?.corner || FIXED_ELEMENTS.find(el => el.id === id)?.corner)
      ) {
        // No meaningful change needed
        return;
      }

      const elementConfig = FIXED_ELEMENTS.find(el => el.id === id) || config;
      if (!elementConfig) return;

      const existingIndex = layoutState.activeElements.findIndex(el => el.id === id);
      const element: ActiveElement = {
        id,
        component: elementConfig.component || 'default',
        position: elementConfig.corner || 'bottom-right',
        visible,
        zIndex: 50, // Default, would be calculated from Z_INDEX constants
        priority: elementConfig.priority || 0,
      };

      let updatedElements;
      if (existingIndex >= 0) {
        // Update existing element
        updatedElements = [...layoutState.activeElements];
        updatedElements[existingIndex] = element;
      } else {
        // Add new element
        updatedElements = [...layoutState.activeElements, element];
      }

      // Recalculate corner occupancy
      const newOccupancy: Record<CornerPosition, string[]> = {
        'top-left': [],
        'top-right': [],
        'bottom-left': [],
        'bottom-right': [],
      };

      updatedElements
        .filter(el => el.visible)
        .sort((a, b) => a.priority - b.priority)
        .forEach(el => {
          newOccupancy[el.position].push(el.id);
        });

      // Use atomic state update with useSetState
      setLayoutState({
        activeElements: updatedElements,
        cornerOccupancy: newOccupancy,
        isMobile,
      });
    },
    [layoutState.activeElements, isMobile, setLayoutState],
  );

  // Unregister a fixed element
  const unregisterElement = useCallback(
    (id: string) => {
      const filteredElements = layoutState.activeElements.filter(el => el.id !== id);

      // Only update if element actually existed
      if (filteredElements.length !== layoutState.activeElements.length) {
        const updatedOccupancy = Object.entries(layoutState.cornerOccupancy).reduce(
          (acc, [corner, elements]) => ({
            ...acc,
            [corner]: elements.filter(elId => elId !== id),
          }),
          {} as Record<CornerPosition, string[]>,
        );

        setLayoutState({
          activeElements: filteredElements,
          cornerOccupancy: updatedOccupancy,
        });
      }
    },
    [layoutState.activeElements, layoutState.cornerOccupancy, setLayoutState],
  );

  // Get position for an element considering conflicts
  const getElementPosition = useCallback(
    (
      id: string,
    ): {
      className: string;
      offset: number;
      shouldHide: boolean;
    } => {
      const element = layoutState.activeElements.find(el => el.id === id);
      if (!element) {
        return { className: '', offset: 0, shouldHide: false };
      }

      const corner = element.position;
      const elementsInCorner = layoutState.cornerOccupancy[corner];
      const elementIndex = elementsInCorner.indexOf(id);

      // Responsive spacing and visibility rules
      const spacing = isMobile ? 60 : 80;
      const maxElementsPerCorner = isMobile ? 1 : 2; // Limit elements on mobile

      // Calculate offset based on position in corner
      const offset = elementIndex * spacing;

      // Hide lower priority elements on mobile if too crowded
      const shouldHide = isMobile && elementIndex >= maxElementsPerCorner;

      // Responsive positioning
      const mobilePositions = {
        'top-left': 'top-2 left-2',
        'top-right': 'top-2 right-2',
        'bottom-left': 'bottom-2 left-2',
        'bottom-right': 'bottom-2 right-2',
      };

      const desktopPositions = {
        'top-left': 'top-4 left-4',
        'top-right': 'top-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-right': 'bottom-4 right-4',
      };

      const basePositions = isMobile ? mobilePositions : desktopPositions;

      // Smart stacking - avoid overlaps
      let transformClasses = '';
      if (offset > 0 && !shouldHide) {
        if (corner.includes('top')) {
          transformClasses = `translate-y-[${offset}px]`;
        } else {
          transformClasses = `translate-y-[-${offset}px]`;
        }

        // On mobile, stack horizontally if vertical space is limited
        if (isMobile && elementIndex > 0) {
          if (corner.includes('right')) {
            transformClasses += ` translate-x-[-${offset}px]`;
          } else if (corner.includes('left')) {
            transformClasses += ` translate-x-[${offset}px]`;
          }
        }
      }

      const className = [
        'fixed',
        basePositions[corner],
        transformClasses,
        `z-[${element.zIndex}]`,
        // Add responsive classes
        isMobile ? 'scale-90' : 'scale-100',
        'transition-all duration-200 ease-out',
      ]
        .filter(Boolean)
        .join(' ');

      return { className, offset, shouldHide };
    },
    [layoutState, isMobile],
  );

  // Check if a corner is available
  const isCornerAvailable = useCallback(
    (corner: CornerPosition, maxElements = 2) => {
      return layoutState.cornerOccupancy[corner].length < maxElements;
    },
    [layoutState.cornerOccupancy],
  );

  // Get alternative position if preferred corner is full
  const getAlternativePosition = useCallback(
    (preferredCorner: CornerPosition, _priority: number): CornerPosition => {
      // Check if preferred corner has space
      if (isCornerAvailable(preferredCorner)) {
        return preferredCorner;
      }

      // Find alternative corner with least elements
      const cornerCounts = Object.entries(layoutState.cornerOccupancy)
        .map(([corner, elements]) => ({ corner: corner as CornerPosition, count: elements.length }))
        .sort((a, b) => a.count - b.count);

      return cornerCounts[0].corner;
    },
    [layoutState.cornerOccupancy, isCornerAvailable],
  );

  // Smart positioning that avoids conflicts
  const requestPosition = useCallback(
    (id: string, preferredCorner: CornerPosition, priority: number = 5): CornerPosition => {
      // For high priority elements, try to claim preferred position
      if (priority <= 2) {
        return preferredCorner;
      }

      return getAlternativePosition(preferredCorner, priority);
    },
    [getAlternativePosition],
  );

  return {
    layoutState,
    registerElement,
    unregisterElement,
    getElementPosition,
    isCornerAvailable,
    requestPosition,
    isMobile,
  };
}

// Hook for individual components to register themselves
export function useFixedPosition(
  id: string,
  preferredCorner: CornerPosition,
  visible: boolean,
  priority: number = 5,
) {
  const { registerElement, getElementPosition, requestPosition } = useLayoutManager();

  // Track previous values to detect meaningful changes
  const prevVisible = usePrevious(visible);
  const prevCorner = usePrevious(preferredCorner);
  const prevPriority = usePrevious(priority);

  // Use resize observer to track element size changes
  const [elementRef, elementRect] = useResizeObserver();

  // Use shallow effect to prevent unnecessary re-renders
  useShallowEffect(() => {
    // Only register if values actually changed
    if (
      visible !== prevVisible ||
      preferredCorner !== prevCorner ||
      priority !== prevPriority ||
      prevVisible === undefined
    ) {
      // Initial render

      if (visible) {
        const actualCorner = requestPosition(id, preferredCorner, priority);
        registerElement(id, visible, {
          id,
          component: id,
          corner: actualCorner,
          priority,
          conditional: true,
          zIndex: 'PANEL',
        });
      } else {
        // Register with visible: false to properly update state
        registerElement(id, false, {
          id,
          component: id,
          corner: preferredCorner,
          priority,
          conditional: true,
          zIndex: 'PANEL',
        });
      }
    }
  }, [{ id, visible, preferredCorner, priority }]);

  const position = getElementPosition(id);

  return {
    ...position,
    elementRef,
    elementSize: elementRect,
  };
}
