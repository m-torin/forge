/**
 * PromptInput Components - AI Elements Integration
 * Interactive form inputs for AI chat interfaces with auto-resize and state management
 * Now integrated with AiChat context for centralized state
 *
 * @example
 * ```tsx
 * <PromptInputForm
 *   onSubmit={handleSubmit}
 *   placeholder="Type your message..."
 * />
 * ```
 */

'use client';

import { logError, logWarn } from '@repo/observability';
import React, { useRef } from 'react';
import { cn } from '../../utils';
import { useAiInput } from '../lib';

/**
 * Props for the input form container - React 19 compatible
 */
export interface InputProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** Form content (textarea and submit button) */
  children: React.ReactNode;
  /** Optional className override for the form wrapper */
  className?: string;
  /** React 19 enhanced form attributes */
  'data-testid'?: string;
  'data-form-type'?: 'prompt' | 'chat' | 'search';
}

/**
 * Props for the auto-expanding textarea (context-aware) - React 19 compatible
 */
export interface PromptInputTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Current textarea value (optional - uses context if not provided) */
  value?: string;
  /** Value change handler (optional - uses context if not provided) */
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** React 19 enhanced textarea attributes */
  'data-testid'?: string;
  'aria-expanded'?: boolean;
  spellcheck?: boolean | 'true' | 'false';
}

/**
 * Props for the submit button with loading states (context-aware) - React 19 compatible
 */
export interface PromptInputSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Current submission status (optional - uses context if not provided) */
  status?: 'ready' | 'streaming' | 'loading';
  /** Button content (defaults to send icon) */
  children?: React.ReactNode;
  /** React 19 enhanced button attributes */
  'data-testid'?: string;
  'aria-busy'?: boolean;
}

/**
 * Form container for prompt input
 */
export function Input({ className, children, ...props }: InputProps) {
  return (
    <form
      className={cn(
        'border-border bg-background relative flex items-end gap-2 rounded-lg border p-4',
        'focus-within:ring-ring focus-within:ring-2 focus-within:ring-offset-2',
        className,
      )}
      {...props}
    >
      {children}
    </form>
  );
}

/**
 * Auto-expanding textarea for prompt input with context integration
 */
export function PromptInputTextarea({
  className,
  value: propValue,
  onChange: propOnChange,
  placeholder = 'Type your message...',
  ...props
}: PromptInputTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { inputValue, setInputValue } = useAiInput();

  // Use context value if no prop value provided
  const value = propValue !== undefined ? propValue : inputValue;
  const onChange =
    propOnChange || ((e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value));

  // Auto-resize functionality with error handling
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const textarea = event.target;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
      onChange(event);
    } catch (error) {
      logWarn('Error in textarea auto-resize', { error });
      onChange(event); // Still call onChange even if resize fails
    }
  };

  return (
    <textarea
      ref={textareaRef}
      className={cn(
        'placeholder:text-muted-foreground flex-1 resize-none border-0 bg-transparent p-0 text-sm',
        'focus:outline-none focus:ring-0',
        'max-h-[200px] min-h-[44px]',
        className,
      )}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      rows={1}
      {...props}
    />
  );
}

/**
 * Submit button with loading states and context integration
 */
export function PromptInputSubmit({
  status: propStatus,
  className,
  children,
  disabled,
  'data-testid': testId,
  'aria-busy': ariaBusy,
  ...props
}: PromptInputSubmitProps) {
  const { streamingStatus, canSubmit } = useAiInput();

  // Use context status if no prop status provided
  const status = propStatus || streamingStatus;
  const isLoading = status === 'streaming' || status === 'loading';
  const shouldDisable = disabled !== undefined ? disabled : !canSubmit;
  const isBusy = ariaBusy !== undefined ? ariaBusy : isLoading;

  return (
    <button
      type="submit"
      className={cn(
        'ring-offset-background inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'h-11 px-8',
        className,
      )}
      disabled={shouldDisable || isLoading}
      aria-busy={isBusy}
      data-testid={testId}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Stop
        </>
      ) : (
        children || (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        )
      )}
    </button>
  );
}

/**
 * Complete prompt input with form handling and context integration
 */
export interface PromptInputFormProps {
  /** Submit handler for form submission */
  onSubmit: (value: string) => void;
  /** Optional placeholder text */
  placeholder?: string;
  /** Optional status override */
  status?: 'ready' | 'streaming' | 'loading';
  /** Optional className overrides */
  className?: {
    container?: string;
    textarea?: string;
    submit?: string;
  };
  /** Optional submit button text */
  submitText?: string;
  /** Optional value override (uses context if not provided) */
  value?: string;
  /** Optional onChange override (uses context if not provided) */
  onChange?: (value: string) => void;
}

export function PromptInputForm({
  onSubmit,
  placeholder,
  status,
  className = {},
  submitText = 'Send',
  value: propValue,
  onChange: propOnChange,
}: PromptInputFormProps) {
  const { inputValue, setInputValue, canSubmit } = useAiInput();

  // Use context values if no props provided
  const value = propValue !== undefined ? propValue : inputValue;
  const onChange = propOnChange || setInputValue;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const trimmedValue = value.trim();
      if (trimmedValue && canSubmit) {
        onSubmit(trimmedValue);
      }
    } catch (error) {
      logError('Error submitting prompt', error as Error);
    }
  };

  return (
    <Input className={className.container} onSubmit={handleSubmit}>
      <PromptInputTextarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={className.textarea}
      />
      <PromptInputSubmit status={status} className={className.submit}>
        {submitText}
      </PromptInputSubmit>
    </Input>
  );
}

/**
 * Pre-configured prompt input variants
 */
export const PromptInputVariants = {
  /**
   * Basic chat input
   */
  Basic: (props: PromptInputFormProps) => (
    <PromptInputForm {...props} placeholder="Type your message..." submitText="Send" />
  ),

  /**
   * Minimal input without borders
   */
  Minimal: (props: PromptInputFormProps) => (
    <PromptInputForm
      {...props}
      className={{
        container: cn(props.className?.container, 'border-0 bg-transparent p-2'),
        ...props.className,
      }}
      placeholder="Message..."
      submitText="→"
    />
  ),

  /**
   * Large input for longer prompts
   */
  Large: (props: PromptInputFormProps) => (
    <PromptInputForm
      {...props}
      className={{
        container: cn(props.className?.container, 'p-6'),
        textarea: cn(props.className?.textarea, 'min-h-[60px] text-base'),
        submit: cn(props.className?.submit, 'h-12 px-6'),
        ...props.className,
      }}
      placeholder="Enter your prompt..."
      submitText="Generate"
    />
  ),
};

// Default exports
