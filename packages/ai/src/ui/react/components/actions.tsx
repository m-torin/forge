/**
 * Actions Component - AI Elements Integration
 * Interactive action buttons for AI responses (retry, like, dislike, copy, share)
 * Now integrated with AiChat context for state management
 *
 * @example
 * ```tsx
 * <Actions>
 *   <Action onClick={() => regenerate()} label="Retry">
 *     <RefreshIcon />
 *   </Action>
 *   <ActionVariants.Copy messageId="msg-1" text="Content to copy" />
 * </Actions>
 * ```
 */

'use client';

import React, { memo, useCallback } from 'react';
import { cn, shareContent } from '../../utils';
import { useMessageActions } from '../lib';

/**
 * Props for individual action buttons
 */
export interface ActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Tooltip text shown on hover */
  tooltip?: string;
  /** Accessible label for screen readers (also used as fallback tooltip) */
  label?: string;
  /** Button content (usually an icon) */
  children: React.ReactNode;
}

/**
 * Props for the actions container
 */
export interface ActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Action buttons to display */
  children: React.ReactNode;
}

/**
 * Individual action button with tooltip and accessibility support - Memoized for React 19 performance
 */
export const Action = memo<ActionProps>(function Action({
  tooltip,
  label,
  className,
  children,
  ...props
}) {
  const ariaLabel = label || tooltip;

  return (
    <button
      className={cn(
        'ring-offset-background inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'hover:bg-accent hover:text-accent-foreground',
        'h-8 w-8',
        className,
      )}
      aria-label={ariaLabel}
      title={tooltip}
      {...props}
    >
      {children}
    </button>
  );
});

/**
 * Actions container with hover-to-show behavior
 */
export function Actions({ className, children, ...props }: ActionsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1',
        'opacity-0 transition-opacity group-hover:opacity-100',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Context-aware action variants that use shared state
 */
export const ActionVariants = {
  /**
   * Copy text action with context integration
   */
  Copy: ({ messageId, text, ...props }: ActionProps & { messageId: string; text: string }) => {
    const { copyMessage, isCopied } = useMessageActions();

    const handleCopy = useCallback(() => {
      copyMessage(messageId, text);
    }, [copyMessage, messageId, text]);

    return (
      <Action
        {...props}
        label={isCopied(messageId) ? 'Copied!' : 'Copy'}
        className={cn(props.className, isCopied(messageId) && 'text-green-600')}
        onClick={handleCopy}
      >
        {isCopied(messageId) ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </Action>
    );
  },

  /**
   * Retry/regenerate action (no context needed)
   */
  Retry: (props: ActionProps) => (
    <Action {...props} label="Retry">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </Action>
  ),

  /**
   * Like action with context state management
   */
  Like: ({ messageId, ...props }: ActionProps & { messageId: string }) => {
    const { isLiked, toggleLike } = useMessageActions();
    const liked = isLiked(messageId);

    const handleLike = useCallback(() => {
      toggleLike(messageId);
    }, [toggleLike, messageId]);

    return (
      <Action
        {...props}
        label={liked ? 'Unlike' : 'Like'}
        className={cn(props.className, liked && 'text-red-500')}
        onClick={handleLike}
      >
        <svg
          className="h-4 w-4"
          fill={liked ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </Action>
    );
  },

  /**
   * Share action with Web Share API fallback
   */
  Share: ({
    text,
    url,
    title,
    ...props
  }: ActionProps & { text?: string; url?: string; title?: string }) => {
    const handleShare = useCallback(() => {
      shareContent({ text, url, title });
    }, [text, url, title]);

    return (
      <Action {...props} label="Share" onClick={handleShare}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
      </Action>
    );
  },
};

// Default export for convenience
