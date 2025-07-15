'use client';

import { BACKDROP_STYLES, Z_INDEX } from '#/lib/ui-constants';
import {
  useDisclosure,
  useEventListener,
  useFocusReturn,
  useHotkeys,
  useFocusTrap as useMantineFocusTrap,
  useMergedRef,
} from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  Command,
  X as Escape,
  MessageSquare,
  Plus,
  Search,
  Sidebar,
  Slash,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Keyboard shortcut types
 */
interface KeyboardShortcut {
  key: string;
  label: string;
  description: string;
  action: () => void;
  icon?: React.ComponentType<{ size?: number }>;
  category: 'navigation' | 'chat' | 'editing' | 'system';
}

/**
 * Keyboard shortcuts context
 */
interface KeyboardNavigationContextType {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string) => void;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

const KeyboardNavigationContext = React.createContext<KeyboardNavigationContextType | null>(null);

/**
 * Hook to access keyboard navigation context
 * @returns Keyboard navigation context methods and state
 */
export function useKeyboardNavigation() {
  const context = React.useContext(KeyboardNavigationContext);
  if (!context) {
    throw new Error('useKeyboardNavigation must be used within KeyboardNavigationProvider');
  }
  return context;
}

// Provider component
export function KeyboardNavigationProvider({ children }: { children: React.ReactNode }) {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [showHelp, { open: _openHelp, close: _closeHelp, toggle: toggleHelp }] = useDisclosure();

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => [...prev.filter(s => s.key !== shortcut.key), shortcut]);
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key));
  }, []);

  return (
    <KeyboardNavigationContext.Provider
      value={{ shortcuts, registerShortcut, unregisterShortcut, showHelp, setShowHelp: toggleHelp }}
    >
      {children}
      <KeyboardShortcutsHelp />
    </KeyboardNavigationContext.Provider>
  );
}

// Global keyboard shortcuts hook
export function useGlobalKeyboardShortcuts() {
  const router = useRouter();
  const { registerShortcut, setShowHelp } = useKeyboardNavigation();

  // Register global shortcuts
  useEffect(() => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'cmd+k',
        label: '⌘ K',
        description: 'New chat',
        action: () => {
          router.push('/');
          toast.success('Starting new chat...');
        },
        icon: Plus,
        category: 'chat',
      },
      {
        key: 'cmd+/',
        label: '⌘ /',
        description: 'Toggle sidebar',
        action: () => {
          (document.querySelector('[data-testid="sidebar-toggle-button"]') as HTMLElement)?.click();
        },
        icon: Sidebar,
        category: 'navigation',
      },
      {
        key: 'cmd+shift+/',
        label: '⌘ ⇧ /',
        description: 'Show keyboard shortcuts',
        action: () => setShowHelp(true),
        icon: Command,
        category: 'system',
      },
      {
        key: '/',
        label: '/',
        description: 'Focus search input',
        action: () => {
          const input = document.querySelector(
            '[data-testid="multimodal-input"]',
          ) as HTMLTextAreaElement;
          input?.focus();
        },
        icon: Search,
        category: 'chat',
      },
      {
        key: 'escape',
        label: 'Esc',
        description: 'Clear focus / Close modals',
        action: () => {
          (document.activeElement as HTMLElement)?.blur();
          setShowHelp(false);
        },
        icon: Escape,
        category: 'system',
      },
    ];

    shortcuts.forEach(registerShortcut);
  }, [router, registerShortcut, setShowHelp]);

  // Setup hotkeys
  useHotkeys([
    ['cmd+k', () => router.push('/')],
    [
      'cmd+/',
      () =>
        (document.querySelector('[data-testid="sidebar-toggle-button"]') as HTMLElement)?.click(),
    ],
    ['cmd+shift+/', () => setShowHelp(true)],
    [
      '/',
      e => {
        // Only prevent default if we're not already in an input
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          e.preventDefault();
          const input = document.querySelector(
            '[data-testid="multimodal-input"]',
          ) as HTMLTextAreaElement;
          input?.focus();
        }
      },
    ],
    [
      'escape',
      () => {
        (document.activeElement as HTMLElement)?.blur();
        setShowHelp(false);
      },
    ],
  ]);
}

// Message navigation hook
export function useMessageNavigation() {
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
  const { registerShortcut } = useKeyboardNavigation();

  useEffect(() => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'j',
        label: 'J',
        description: 'Next message',
        action: () => {
          const messages = document.querySelectorAll('[data-role="user"], [data-role="assistant"]');
          if (messages.length === 0) return;

          const nextIndex =
            selectedMessageIndex === null
              ? 0
              : Math.min(selectedMessageIndex + 1, messages.length - 1);
          setSelectedMessageIndex(nextIndex);
          messages[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        },
        icon: ArrowDown,
        category: 'navigation',
      },
      {
        key: 'k',
        label: 'K',
        description: 'Previous message',
        action: () => {
          const messages = document.querySelectorAll('[data-role="user"], [data-role="assistant"]');
          if (messages.length === 0) return;

          const prevIndex =
            selectedMessageIndex === null
              ? messages.length - 1
              : Math.max(selectedMessageIndex - 1, 0);
          setSelectedMessageIndex(prevIndex);
          messages[prevIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        },
        icon: ArrowUp,
        category: 'navigation',
      },
    ];

    shortcuts.forEach(registerShortcut);
  }, [selectedMessageIndex, registerShortcut]);

  // Setup message navigation
  useHotkeys([
    [
      'j',
      () => {
        const messages = document.querySelectorAll('[data-role="user"], [data-role="assistant"]');
        if (messages.length === 0) return;

        const nextIndex =
          selectedMessageIndex === null
            ? 0
            : Math.min(selectedMessageIndex + 1, messages.length - 1);
        setSelectedMessageIndex(nextIndex);
        messages[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    ],
    [
      'k',
      () => {
        const messages = document.querySelectorAll('[data-role="user"], [data-role="assistant"]');
        if (messages.length === 0) return;

        const prevIndex =
          selectedMessageIndex === null
            ? messages.length - 1
            : Math.max(selectedMessageIndex - 1, 0);
        setSelectedMessageIndex(prevIndex);
        messages[prevIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    ],
  ]);

  // Visual indicator for selected message
  useEffect(() => {
    const messages = document.querySelectorAll('[data-role="user"], [data-role="assistant"]');
    messages.forEach((msg, index) => {
      if (index === selectedMessageIndex) {
        msg.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      } else {
        msg.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }
    });
  }, [selectedMessageIndex]);

  return { selectedMessageIndex };
}

// Enhanced Keyboard shortcuts help dialog
function KeyboardShortcutsHelp() {
  const { shortcuts, showHelp, setShowHelp } = useKeyboardNavigation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Focus trap for modal - get the ref callback
  const focusTrapRef = useMantineFocusTrap(showHelp);

  // Merge the refs
  const _mergedRef = useMergedRef(modalRef, focusTrapRef);

  // Focus return on close
  const returnFocusOnClose = useFocusReturn({ opened: showHelp, shouldReturnFocus: true });

  // Enhanced escape handling
  useEventListener('keydown', event => {
    if (event.key === 'Escape' && showHelp) {
      setShowHelp(false);
      returnFocusOnClose();
    }
  });

  const categories = ['all', 'navigation', 'chat', 'editing', 'system'];

  const filteredShortcuts = shortcuts.filter(
    s => selectedCategory === 'all' || s.category === selectedCategory,
  );

  const categoryIcons = {
    navigation: MessageSquare,
    chat: MessageSquare,
    editing: Slash,
    system: Command,
  };

  return (
    <AnimatePresence>
      {showHelp && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
            className={`fixed inset-0 z-[${Z_INDEX.MODAL_BACKDROP}] ${BACKDROP_STYLES.HEAVY}`}
          />

          {/* Enhanced Dialog with Focus Trap */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[${Z_INDEX.MODAL}] w-full max-w-2xl`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
          >
            <div className="rounded-lg border bg-background shadow-lg">
              {/* Enhanced Header */}
              <div className="border-b p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 id="shortcuts-title" className="text-xl font-semibold">
                      Keyboard Shortcuts
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Navigate faster with keyboard shortcuts
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowHelp(false);
                      returnFocusOnClose();
                    }}
                    className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Close dialog"
                  >
                    <Escape size={16} />
                  </button>
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex gap-2 border-b p-4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cx(
                      'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted',
                    )}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              {/* Shortcuts list */}
              <div className="max-h-96 space-y-2 overflow-y-auto p-4">
                {filteredShortcuts.map((shortcut, index) => {
                  const Icon =
                    shortcut.icon || categoryIcons[shortcut.category as keyof typeof categoryIcons];

                  return (
                    <motion.div
                      key={shortcut.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {Icon && (
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                            <Icon size={16} />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{shortcut.description}</p>
                          <p className="text-xs text-muted-foreground">{shortcut.category}</p>
                        </div>
                      </div>

                      <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {shortcut.label}
                      </kbd>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t p-4 text-center text-sm text-muted-foreground">
                Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">Esc</kbd> to
                close
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Inline keyboard hint component
interface KeyboardHintProps {
  shortcut: string;
  className?: string;
}

export function KeyboardHint({ shortcut, className }: KeyboardHintProps) {
  return (
    <kbd
      className={cx(
        'inline-flex items-center gap-1 px-1.5 py-0.5',
        'rounded bg-muted/50 font-mono text-xs',
        'opacity-0 transition-opacity duration-200 group-hover:opacity-100',
        className,
      )}
    >
      {shortcut}
    </kbd>
  );
}

// Focus trap for modal contexts
export function useFocusTrap(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);
}
