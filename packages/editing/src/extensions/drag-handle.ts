import DragHandleExtension from '@tiptap/extension-drag-handle';

// Re-export the base extension
export { DragHandleExtension as DragHandle };

/**
 * Drag Handle extension wrapper for TipTap v3
 *
 * Configures the official @tiptap/extension-drag-handle with sensible defaults
 *
 * @example
 * ```tsx
 * import { DragHandleConfigured } from '@repo/editing/extensions/drag-handle';
 *
 * const extensions = [
 *   DragHandleConfigured.configure({
 *     excludedNodeTypes: ['codeBlock', 'horizontalRule'],
 *   })
 * ];
 * ```
 */
export const DragHandleConfigured = DragHandleExtension.extend({
  name: 'dragHandle',

  addOptions() {
    return {
      // Sensible defaults
      render: () => {
        const container = document.createElement('div');
        container.className = 'drag-handle';
        container.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm6-10a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
          </svg>
        `;
        return container;
      },
    };
  },
});

/**
 * CSS for drag handle (to be imported in your styles)
 */
export const dragHandleStyles = `
.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 4px;
  background: transparent;
  color: #6b7280;
}

.drag-handle:hover {
  background: #f3f4f6;
  color: #374151;
}

.drag-handle:active {
  cursor: grabbing;
}

.ProseMirror .has-focus .drag-handle {
  opacity: 1;
}

.ProseMirror [data-drag-handle] {
  position: relative;
}

.ProseMirror [data-drag-handle]:hover .drag-handle {
  opacity: 1;
}
`;

/**
 * Get default excluded node types for drag handle
 */
export function getDefaultExcludedNodeTypes(): string[] {
  return ['codeBlock', 'image', 'video', 'horizontalRule'];
}

/**
 * Configuration options for drag handle
 */
export interface DragHandleConfig {
  /** Node types that should not be draggable */
  excludedNodeTypes?: string[];
  /** Custom render function */
  render?: () => HTMLElement;
  /** Show on hover */
  showOnHover?: boolean;
}

/**
 * Create a configured drag handle extension
 */
export function createDragHandle(config: DragHandleConfig = {}) {
  return DragHandleConfigured.configure({
    render: config.render,
  });
}
