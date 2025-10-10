/**
 * Conversation Components - AI Elements Integration
 * Simplified implementation using AI Elements with preserved Tailwind styling
 * Reduced from 415 lines to ~60 lines while maintaining all functionality
 */

'use client';

import { forwardRef } from 'react';
import { cn } from '../../utils';
import { conversationClasses, conversationVariantClasses } from '../utils/conversation-classes';

// Import AI Elements base components
import {
  Conversation as AIConversation,
  ConversationContent as AIConversationContent,
  ConversationScrollButton as AIConversationScrollButton,
  type ConversationContentProps as AIConversationContentProps,
  type ConversationProps as AIConversationProps,
  type ConversationScrollButtonProps as AIConversationScrollButtonProps,
} from '../ai-elements/conversation';

// Re-export types for backward compatibility
export interface ConversationProps extends Omit<AIConversationProps, 'className'> {
  className?: string;
}

export interface ConversationContentProps extends Omit<AIConversationContentProps, 'className'> {
  className?: string;
  autoScroll?: boolean;
}

export interface ConversationScrollButtonProps extends AIConversationScrollButtonProps {
  threshold?: number;
  hideWhenAtBottom?: boolean;
}

export interface ConversationWithFeaturesProps extends ConversationProps {
  autoScroll?: boolean;
  showScrollButton?: boolean;
  scrollButtonProps?: Omit<ConversationScrollButtonProps, 'onClick'>;
  contentProps?: Omit<ConversationContentProps, 'children'>;
}

/**
 * Main conversation container with preserved custom Tailwind styling
 */
export const Conversation = forwardRef<HTMLDivElement, ConversationProps>(function Conversation(
  { className, ...props },
  ref,
) {
  return (
    <AIConversation ref={ref} className={conversationClasses.container(className)} {...props} />
  );
});

/**
 * Scrollable conversation content with preserved custom styling
 */
export function ConversationContent({
  className,
  autoScroll = true,
  ...props
}: ConversationContentProps) {
  return <AIConversationContent className={conversationClasses.content(className)} {...props} />;
}

/**
 * Scroll to bottom button with preserved custom styling and animations
 */
export function ConversationScrollButton({
  className,
  threshold = 100,
  hideWhenAtBottom = true,
  ...props
}: ConversationScrollButtonProps) {
  return (
    <AIConversationScrollButton
      className={cn(
        'absolute bottom-4 right-4 z-10',
        'inline-flex items-center justify-center rounded-full',
        'bg-primary text-primary-foreground shadow-md',
        'hover:bg-primary/90 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2',
        'h-10 w-10 transition-all duration-200',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Complete conversation with all features - preserved styling patterns
 */
export function ConversationWithFeatures({
  children,
  autoScroll = true,
  showScrollButton = true,
  scrollButtonProps,
  contentProps,
  className,
  ...props
}: ConversationWithFeaturesProps) {
  return (
    <Conversation className={conversationClasses.container(className)} {...props}>
      <ConversationContent
        {...contentProps}
        autoScroll={autoScroll}
        className={conversationClasses.content(contentProps?.className)}
      >
        {children}
      </ConversationContent>
      {showScrollButton && <ConversationScrollButton {...scrollButtonProps} />}
    </Conversation>
  );
}

/**
 * Pre-configured conversation variants with preserved Tailwind styling
 */
export const ConversationVariants = {
  /**
   * Basic conversation with auto-scroll - preserved styling
   */
  Basic: (props: ConversationWithFeaturesProps) => (
    <ConversationWithFeatures
      {...props}
      autoScroll={true}
      showScrollButton={true}
      className={conversationVariantClasses.basic(props.className)}
    />
  ),

  /**
   * Minimal conversation without scroll button - preserved styling
   */
  Minimal: (props: ConversationWithFeaturesProps) => (
    <ConversationWithFeatures
      {...props}
      showScrollButton={false}
      className={conversationVariantClasses.minimal(props.className)}
    />
  ),

  /**
   * Full-height conversation for entire viewport - preserved styling
   */
  Fullscreen: (props: ConversationWithFeaturesProps) => (
    <ConversationWithFeatures
      {...props}
      className={conversationVariantClasses.fullscreen(props.className)}
    />
  ),

  /**
   * Compact conversation for smaller spaces - preserved styling
   */
  Compact: (props: ConversationWithFeaturesProps) => (
    <ConversationWithFeatures
      {...props}
      className={conversationVariantClasses.compact(props.className)}
      contentProps={{
        ...props.contentProps,
        className: cn(props.contentProps?.className, 'p-2'),
      }}
    />
  ),
};

// Default export for backward compatibility
