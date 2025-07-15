'use client';

import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  Placement,
  ReferenceElement,
  shift,
} from '@floating-ui/dom';
import { ReactRenderer } from '@tiptap/react';
import { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';

interface SuggestionRenderProps {
  component: React.ComponentType<any>;
  popup?: Partial<{
    placement: Placement;
    offset: number;
    fallbackPlacements: Placement[];
    padding: number;
    strategy: 'absolute' | 'fixed';
  }>;
}

export function createSuggestionRender<T>({
  component,
  popup = {},
}: SuggestionRenderProps): SuggestionOptions<T>['render'] {
  return () => {
    let reactRenderer: ReactRenderer;
    let floatingElement: HTMLDivElement;
    let cleanup: (() => void) | null = null;

    const updatePosition = async (referenceElement: ReferenceElement) => {
      if (!floatingElement) return;

      const { x, y, strategy, middlewareData } = await computePosition(
        referenceElement,
        floatingElement,
        {
          placement: popup.placement || 'bottom-start',
          strategy: popup.strategy || 'absolute',
          middleware: [
            offset(popup.offset || 8),
            flip({
              fallbackPlacements: popup.fallbackPlacements || ['bottom-start', 'top-start'],
            }),
            shift({
              padding: popup.padding || 8,
            }),
          ],
        },
      );

      Object.assign(floatingElement.style, {
        left: `${x}px`,
        top: `${y}px`,
        position: strategy,
      });

      // Apply additional styling based on middleware data
      if (middlewareData.flip?.index !== undefined) {
        const finalPlacement =
          middlewareData.flip.overflows?.[0]?.placement || popup.placement || 'bottom-start';
        floatingElement.setAttribute('data-placement', finalPlacement);
      }
    };

    return {
      onStart: (props: SuggestionProps<T>) => {
        reactRenderer = new ReactRenderer(component, {
          props,
          editor: props.editor,
        });

        // Create floating container element
        floatingElement = document.createElement('div');
        floatingElement.style.position = popup.strategy || 'absolute';
        floatingElement.style.top = '0';
        floatingElement.style.left = '0';
        floatingElement.style.zIndex = '1000';
        floatingElement.style.maxWidth = 'calc(100vw - 16px)';
        floatingElement.style.maxHeight = 'calc(100vh - 16px)';
        floatingElement.className = 'tiptap-suggestion-floating';
        floatingElement.appendChild(reactRenderer.element);
        document.body.appendChild(floatingElement);

        if (!props.clientRect) {
          return;
        }

        const rect = props.clientRect();
        if (!rect) {
          return;
        }

        const virtualElement: ReferenceElement = {
          getBoundingClientRect: () => rect,
        };

        updatePosition(virtualElement);

        // Set up auto-update for dynamic positioning
        cleanup = autoUpdate(virtualElement, floatingElement, () => {
          updatePosition(virtualElement);
        });
      },

      onUpdate: (props: SuggestionProps<T>) => {
        reactRenderer?.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        const rect = props.clientRect();
        if (!rect) {
          return;
        }

        const virtualElement: ReferenceElement = {
          getBoundingClientRect: () => rect,
        };

        updatePosition(virtualElement);
      },

      onKeyDown: (props: { event: KeyboardEvent }) => {
        if (props.event.key === 'Escape') {
          return true;
        }

        return (reactRenderer?.ref as any)?.onKeyDown?.(props) ?? false;
      },

      onExit: () => {
        cleanup?.();
        floatingElement?.remove();
        reactRenderer?.destroy();
      },
    };
  };
}

// Helper function for getting items based on query
export function getSuggestionItems<T>(
  items: T[],
  query: string,
  searchFn: (item: T, query: string) => boolean,
  limit = 10,
): T[] {
  if (!query) return items.slice(0, limit);

  return items.filter(item => searchFn(item, query)).slice(0, limit);
}
