/**
 * Light Components (Tailwind-based)
 *
 * Lightweight, unstyled components using Tailwind CSS
 * Perfect for custom designs and minimal bundle sizes
 */

export { EditorRoot, useEditorTunnel } from './EditorRoot';
export type { EditorRootProps } from './EditorRoot';

export { EditorContent } from './EditorContent';
export type { EditorContentProps } from './EditorContent';

export { BubbleMenu } from './BubbleMenu';
export type { BubbleMenuProps } from './BubbleMenu';

export { CommandMenu } from './CommandMenu';
export type { CommandMenuProps } from './CommandMenu';

// Legacy API-compatible components (TipTap v3)
export { EditorBubble } from './EditorBubble';
export type { EditorBubbleProps } from './EditorBubble';
export { EditorBubbleItem } from './EditorBubbleItem';
export {
  EditorCommand,
  EditorCommandList,
  EditorCommandOut,
  EditorCommandTunnelContext,
} from './EditorCommand';
export { EditorCommandEmpty, EditorCommandItem } from './EditorCommandItem';
