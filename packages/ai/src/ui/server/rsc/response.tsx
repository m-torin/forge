/**
 * Response Component - AI Elements Integration (Server)
 * Server-optimized response display components for static rendering
 *
 * @example
 * ```tsx
 * <Response variant="streaming">
 *   AI is thinking...
 * </Response>
 *
 * <ResponseWithMetadata
 *   showMetadata={true}
 *   metadata={{ tokens: 150, model: "gpt-4o", duration: 1200 }}
 * >
 *   Generated response text
 * </ResponseWithMetadata>
 * ```
 */

import React from 'react';
import { cn, formatNumber } from '../../utils';

/**
 * Props for the basic response component
 */
export interface ResponseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Response content */
  children: React.ReactNode;
  /** Visual variant for different response states */
  variant?: 'default' | 'streaming' | 'error' | 'success';
}

/**
 * Props for streaming response with cursor indicator
 */
export interface StreamingResponseProps extends ResponseProps {
  /** Whether the response is complete */
  isComplete?: boolean;
  /** Whether to show the typing cursor */
  showCursor?: boolean;
}

/**
 * Props for code block responses
 */
export interface CodeResponseProps extends ResponseProps {
  /** Programming language for syntax highlighting */
  language?: string;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
}

/**
 * Basic response display optimized for server rendering
 */
export function Response({ children, variant = 'default', className, ...props }: ResponseProps) {
  return (
    <div
      className={cn(
        'whitespace-pre-wrap text-sm leading-relaxed',
        'text-foreground',
        variant === 'streaming' && 'animate-pulse',
        variant === 'error' && 'text-destructive',
        variant === 'success' && 'text-green-600 dark:text-green-400',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Response with streaming indicator (server-rendered)
 */
export function StreamingResponse({
  children,
  isComplete = false,
  showCursor = true,
  className,
  ...props
}: StreamingResponseProps) {
  return (
    <Response
      className={cn(
        !isComplete &&
          'after:ml-1 after:inline-block after:h-4 after:w-2 after:bg-current after:content-[""]',
        !isComplete && showCursor && 'after:animate-pulse',
        className,
      )}
      variant={isComplete ? 'default' : 'streaming'}
      {...props}
    >
      {children}
    </Response>
  );
}

/**
 * Code block response with syntax highlighting placeholders
 */
export function CodeResponse({
  children,
  language,
  showLineNumbers = false,
  className,
  ...props
}: CodeResponseProps) {
  return (
    <div
      className={cn('bg-muted rounded-md border p-4 text-sm', 'font-mono', className)}
      {...props}
    >
      {language && (
        <div className="text-muted-foreground mb-2 text-xs uppercase tracking-wide">{language}</div>
      )}
      <pre className={cn('overflow-x-auto', showLineNumbers && 'counter-reset-line')}>
        <code className="language-{language}">{children}</code>
      </pre>
    </div>
  );
}

/**
 * Response with metadata (server-rendered)
 */
export interface ResponseWithMetadataProps extends ResponseProps {
  metadata?: {
    tokens?: number;
    model?: string;
    timestamp?: string | Date;
    duration?: number;
  };
  showMetadata?: boolean;
}

export function ResponseWithMetadata({
  children,
  metadata,
  showMetadata = false,
  className,
  ...props
}: ResponseWithMetadataProps) {
  const displayTimestamp = metadata?.timestamp
    ? typeof metadata.timestamp === 'string'
      ? metadata.timestamp
      : metadata.timestamp.toLocaleString()
    : null;

  return (
    <div>
      <Response className={className} {...props}>
        {children}
      </Response>
      {showMetadata && metadata && (
        <div className="text-muted-foreground mt-2 space-y-1 text-xs">
          {metadata.tokens && <div>Tokens: {formatNumber(metadata.tokens)}</div>}
          {metadata.model && <div>Model: {metadata.model}</div>}
          {displayTimestamp && <div>Generated: {displayTimestamp}</div>}
          {metadata.duration && <div>Duration: {metadata.duration}ms</div>}
        </div>
      )}
    </div>
  );
}

/**
 * Pre-configured response variants
 */
export const ResponseVariants = {
  /**
   * Plain text response
   */
  Text: (props: ResponseProps) => <Response {...props} />,

  /**
   * Markdown-style response with basic formatting
   */
  Markdown: ({ children, className, ...props }: ResponseProps) => (
    <Response
      {...props}
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:font-semibold prose-headings:text-foreground',
        'prose-p:text-foreground prose-strong:text-foreground',
        'prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded',
        className,
      )}
    >
      {children}
    </Response>
  ),

  /**
   * Code block response
   */
  Code: (props: CodeResponseProps) => <CodeResponse {...props} />,

  /**
   * Loading response with skeleton
   */
  Loading: ({ className }: ResponseProps) => (
    <div className={cn('space-y-2', className)}>
      <div className="bg-muted h-4 animate-pulse rounded" />
      <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
      <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
    </div>
  ),

  /**
   * Error response
   */
  Error: ({ children, className, ...props }: ResponseProps) => (
    <div className={cn('border-destructive/20 bg-destructive/5 rounded-md border p-4', className)}>
      <Response variant="error" {...props}>
        {children || 'An error occurred while generating the response.'}
      </Response>
    </div>
  ),
};

// Default export
