/**
 * Message Tailwind Class Utilities
 * Extracted from message.tsx to preserve all custom styling while using AI Elements
 */

import { cn } from '../../utils';

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

// Main message container classes
export const messageClasses = {
  /**
   * Main message container with role-based styling
   */
  container: (from: MessageRole, className?: string) =>
    cn(
      'group flex gap-3 p-4',
      'border-b border-border last:border-b-0',
      from === 'user' && 'is-user flex-row-reverse',
      from === 'assistant' && 'is-assistant',
      from === 'system' && 'is-system opacity-75',
      from === 'tool' && 'is-tool bg-muted/50',
      className,
    ),

  /**
   * Message content container with user/assistant styling
   */
  content: (className?: string) =>
    cn(
      'flex flex-col gap-2 text-sm text-foreground',
      'group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground',
      'group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:rounded-lg',
      className,
    ),

  /**
   * Dark mode wrapper for user messages
   */
  contentInner: (className?: string) => cn('group-[.is-user]:dark', className),

  /**
   * Message avatar container with role-based styling
   */
  avatar: (role?: MessageRole, className?: string) =>
    cn(
      'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full',
      'bg-primary text-primary-foreground text-xs font-medium',
      role === 'user' && 'bg-muted text-muted-foreground',
      role === 'assistant' && 'bg-primary text-primary-foreground',
      role === 'system' && 'bg-secondary text-secondary-foreground',
      role === 'tool' && 'bg-accent text-accent-foreground',
      className,
    ),

  /**
   * Avatar image styling
   */
  avatarImage: (className?: string) => cn('h-full w-full rounded-full object-cover', className),
};

// Message header classes
const messageHeaderClasses = {
  /**
   * Message header container
   */
  container: (className?: string) =>
    cn('flex items-center gap-2 text-xs text-muted-foreground mb-1', className),

  /**
   * Role label styling
   */
  roleLabel: (className?: string) => cn('font-medium', className),

  /**
   * Metadata container for model info, tokens, etc.
   */
  metadata: (className?: string) => cn('flex items-center gap-2', className),
};

// Response component classes (AI assistant messages)
export const responseClasses = {
  /**
   * Response message container
   */
  container: (className?: string) =>
    cn('group flex gap-3 p-4', 'border-b border-border last:border-b-0 is-assistant', className),

  /**
   * Response content area
   */
  content: (className?: string) =>
    cn('flex flex-col gap-2 text-sm text-foreground flex-1', className),

  /**
   * Response header with assistant info and timestamp
   */
  header: (className?: string) =>
    cn('flex items-center gap-2 text-xs text-muted-foreground mb-1', className),

  /**
   * Assistant name styling
   */
  assistantName: (className?: string) => cn('font-medium', className),

  /**
   * Response body content
   */
  body: (className?: string) => cn('text-sm text-foreground', className),

  /**
   * Streaming animation container
   */
  streamingContainer: (className?: string) => cn('inline-flex items-center gap-1 ml-1', className),

  /**
   * Streaming cursor animation
   */
  streamingCursor: (className?: string) =>
    cn('w-2 h-4 bg-primary animate-pulse inline-block', className),

  /**
   * ARIA live region for streaming content
   */
  liveRegion: (className?: string) => cn('sr-only', className),

  /**
   * Response avatar (assistant)
   */
  avatar: (className?: string) =>
    cn(
      'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full',
      'bg-primary text-primary-foreground text-xs font-medium',
      className,
    ),

  /**
   * Response avatar image
   */
  avatarImage: (className?: string) => cn('h-full w-full rounded-full object-cover', className),
};

// Message variant classes
const messageVariantClasses = {
  /**
   * Basic message styling
   */
  basic: (from: MessageRole, className?: string) => cn(messageClasses.container(from), className),

  /**
   * Compact message styling
   */
  compact: (from: MessageRole, className?: string) =>
    cn(messageClasses.container(from), 'p-2 gap-2', className),

  /**
   * Minimal message without borders
   */
  minimal: (from: MessageRole, className?: string) =>
    cn(messageClasses.container(from), 'border-b-0 p-2', className),
};

// Message status classes
const messageStatusClasses = {
  /**
   * Loading message state
   */
  loading: (className?: string) => cn('opacity-75 animate-pulse', className),

  /**
   * Error message state
   */
  error: (className?: string) => cn('border-l-4 border-l-destructive bg-destructive/10', className),

  /**
   * Success message state
   */
  success: (className?: string) => cn('border-l-4 border-l-green-500 bg-green-500/10', className),

  /**
   * Pending message state
   */
  pending: (className?: string) => cn('opacity-50', className),
};

// Export all message class utilities
export const allMessageClasses = {
  message: messageClasses,
  header: messageHeaderClasses,
  response: responseClasses,
  variants: messageVariantClasses,
  status: messageStatusClasses,
};
