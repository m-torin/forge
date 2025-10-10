/**
 * ChatForm Component
 * Eliminates the repeated form submission patterns from documentation examples
 */

'use client';

import type { UIMessage, UseChatHelpers } from '@ai-sdk/react';
import { logError } from '@repo/observability';
import React, { useRef, useState } from 'react';
import { cn } from '../../utils';

export interface ChatFormProps {
  /** The useChat hook result */
  chat: UseChatHelpers<UIMessage>;
  /** Enable file attachments */
  enableFiles?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Custom submit button text */
  submitText?: string;
  /** Additional CSS classes */
  className?: {
    form?: string;
    validationError?: string;
    fileInput?: string;
    inputContainer?: string;
    input?: string;
    button?: string;
    filePreview?: string;
  };
  /** Custom form validation */
  validate?: (input: string, files?: FileList | null) => string | null;
  /** Called before message is sent - return false to prevent sending */
  onBeforeSend?: (message: { text: string; files?: FileList | null }) => boolean;
  /** Called after message is sent */
  onAfterSend?: (message: { text: string; files?: FileList | null }) => void;
  /** Custom input component */
  InputComponent?: React.ComponentType<{
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    placeholder: string;
    onKeyDown?: (e: React.KeyboardEvent) => void;
  }>;
}

/**
 * Handles the repetitive form submission pattern from docs:
 * ```
 * <form onSubmit={e => {
 *   e.preventDefault();
 *   if (input.trim()) {
 *     sendMessage({ text: input });
 *     setInput('');
 *   }
 * }}>
 * ```
 */
export function ChatForm({
  chat,
  enableFiles = false,
  placeholder = 'Say something...',
  submitText = 'Submit',
  className = {},
  validate,
  onBeforeSend,
  onAfterSend,
  InputComponent,
}: ChatFormProps) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDisabled = chat.status !== 'ready';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationError(null);

    // Basic validation
    if (!input.trim()) {
      setValidationError('Message cannot be empty');
      return;
    }

    // Custom validation
    if (validate) {
      const error = validate(input, files);
      if (error) {
        setValidationError(error);
        return;
      }
    }

    const messageData = { text: input.trim(), files: files || undefined };

    // Pre-send hook
    if (onBeforeSend && !onBeforeSend(messageData)) {
      return;
    }

    // Send the message using AI SDK v5 sendMessage method
    try {
      (chat as any).sendMessage({
        text: messageData.text,
      });

      // Clear form
      setInput('');
      setFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Post-send hook
      onAfterSend?.(messageData);
    } catch (error) {
      logError('[ChatForm] Failed to send message', error as Error);
      setValidationError('Failed to send message. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isDisabled) {
      handleSubmit(e as any);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    setValidationError(null); // Clear validation on file change
  };

  return (
    <form onSubmit={handleSubmit} className={cn(className.form)} data-testid="chat-form">
      {/* Validation error display */}
      {validationError && (
        <div
          className={cn('mb-2 text-sm text-red-500', className.validationError)}
          data-testid="validation-error"
        >
          {validationError}
        </div>
      )}

      {/* File input (if enabled) */}
      {enableFiles && (
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          multiple
          disabled={isDisabled}
          className={cn(className.fileInput)}
          data-testid="file-input"
        />
      )}

      {/* Text input */}
      <div className={cn('flex gap-2', className.inputContainer)}>
        {InputComponent ? (
          <InputComponent
            value={input}
            onChange={setInput}
            disabled={isDisabled}
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            placeholder={placeholder}
            className={cn('flex-1', className.input)}
            data-testid="message-input"
          />
        )}

        <button
          type="submit"
          disabled={isDisabled || !input.trim()}
          className={cn(className.button)}
          data-testid="submit-button"
        >
          {submitText}
        </button>
      </div>

      {/* File preview (if files selected) */}
      {files && files.length > 0 && (
        <div className={cn('mt-2 text-sm text-gray-600', className.filePreview)}>
          {files.length} file{files.length > 1 ? 's' : ''} selected:{' '}
          {Array.from(files)
            .map(f => f.name)
            .join(', ')}
        </div>
      )}
    </form>
  );
}

/**
 * Pre-configured ChatForm variants for common use cases
 */
export const ChatFormVariants = {
  /**
   * Basic variant - matches the documentation examples exactly
   */
  Basic: (props: Omit<ChatFormProps, 'enableFiles'>) => <ChatForm {...props} enableFiles={false} />,

  /**
   * With file support - includes file attachments
   */
  WithFiles: (props: ChatFormProps) => <ChatForm {...props} enableFiles={true} />,

  /**
   * Minimal variant - clean, minimal styling
   */
  Minimal: (props: ChatFormProps) => (
    <ChatForm
      {...props}
      submitText="Send"
      className={{
        form: 'minimal-chat-form',
        input: 'minimal-input',
        button: 'minimal-button',
        ...props.className,
      }}
    />
  ),
};

// Default export for convenience
