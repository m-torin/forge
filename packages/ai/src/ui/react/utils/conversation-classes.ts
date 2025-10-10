/**
 * Conversation Tailwind Class Utilities
 * Extracted from conversation.tsx to preserve all custom styling while using AI Elements
 */

import { cn } from '../../utils';

// Main conversation container classes
export const conversationClasses = {
  /**
   * Main conversation container with background, border, and layout
   */
  container: (className?: string) =>
    cn('flex flex-col h-full relative', 'bg-background border border-border rounded-lg', className),

  /**
   * Scrollable conversation content area
   */
  content: (className?: string) =>
    cn('flex-1 overflow-y-auto overflow-x-hidden', 'scroll-smooth', className),

  /**
   * Inner content container with flex layout
   */
  contentInner: (className?: string) => cn('min-h-full flex flex-col', className),

  /**
   * Scroll to bottom button with positioning and animations
   */
  scrollButton: (isAtBottom: boolean, className?: string) =>
    cn(
      'absolute bottom-4 right-4 z-10',
      'inline-flex items-center justify-center rounded-full',
      'bg-primary text-primary-foreground shadow-md',
      'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'h-10 w-10',
      'transition-all duration-200',
      isAtBottom ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100',
      className,
    ),

  /**
   * Loading spinner animation for scroll button
   */
  scrollButtonSpinner: (className?: string) =>
    cn('w-2 h-2 bg-current rounded-full animate-bounce', className),
};

// Conversation variant classes
export const conversationVariantClasses = {
  /**
   * Basic conversation with standard styling
   */
  basic: (className?: string) => cn(conversationClasses.container(), className),

  /**
   * Minimal conversation without borders/background
   */
  minimal: (className?: string) =>
    cn(conversationClasses.container(), 'border-0 bg-transparent', className),

  /**
   * Fullscreen conversation for entire viewport
   */
  fullscreen: (className?: string) =>
    cn(conversationClasses.container(), 'h-screen max-h-screen', className),

  /**
   * Compact conversation for smaller spaces
   */
  compact: (className?: string) => cn(conversationClasses.container(), 'h-96 max-h-96', className),
};

// Conversation feature-specific classes
const conversationFeatureClasses = {
  /**
   * Demo conversation container classes
   */
  demoContainer: (height: string, className?: string) =>
    cn('demo-conversation-container', className),

  /**
   * Error state container within conversation
   */
  errorContainer: (className?: string) =>
    cn('bg-destructive/10 border border-destructive/20 rounded-lg p-4', className),

  /**
   * Error icon and header
   */
  errorHeader: (className?: string) =>
    cn('flex items-center gap-2 text-destructive mb-2', className),

  /**
   * Error message text
   */
  errorMessage: (className?: string) => cn('text-sm text-muted-foreground mb-3', className),

  /**
   * Error action buttons container
   */
  errorActions: (className?: string) => cn('flex gap-2', className),

  /**
   * Primary error action button (retry)
   */
  errorActionPrimary: (className?: string) =>
    cn(
      'text-xs px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90',
      className,
    ),

  /**
   * Secondary error action button (refresh)
   */
  errorActionSecondary: (className?: string) =>
    cn(
      'text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80',
      className,
    ),

  /**
   * Status indicators container at bottom
   */
  statusContainer: (className?: string) =>
    cn('flex items-center justify-between mt-2 text-xs text-muted-foreground', className),

  /**
   * Loading status with animated dots
   */
  loadingStatus: (className?: string) => cn('flex items-center gap-1', className),

  /**
   * Animated loading dots
   */
  loadingDot: (delay: string, className?: string) =>
    cn('w-2 h-2 bg-current rounded-full animate-bounce', delay, className),
};

// Conversation spacing and layout classes
export const conversationLayoutClasses = {
  /**
   * Message spacing container
   */
  messagesContainer: (className?: string) => cn('space-y-4 p-4', className),

  /**
   * Empty state container
   */
  emptyState: (className?: string) => cn('text-center text-muted-foreground py-8', className),

  /**
   * Input form container at bottom
   */
  inputContainer: (className?: string) => cn('border-t bg-background p-4', className),

  /**
   * Input form flex layout
   */
  inputForm: (className?: string) => cn('flex gap-2', className),

  /**
   * Textarea flex layout
   */
  inputTextarea: (className?: string) => cn('flex-1', className),
};

// Export all class utilities
export const allConversationClasses = {
  ...conversationClasses,
  variants: conversationVariantClasses,
  features: conversationFeatureClasses,
  layout: conversationLayoutClasses,
};
