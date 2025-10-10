import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { useCurrentEditor } from '@tiptap/react';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

/**
 * Image Resizer component using react-moveable
 */
export const ImageResizerComponent: FC = () => {
  const { editor } = useCurrentEditor();
  const [Moveable, setMoveable] = useState<any>(null);

  // Lazy load react-moveable to avoid SSR issues
  useEffect(() => {
    const loadMoveable = async () => {
      if (typeof window !== 'undefined') {
        try {
          const module = await import('react-moveable');
          setMoveable(() => module.default);
        } catch {
          // Silently fail if module cannot be loaded
        }
      }
    };
    void loadMoveable();
  }, []);

  if (!editor?.isActive('image') || !Moveable) {
    return null;
  }

  const updateMediaSize = () => {
    const imageEl = document.querySelector('.ProseMirror-selectednode') as HTMLImageElement;
    if (!imageEl) return;

    const selection = editor.state.selection;
    const width = Number.parseInt(imageEl.style.width.replace('px', ''), 10);
    const height = Number.parseInt(imageEl.style.height.replace('px', ''), 10);

    if (!Number.isNaN(width) && !Number.isNaN(height)) {
      editor.commands.updateAttributes('image', {
        src: imageEl.src,
        width,
        height,
      });
      editor.commands.setNodeSelection(selection.from);
    }
  };

  const target = document.querySelector('.ProseMirror-selectednode') as HTMLElement;
  if (!target) return null;

  return (
    <Moveable
      target={target}
      container={null}
      origin={false}
      edge={false}
      throttleDrag={0}
      keepRatio={true}
      resizable={true}
      throttleResize={0}
      onResize={(e: {
        target: HTMLElement;
        width: number;
        height: number;
        delta: [number, number];
      }) => {
        const { target, width, height, delta } = e;
        if (delta[0]) target.style.width = `${width}px`;
        if (delta[1]) target.style.height = `${height}px`;
      }}
      onResizeEnd={() => {
        updateMediaSize();
      }}
      scalable={true}
      throttleScale={0}
      renderDirections={['w', 'e']}
      onScale={(e: { target: HTMLElement; transform: string }) => {
        const { target, transform } = e;
        target.style.transform = transform;
      }}
    />
  );
};

export interface ImageResizerOptions {
  /** Minimum width in pixels */
  minWidth?: number;
  /** Maximum width in pixels */
  maxWidth?: number;
  /** Lock aspect ratio */
  lockAspectRatio?: boolean;
  /** Resize handles position */
  handles?: ('n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw')[];
}

/**
 * Image Resizer extension for TipTap v3
 *
 * Adds resizable handles to images
 */
export const ImageResizer = Extension.create<ImageResizerOptions>({
  name: 'imageResizer',

  addOptions() {
    return {
      minWidth: 50,
      maxWidth: 1200,
      lockAspectRatio: true,
      handles: ['w', 'e'],
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageResizer'),
        props: {
          handleDOMEvents: {
            // Add any DOM event handlers if needed
          },
        },
      }),
    ];
  },
});

/**
 * Helper to get image dimensions from natural size
 */
export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
export function calculateAspectRatio(
  originalWidth: number,
  originalHeight: number,
  newWidth?: number,
  newHeight?: number,
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  if (newWidth) {
    return {
      width: newWidth,
      height: Math.round(newWidth / aspectRatio),
    };
  }

  if (newHeight) {
    return {
      width: Math.round(newHeight * aspectRatio),
      height: newHeight,
    };
  }

  return { width: originalWidth, height: originalHeight };
}
