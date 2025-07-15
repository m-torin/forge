'use client';

import type { Attachment, ChatMessage, CustomUIDataTypes, MessageMetadata } from '#/lib/types';
import { APPLE_BREAKPOINTS, BACKDROP_STYLES, RESPONSIVE, Z_INDEX } from '#/lib/ui-constants';
import type { UseChatHelpers } from '@ai-sdk/react';
import { useLocalStorage, useToggle, useViewportSize } from '@mantine/hooks';
import { logError, logInfo } from '@repo/observability';
import cx from 'classnames';
import type React from 'react';
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { toast } from 'sonner';

import { EnhancedInputBehaviors } from '#/components/enhanced-input';
import { ArrowUpIcon, PaperclipIcon, StopIcon } from '#/components/icons';
import { MCPToolsPanel } from '#/components/mcp/mcp-tools';
import { PreviewAttachment } from '#/components/preview-attachment';
import { SuggestedActions } from '#/components/suggested-actions';
import { Button } from '#/components/ui/button';
import { Textarea } from '#/components/ui/textarea';
import type { VisibilityType } from '#/components/visibility-selector';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { useScrollToBottom } from '#/hooks/ui/use-scroll-to-bottom';
import { generateMockId } from '#/lib/mock-data';
import { isPrototypeMode } from '#/lib/prototype-mode';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, Keyboard, Mic, MicOff, Palette, Sparkles } from 'lucide-react';

/**
 * Pure multimodal input component for chat interface
 * @param chatId - Current chat identifier
 * @param input - Current input text
 * @param setInput - Function to update input text
 * @param status - Chat status (idle, loading, etc.)
 * @param stop - Function to stop current operation
 * @param attachments - Array of attached files
 * @param setAttachments - Function to update attachments
 * @param messages - Chat messages array
 * @param setMessages - Function to update messages
 * @param append - Function to append new message
 * @param className - Additional CSS classes
 * @param selectedVisibilityType - Chat visibility setting
 */
function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  className,
  selectedVisibilityType,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<MessageMetadata, CustomUIDataTypes>['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<ChatMessage>;
  setMessages: UseChatHelpers<MessageMetadata, CustomUIDataTypes>['setMessages'];
  append: UseChatHelpers<MessageMetadata, CustomUIDataTypes>['append'];
  className?: string;
  selectedVisibilityType: VisibilityType;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useViewportSize();

  // Initialize animation system for input performance optimization
  const { variants, performance, cleanup } = useAnimationSystem({
    enableHardwareAccel: true,
    respectReducedMotion: true,
  });

  // Throttled height adjustment for better performance
  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      performance.batchUpdates([
        () => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
          }
        },
      ]);
    }
  }, [performance]);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [adjustHeight]);

  const resetHeight = useCallback(() => {
    if (textareaRef.current) {
      performance.batchUpdates([
        () => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = '98px';
          }
        },
      ]);
    }
  }, [performance]);

  // Performance monitoring and cleanup
  useEffect(() => {
    performance.startMonitoring();
    return () => {
      performance.stopMonitoring();
      cleanup();
    };
  }, [performance, cleanup]);

  const [localStorageInput, setLocalStorageInput] = useLocalStorage({
    key: 'input',
    defaultValue: '',
  });

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  // Memoize input handler to prevent recreation on every render
  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);
      adjustHeight();
    },
    [setInput, adjustHeight],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  // Enhanced input features for prototype mode
  const prototypeMode = isPrototypeMode();
  const [isVoiceMode, toggleVoiceMode] = useToggle();
  const [isListening, toggleListening] = useToggle();
  const [inputMode, setInputMode] = useState<'text' | 'voice' | 'enhanced'>('text');
  const [theme, setTheme] = useState<'default' | 'creative' | 'professional'>('default');

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/chat/${chatId}`);

    append({
      role: 'user',
      parts: [
        ...attachments.map(attachment => ({
          type: 'file' as const,
          url: attachment.url,
          name: attachment.name,
          mediaType: attachment.contentType,
        })),
        {
          type: 'text',
          text: input,
        },
      ],
    });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();
    setInput('');

    // Only auto-focus on larger screens to avoid virtual keyboard issues on mobile
    if (width && width > APPLE_BREAKPOINTS.IPAD_MINI && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [
    input,
    setInput,
    attachments,
    append,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
    resetHeight,
  ]);

  const uploadFile = async (file: File) => {
    // Mock file upload in prototype mode
    if (isPrototypeMode()) {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Return mock file data
      return {
        url: `/mock-files/${generateMockId()}-${file.name}`,
        name: file.name,
        contentType: file.type,
      };
    }

    // Real file upload
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (_error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map(file => file.name));

      try {
        const uploadPromises = files.map(file => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          attachment => attachment !== undefined,
        );

        setAttachments(currentAttachments => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        logError('Error uploading files!', { error });
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  // Memoize enhanced functionality handlers to prevent recreation
  const handleVoiceToggle = useCallback(() => {
    if (!prototypeMode) return;

    toggleVoiceMode();
    if (!isVoiceMode) {
      // Start voice input simulation
      toggleListening();
      toast.success('Voice input activated (demo mode)');

      // Simulate voice recognition
      setTimeout(() => {
        setInput('This is a demo of voice input functionality');
        toggleListening();
        toggleVoiceMode();
      }, 3000);
    } else {
      toggleListening();
    }
  }, [prototypeMode, isVoiceMode, setInput, toggleVoiceMode, toggleListening]);

  const handleThemeChange = useCallback(() => {
    if (!prototypeMode) return;

    const themes: Array<'default' | 'creative' | 'professional'> = [
      'default',
      'creative',
      'professional',
    ];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    toast.success(`Switched to ${nextTheme} theme`);
  }, [prototypeMode, theme]);

  const handleInputModeChange = useCallback(() => {
    if (!prototypeMode) return;

    const modes: Array<'text' | 'voice' | 'enhanced'> = ['text', 'voice', 'enhanced'];
    const currentIndex = modes.indexOf(inputMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setInputMode(nextMode);
    toast.success(`Switched to ${nextMode} input mode`);
  }, [prototypeMode, inputMode]);

  return (
    <div className="group relative flex w-full flex-col gap-4">
      {/* Enhanced Features for Prototype Mode */}
      {prototypeMode && (
        <div className="absolute -top-8 left-0 z-10 flex items-center gap-2">
          <kbd className="rounded bg-muted/50 px-2 py-1 text-xs">Press / to focus</kbd>

          {/* Input Mode Indicator */}
          <div className="flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs text-primary">
            <span className="capitalize">{inputMode}</span>
            <span>Mode</span>
          </div>

          {/* Theme Indicator */}
          <div className="flex items-center gap-1 rounded bg-secondary/10 px-2 py-1 text-xs text-secondary-foreground">
            <Palette className="h-3 w-3" />
            <span className="capitalize">{theme}</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            variants={variants.scaleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: performance.isHighPerformanceDevice ? 300 : 250,
              damping: 20,
            }}
            className={`absolute bottom-28 left-1/2 z-[${Z_INDEX.NOTIFICATION}] -translate-x-1/2`}
            style={{
              willChange: 'transform, opacity',
            }}
          >
            <motion.div
              whileHover={variants.hoverVariants.hover}
              whileTap={variants.hoverVariants.tap}
            >
              <Button
                data-testid="scroll-to-bottom-button"
                className="group rounded-full shadow-lg"
                size="icon"
                variant="outline"
                onClick={event => {
                  event.preventDefault();
                  performance.batchUpdates([scrollToBottom]);
                }}
              >
                <motion.div
                  className="transition-transform duration-200"
                  animate={{
                    y: [0, 2, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <ArrowDown />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {messages.length === 0 && attachments.length === 0 && uploadQueue.length === 0 && (
        <SuggestedActions
          append={append}
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
        />
      )}

      <input
        type="file"
        className="pointer-events-none fixed -left-4 -top-4 size-0.5 opacity-0"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex flex-row items-end gap-2 overflow-x-scroll"
        >
          {attachments.map(attachment => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map(filename => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      {/* Voice Recognition Overlay */}
      {isListening && (
        <motion.div
          variants={variants.overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`absolute inset-0 z-[${Z_INDEX.MODAL_BACKDROP}] flex items-center justify-center ${BACKDROP_STYLES.LIGHT} rounded-2xl`}
          style={{
            willChange: 'opacity',
          }}
        >
          <motion.div
            className="space-y-4 text-center"
            variants={variants.modalVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500"
              variants={variants.pulseVariants}
              animate="pulse"
              style={{
                willChange: 'transform',
              }}
            >
              <Mic className="h-8 w-8 text-white" />
            </motion.div>
            <motion.div
              className="space-y-2"
              variants={variants.staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.p className="text-lg font-medium" variants={variants.slideUpVariants}>
                Listening...
              </motion.p>
              <motion.p
                className="text-sm text-muted-foreground"
                variants={variants.slideUpVariants}
              >
                Speak clearly into your microphone
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced Input or Regular Textarea */}
      {prototypeMode && inputMode === 'enhanced' ? (
        <EnhancedInputBehaviors
          chatId={chatId}
          value={input}
          onChange={setInput}
          onSubmit={submitForm}
          className="pb-10"
        />
      ) : (
        <Textarea
          data-testid="multimodal-input"
          ref={textareaRef}
          placeholder={
            isVoiceMode
              ? 'Voice mode active - Click mic to start...'
              : theme === 'creative'
                ? '✨ Express your creativity...'
                : theme === 'professional'
                  ? '📋 What can I help you accomplish?'
                  : 'Send a message...'
          }
          value={input}
          onChange={handleInput}
          className={cx(
            'max-h-[calc(75dvh)] min-h-[24px] resize-none overflow-hidden rounded-2xl bg-muted pb-10 !text-base dark:border-zinc-700',
            // Mobile optimized heights and touch targets
            'sm:max-h-[calc(60dvh)] md:max-h-[calc(50dvh)]',
            // Landscape orientation optimization
            'landscape-input',
            RESPONSIVE.TOUCH_TARGET.MEDIUM,
            'transition-all duration-200 ease-out',
            'focus:border-ring/40 focus:ring-2 focus:ring-ring/20',
            'hover:bg-muted/80',
            // Theme-based styling
            theme === 'creative' &&
              'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-700 dark:from-purple-950/20 dark:to-pink-950/20',
            theme === 'professional' &&
              'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-700 dark:from-blue-950/20 dark:to-indigo-950/20',
            className,
          )}
          rows={2}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();

              if (status !== 'ready') {
                toast.error('Please wait for the model to finish its response!');
              } else {
                submitForm();
              }
            }
          }}
        />
      )}

      <div className="absolute bottom-0 flex w-fit flex-row justify-start gap-2 p-2">
        <AttachmentsButton fileInputRef={fileInputRef} status={status} />

        {/* Enhanced Prototype Features */}
        {prototypeMode && (
          <>
            {/* Voice Input Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceToggle}
              className={cx(
                'h-fit rounded-md p-[7px] transition-all duration-200',
                RESPONSIVE.TOUCH_TARGET.SMALL,
                isVoiceMode || isListening
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                  : 'hover:scale-105 hover:bg-muted',
              )}
              disabled={status !== 'ready'}
              title="Voice input (demo)"
            >
              {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </Button>

            {/* Input Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleInputModeChange}
              className={cx(
                'h-fit rounded-md p-[7px] transition-all duration-200 hover:scale-105 hover:bg-muted',
                RESPONSIVE.TOUCH_TARGET.SMALL,
              )}
              title={`Current: ${inputMode} mode`}
            >
              {inputMode === 'enhanced' ? (
                <Sparkles className="size-4" />
              ) : (
                <Keyboard className="size-4" />
              )}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeChange}
              className={cx(
                'h-fit rounded-md p-[7px] transition-all duration-200 hover:scale-105',
                theme === 'creative' &&
                  'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
                theme === 'professional' &&
                  'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
                theme === 'default' && 'hover:bg-muted',
              )}
              title={`Theme: ${theme}`}
            >
              <Palette className="size-4" />
            </Button>
          </>
        )}

        <MCPToolsPanel
          onToolSelect={tool => {
            logInfo('Selected tool', { tool });
            // Tool selection logic will be implemented later
          }}
        />
      </div>

      <div className="absolute bottom-0 right-0 flex w-fit flex-row justify-end p-2">
        {status === 'submitted' ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton input={input} submitForm={submitForm} uploadQueue={uploadQueue} />
        )}
      </div>
    </div>
  );
}

/**
 * Memoized multimodal input component with comprehensive prop comparison
 */
export const MultimodalInput = memo(PureMultimodalInput, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.status !== nextProps.status) return false;
  if (!equal(prevProps.attachments, nextProps.attachments)) return false;
  if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) return false;
  if (prevProps.chatId !== nextProps.chatId) return false;
  if (prevProps.className !== nextProps.className) return false;
  // Check messages array length as lightweight comparison
  if (prevProps.messages?.length !== nextProps.messages?.length) return false;

  return true;
});

/**
 * Pure attachments button component
 * @param fileInputRef - Reference to file input element
 * @param status - Current chat status
 */
function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers<MessageMetadata, CustomUIDataTypes>['status'];
}) {
  const { variants } = useAnimationSystem();

  return (
    <motion.div
      whileHover={status === 'ready' ? variants.hoverVariants.hover : {}}
      whileTap={status === 'ready' ? variants.hoverVariants.tap : {}}
    >
      <Button
        data-testid="attachments-button"
        className={cx(
          'h-fit rounded-md rounded-bl-lg p-[7px] dark:border-zinc-700',
          'disabled:opacity-50',
          'group',
        )}
        onClick={event => {
          event.preventDefault();
          fileInputRef.current?.click();
        }}
        disabled={status !== 'ready'}
        variant="ghost"
      >
        <motion.div
          animate={status === 'ready' ? {} : { opacity: 0.5 }}
          whileHover={{ rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <PaperclipIcon size={14} />
        </motion.div>
      </Button>
    </motion.div>
  );
}

/**
 * Memoized attachments button
 */
const AttachmentsButton = memo(PureAttachmentsButton);

/**
 * Pure stop button component for halting chat streaming
 * @param stop - Function to stop current operation
 * @param setMessages - Function to update messages
 */
function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<MessageMetadata, CustomUIDataTypes>['setMessages'];
}) {
  const { variants, performance } = useAnimationSystem();

  return (
    <motion.div whileHover={variants.hoverVariants.hover} whileTap={variants.hoverVariants.tap}>
      <Button
        data-testid="stop-button"
        className={cx(
          'h-fit rounded-full border p-1.5 dark:border-zinc-600',
          RESPONSIVE.TOUCH_TARGET.SMALL,
          'group',
        )}
        onClick={event => {
          event.preventDefault();
          performance.batchUpdates([() => stop(), () => setMessages(messages => messages)]);
        }}
      >
        <motion.div
          className="transition-colors duration-200"
          whileHover={{
            color: 'rgb(239 68 68)', // text-red-500
            scale: 1.1,
          }}
          animate={{
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <StopIcon size={14} />
        </motion.div>
      </Button>
    </motion.div>
  );
}

/**
 * Memoized stop button
 */
const StopButton = memo(PureStopButton);

/**
 * Pure send button component with animation and disabled state
 * @param submitForm - Function to submit the form
 * @param input - Current input text
 * @param uploadQueue - Array of files being uploaded
 */
function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  const isDisabled = input.length === 0 || uploadQueue.length > 0;
  const { variants, performance } = useAnimationSystem();

  return (
    <motion.div
      whileHover={!isDisabled ? variants.hoverVariants.hover : {}}
      whileTap={!isDisabled ? variants.hoverVariants.tap : {}}
      animate={isDisabled ? { opacity: 0.5 } : { opacity: 1 }}
    >
      <Button
        data-testid="send-button"
        className={cx(
          'h-fit rounded-full border p-1.5 dark:border-zinc-600',
          RESPONSIVE.TOUCH_TARGET.SMALL,
          !isDisabled && 'group',
          isDisabled && 'cursor-not-allowed',
        )}
        onClick={event => {
          event.preventDefault();
          if (!isDisabled) {
            performance.batchUpdates([submitForm]);
          }
        }}
        disabled={isDisabled}
      >
        <motion.div
          animate={
            !isDisabled
              ? {
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          whileHover={
            !isDisabled
              ? {
                  color: 'rgb(59 130 246)', // text-blue-500
                  y: -2,
                }
              : {}
          }
        >
          <ArrowUpIcon size={14} />
        </motion.div>
      </Button>
    </motion.div>
  );
}

/**
 * Memoized send button with upload queue and input comparison
 */
const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length) return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
