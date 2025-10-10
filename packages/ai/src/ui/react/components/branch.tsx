/**
 * Branch Components - AI Elements Integration
 * Manages multiple versions of AI messages with context-based navigation
 *
 * @example
 * ```tsx
 * <Branch>
 *   <BranchMessages>
 *     {messages.map(message => <Message key={message.id} {...message} />)}
 *   </BranchMessages>
 *   <BranchSelector from="assistant">
 *     <BranchPrevious />
 *     <BranchPage />
 *     <BranchNext />
 *   </BranchSelector>
 * </Branch>
 * ```
 */

'use client';

import React from 'react';
import { cn } from '../../utils';
import { useBranchNavigation } from '../lib';

/**
 * Props for the main Branch container
 */
export interface BranchProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Props for BranchMessages container
 */
export interface BranchMessagesProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Props for BranchSelector container
 */
export interface BranchSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Aligns selector for different message types */
  from?: 'user' | 'assistant' | 'system';
  children: React.ReactNode;
}

/**
 * Props for navigation buttons
 */
export interface BranchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

/**
 * Props for branch page indicator
 */
export interface BranchPageProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Custom format function for page display */
  format?: (current: number, total: number) => string;
}

/**
 * Main Branch container component
 */
export function Branch({ className, children, ...props }: BranchProps) {
  return (
    <div className={cn('relative', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Container for branch messages with CSS-based visibility switching
 */
export function BranchMessages({ className, children, ...props }: BranchMessagesProps) {
  const { currentBranch, totalBranches } = useBranchNavigation();

  return (
    <div className={cn('relative', className)} {...props}>
      {/* Render all branches but show only current one via CSS */}
      {Array.from({ length: totalBranches }, (_, index) => (
        <div key={index} className={cn('w-full', index === currentBranch ? 'block' : 'hidden')}>
          {/* Children are expected to be branch-aware */}
          {children}
        </div>
      ))}
    </div>
  );
}

/**
 * Navigation selector for branch controls
 */
export function BranchSelector({
  from = 'assistant',
  className,
  children,
  ...props
}: BranchSelectorProps) {
  return (
    <div
      className={cn(
        'mt-2 flex items-center gap-2',
        from === 'user' && 'justify-end',
        from === 'assistant' && 'justify-start',
        from === 'system' && 'justify-center',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Previous branch navigation button
 */
export function BranchPrevious({ className, children, disabled, ...props }: BranchButtonProps) {
  const { canGoPrevious, goPrevious } = useBranchNavigation();

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
      onClick={goPrevious}
      disabled={disabled || !canGoPrevious}
      aria-label="Previous branch"
      {...props}
    >
      {children || (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      )}
    </button>
  );
}

/**
 * Next branch navigation button
 */
export function BranchNext({ className, children, disabled, ...props }: BranchButtonProps) {
  const { canGoNext, goNext } = useBranchNavigation();

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
      onClick={goNext}
      disabled={disabled || !canGoNext}
      aria-label="Next branch"
      {...props}
    >
      {children || (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}

/**
 * Branch page indicator showing current position
 */
export function BranchPage({ className, format, ...props }: BranchPageProps) {
  const { currentBranch, totalBranches } = useBranchNavigation();

  const defaultFormat = (current: number, total: number) => `${current + 1} of ${total}`;
  const displayText = format
    ? format(currentBranch, totalBranches)
    : defaultFormat(currentBranch, totalBranches);

  return (
    <span
      className={cn(
        'text-muted-foreground text-sm font-medium',
        'min-w-[60px] text-center',
        className,
      )}
      {...props}
    >
      {displayText}
    </span>
  );
}

/**
 * Pre-configured branch variants
 */
export const BranchVariants = {
  /**
   * Basic branch with standard navigation
   */
  Basic: ({ children, className, ...props }: BranchProps) => (
    <Branch className={cn(className)} {...props}>
      {children}
    </Branch>
  ),

  /**
   * Minimal branch with compact navigation
   */
  Minimal: ({ children, className, ...props }: BranchProps) => (
    <Branch className={cn('space-y-1', className)} {...props}>
      {children}
    </Branch>
  ),

  /**
   * Complete branch with messages and navigation
   */
  Complete: ({
    children,
    className,
    from = 'assistant',
    ...props
  }: BranchProps & { from?: 'user' | 'assistant' | 'system' }) => (
    <Branch className={cn(className)} {...props}>
      <BranchMessages>{children}</BranchMessages>
      <BranchSelector from={from}>
        <BranchPrevious />
        <BranchPage />
        <BranchNext />
      </BranchSelector>
    </Branch>
  ),
};

// Default export
