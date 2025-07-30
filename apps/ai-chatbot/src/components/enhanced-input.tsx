'use client';

import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { Z_INDEX } from '#/lib/ui-constants';
import {
  useDebouncedValue,
  useDisclosure,
  useEventListener,
  useFocusReturn,
  useFocusWithin,
  useInputState,
  useListState,
  useLocalStorage,
  useTimeout,
  useValidatedState,
  useViewportSize,
} from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';

interface EnhancedInputBehaviorsProps {
  chatId: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  className?: string;
}

export function EnhancedInputBehaviors({
  chatId,
  value,
  onChange,
  onSubmit,
  className,
}: EnhancedInputBehaviorsProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { variants } = useAnimationSystem();
  const { height: viewportHeight, width: viewportWidth } = useViewportSize();
  const [isDraftSaved, { open: showDraftSaved, close: hideDraftSaved }] = useDisclosure();
  const [showDraftRecovery, { open: openDraftRecovery, close: closeDraftRecovery }] =
    useDisclosure();
  const [suggestions, suggestionsHandlers] = useListState<string>([]);

  // Enhanced focus management
  const { focused: isFocusWithin } = useFocusWithin();
  const returnFocus = useFocusReturn({ opened: showDraftRecovery, shouldReturnFocus: true });

  // Validated state for input with debouncing
  const [debouncedValue] = useDebouncedValue(value, 500);
  const [validatedValue, _setValidatedValue] = useValidatedState(value, val => val.length <= 2000);

  // Auto-save draft functionality
  const [draft, setDraft] = useLocalStorage<string>({
    key: `draft-${chatId}`,
    defaultValue: '',
  });

  // Smart placeholder that adapts to context
  const [smartPlaceholder, setSmartPlaceholder] = useInputState('Send a message...');

  // Auto-save timeout - triggered by debounced value
  const { start: startAutoSave, clear: clearAutoSave } = useTimeout(() => {
    if (debouncedValue.trim() && debouncedValue !== draft) {
      setDraft(debouncedValue);
      showDraftSaved();
      hideIndicatorTimeout.start();
    }
  }, 1000); // Reduced timeout since we're using debounced value

  // Timeout for hiding the draft saved indicator
  const hideIndicatorTimeout = useTimeout(() => hideDraftSaved(), 2000);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, viewportHeight * 0.4)}px`;
    }
  }, [viewportHeight]);

  // Smart placeholder updates
  useEffect(() => {
    const timeOfDay = new Date().getHours();
    if (timeOfDay < 12) {
      setSmartPlaceholder('Good morning! What can I help you with?');
    } else if (timeOfDay < 17) {
      setSmartPlaceholder('Good afternoon! How can I assist you?');
    } else {
      setSmartPlaceholder('Good evening! What would you like to know?');
    }
  }, [setSmartPlaceholder]);

  // Draft recovery on mount
  useEffect(() => {
    if (draft && !value && draft.trim().length > 10) {
      openDraftRecovery();
    }
  }, [draft, value, openDraftRecovery]);

  // Auto-save trigger using debounced value
  useEffect(() => {
    if (debouncedValue.trim()) {
      clearAutoSave();
      startAutoSave();
    }
  }, [debouncedValue, clearAutoSave, startAutoSave]);

  // Adjust height on value change (immediate, not debounced)
  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  // Smart suggestions based on input
  useEffect(() => {
    if (value.trim().length > 3) {
      const lastWord = value.split(' ').pop()?.toLowerCase() || '';
      const commonSuggestions = [
        'Can you help me with...',
        'What is the best way to...',
        'How do I...',
        'Please explain...',
        'Can you summarize...',
      ];

      const filteredSuggestions = commonSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(lastWord),
      );

      suggestionsHandlers.setState(filteredSuggestions.slice(0, 3));
    } else {
      suggestionsHandlers.setState([]);
    }
  }, [value, suggestionsHandlers]);

  const handleDraftRecover = () => {
    onChange(draft);
    closeDraftRecovery();
    returnFocus();
  };

  const handleDraftDiscard = () => {
    setDraft('');
    closeDraftRecovery();
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    suggestionsHandlers.setState([]);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Enhanced keyboard shortcuts
    if (event.key === 'Enter' && !event.shiftKey) {
      if (suggestions.length > 0) {
        // If suggestions are visible, use first suggestion
        event.preventDefault();
        handleSuggestionClick(suggestions[0]);
      } else if (value.trim()) {
        // Submit if there's content
        event.preventDefault();
        onSubmit?.();
      }
    }

    if (event.key === 'Escape') {
      suggestionsHandlers.setState([]);
      textareaRef.current?.blur();
    }

    // Tab for autocomplete
    if (event.key === 'Tab' && suggestions.length > 0) {
      event.preventDefault();
      handleSuggestionClick(suggestions[0]);
    }
  };

  // Global escape key handler using useEventListener
  useEventListener('keydown', event => {
    if (event.key === 'Escape' && isFocusWithin) {
      suggestionsHandlers.setState([]);
      textareaRef.current?.blur();
    }
  });

  return (
    <div ref={containerRef} className={cx('relative', className)}>
      {/* Draft Recovery Notification */}
      <AnimatePresence>
        {showDraftRecovery && (
          <motion.div
            variants={variants.slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cx(
              `absolute -top-16 left-0 right-0 z-[${Z_INDEX.POPOVER}]`,
              'flex items-center justify-between gap-3 p-3',
              'border border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20',
              'rounded-lg shadow-lg backdrop-blur-sm',
            )}
            data-testid="draft-recovery"
          >
            <div className="flex items-center gap-2">
              <motion.div variants={variants.pulseVariants} animate="pulse">
                <span className="text-blue-500">💾</span>
              </motion.div>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Found unsaved draft ({draft.length} characters)
              </span>
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={handleDraftRecover}
                variants={variants.hoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className={cx('px-3 py-1 text-xs font-medium', 'rounded-md bg-blue-500 text-white')}
              >
                Recover
              </motion.button>
              <motion.button
                onClick={handleDraftDiscard}
                variants={variants.hoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className={cx('px-3 py-1 text-xs font-medium', 'rounded-md bg-gray-500 text-white')}
              >
                Discard
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-save Indicator */}
      <AnimatePresence>
        {isDraftSaved && (
          <motion.div
            variants={variants.scaleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cx(
              `absolute -top-8 right-0 z-[${Z_INDEX.TOOLTIP}]`,
              'flex items-center gap-2 px-2 py-1',
              'border border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20',
              'rounded-md text-xs text-green-700 dark:text-green-300',
            )}
            data-testid="auto-save-indicator"
          >
            <span>✓</span>
            <span>Draft saved</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            variants={variants.slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cx(
              `absolute left-0 right-0 top-full z-[${Z_INDEX.DROPDOWN}] mt-2`,
              'rounded-lg border border-border bg-background shadow-lg',
              'overflow-hidden backdrop-blur-sm',
            )}
            data-testid="smart-suggestions"
          >
            <motion.div variants={variants.staggerContainerFast} initial="hidden" animate="visible">
              {suggestions.map((suggestion, _index) => (
                <motion.button
                  key={suggestion}
                  variants={variants.slideRightVariants}
                  onClick={() => handleSuggestionClick(suggestion)}
                  whileHover={{ backgroundColor: 'var(--muted)', x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cx(
                    'w-full px-4 py-3 text-left text-sm',
                    'border-b border-border last:border-b-0',
                    'focus:bg-muted/50 focus:outline-none',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">💡</span>
                    <span>{suggestion}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
            <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
              Press Tab to accept • Esc to dismiss
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={smartPlaceholder}
        className={cx(
          'w-full resize-none rounded-lg border border-border',
          'bg-background px-4 py-3 text-base',
          'transition-all duration-200 ease-out',
          'focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20',
          'placeholder:text-muted-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Responsive padding
          viewportWidth < 768 ? 'min-h-[80px]' : 'min-h-[60px]',
        )}
        data-testid="enhanced-textarea"
      />

      {/* Enhanced Input Validation Feedback */}
      <AnimatePresence>
        {!validatedValue.valid && value.length > 2000 && (
          <motion.div
            variants={variants.slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mt-2 text-sm text-red-600 dark:text-red-400"
          >
            Message too long (max 2000 characters)
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character count indicator */}
      <AnimatePresence>
        {value.length > 1500 && (
          <motion.div
            variants={variants.fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cx(
              'mt-1 text-right text-xs',
              value.length > 2000 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground',
            )}
          >
            {value.length}/2000 characters
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Focus Management Component
interface FocusManagerProps {
  children: React.ReactNode;
  onEscape?: () => void;
  onEnter?: () => void;
}

export function FocusManager({ children, onEscape, onEnter }: FocusManagerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape?.();
      }
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        onEnter?.();
      }
    };

    const element = ref.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, [onEscape, onEnter]);

  return <div ref={ref}>{children}</div>;
}

// Responsive Behavior Hook
export function useResponsiveBehavior() {
  const { width, height } = useViewportSize();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const inputHeight = isMobile ? Math.min(height * 0.3, 200) : Math.min(height * 0.4, 300);

  return {
    isMobile,
    isTablet,
    isDesktop,
    inputHeight,
    shouldShowAdvancedFeatures: isDesktop,
    shouldAutoFocus: isDesktop,
    maxVisibleSuggestions: isMobile ? 2 : 3,
  };
}
