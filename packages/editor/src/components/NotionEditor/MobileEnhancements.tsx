'use client';

import { Editor } from '@tiptap/react';
import { clsx } from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HeadingDropdownMenu, ListDropdownMenu, TurnIntoDropdownMenu } from './DropdownMenu';

// =============================================================================
// MOBILE DETECTION HOOK
// =============================================================================

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Check for mobile using multiple methods
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        'mobile',
        'android',
        'iphone',
        'ipad',
        'ipod',
        'blackberry',
        'windows phone',
      ];
      const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));

      // Check screen size
      const isMobileScreen = window.innerWidth <= 768;

      // Check for touch support
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setIsMobile(isMobileUserAgent || (isMobileScreen && isTouchDevice));
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

// =============================================================================
// TOUCH UTILITIES
// =============================================================================

export const touchUtils = {
  /**
   * Check if the current device supports touch
   */
  isTouchDevice: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Get touch point from event
   */
  getTouchPoint: (event: TouchEvent): { x: number; y: number } | null => {
    if (event.touches.length === 0) return null;
    const touch = event.touches[0];
    return { x: touch.clientX, y: touch.clientY };
  },

  /**
   * Calculate distance between two touch points
   */
  getTouchDistance: (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Prevent default touch behaviors like zoom
   */
  preventDefaultTouch: (event: TouchEvent) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  },
};

// =============================================================================
// MOBILE FLOATING TOOLBAR
// =============================================================================

interface MobileFloatingToolbarProps {
  editor: Editor;
  isVisible: boolean;
  onClose: () => void;
}

export function MobileFloatingToolbar({ editor, isVisible, onClose }: MobileFloatingToolbarProps) {
  const [activeTab, setActiveTab] = useState<'format' | 'blocks'>('format');

  if (!isVisible) return null;

  return (
    <div className="mobile-floating-toolbar fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('format')}
          className={clsx(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'format'
              ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:text-gray-800',
          )}
        >
          Format
        </button>
        <button
          onClick={() => setActiveTab('blocks')}
          className={clsx(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'blocks'
              ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:text-gray-800',
          )}
        >
          Blocks
        </button>
        <button onClick={onClose} className="px-4 py-3 text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto p-4">
        {activeTab === 'format' && <MobileFormattingPanel editor={editor} />}
        {activeTab === 'blocks' && <MobileBlocksPanel editor={editor} />}
      </div>
    </div>
  );
}

// =============================================================================
// MOBILE FORMATTING PANEL
// =============================================================================

interface MobileFormattingPanelProps {
  editor: Editor;
}

function MobileFormattingPanel({ editor }: MobileFormattingPanelProps) {
  const formatButtons = [
    {
      label: 'Bold',
      icon: 'B',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      shortcut: '⌘B',
    },
    {
      label: 'Italic',
      icon: 'I',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      shortcut: '⌘I',
    },
    {
      label: 'Underline',
      icon: 'U',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      shortcut: '⌘U',
    },
    {
      label: 'Strike',
      icon: 'S',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      shortcut: '',
    },
    {
      label: 'Code',
      icon: '</>',
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
      shortcut: '⌘E',
    },
    {
      label: 'Link',
      icon: '🔗',
      action: () => {
        const url = window.prompt('Enter URL:');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      isActive: editor.isActive('link'),
      shortcut: '⌘K',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {formatButtons.map(button => (
          <button
            key={button.label}
            onClick={button.action}
            className={clsx(
              'flex flex-col items-center justify-center rounded-lg border p-3 text-sm font-medium transition-colors',
              button.isActive
                ? 'border-blue-200 bg-blue-100 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
            )}
          >
            <span className="mb-1 text-lg">{button.icon}</span>
            <span className="text-xs">{button.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Colors</h4>
        <MobileColorPicker editor={editor} />
      </div>
    </div>
  );
}

// =============================================================================
// MOBILE BLOCKS PANEL
// =============================================================================

interface MobileBlocksPanelProps {
  editor: Editor;
}

function MobileBlocksPanel({ editor }: MobileBlocksPanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <TurnIntoDropdownMenu
          editor={editor}
          className="w-full justify-between rounded-lg border border-gray-200 p-3 text-left"
        />

        <HeadingDropdownMenu
          editor={editor}
          className="w-full justify-between rounded-lg border border-gray-200 p-3 text-left"
        />

        <ListDropdownMenu
          editor={editor}
          className="w-full justify-between rounded-lg border border-gray-200 p-3 text-left"
        />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => editor.chain().focus().setBlockquote().run()}
            className={clsx(
              'flex items-center justify-center rounded-lg border p-3 text-sm font-medium transition-colors',
              editor.isActive('blockquote')
                ? 'border-blue-200 bg-blue-100 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
            )}
          >
            <span className="mr-2">&quot;</span>
            Quote
          </button>

          <button
            onClick={() => editor.chain().focus().setCodeBlock().run()}
            className={clsx(
              'flex items-center justify-center rounded-lg border p-3 text-sm font-medium transition-colors',
              editor.isActive('codeBlock')
                ? 'border-blue-200 bg-blue-100 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
            )}
          >
            <span className="mr-2">{'{}'}</span>
            Code
          </button>

          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <span className="mr-2">---</span>
            Divider
          </button>

          <button
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
            className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <span className="mr-2">⊞</span>
            Table
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MOBILE COLOR PICKER
// =============================================================================

interface MobileColorPickerProps {
  editor: Editor;
}

function MobileColorPicker({ editor }: MobileColorPickerProps) {
  const colors = [
    { name: 'Default', value: '#000000', bg: '#000000' },
    { name: 'Red', value: '#e53e3e', bg: '#e53e3e' },
    { name: 'Orange', value: '#dd6b20', bg: '#dd6b20' },
    { name: 'Yellow', value: '#d69e2e', bg: '#d69e2e' },
    { name: 'Green', value: '#38a169', bg: '#38a169' },
    { name: 'Blue', value: '#3182ce', bg: '#3182ce' },
    { name: 'Purple', value: '#805ad5', bg: '#805ad5' },
    { name: 'Pink', value: '#d53f8c', bg: '#d53f8c' },
  ];

  const highlights = [
    { name: 'None', value: null, bg: 'transparent' },
    { name: 'Yellow', value: '#fef08a', bg: '#fef08a' },
    { name: 'Green', value: '#bbf7d0', bg: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe', bg: '#bfdbfe' },
    { name: 'Purple', value: '#e9d5ff', bg: '#e9d5ff' },
    { name: 'Pink', value: '#fce7f3', bg: '#fce7f3' },
    { name: 'Red', value: '#fecaca', bg: '#fecaca' },
    { name: 'Orange', value: '#fed7aa', bg: '#fed7aa' },
  ];

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-xs text-gray-500">Text Color</p>
        <div className="flex flex-wrap gap-2">
          {colors.map(color => (
            <button
              key={color.name}
              onClick={() => editor.chain().focus().setColor(color.value).run()}
              className="h-8 w-8 rounded-full border-2 border-gray-200 transition-colors hover:border-gray-400"
              style={{ backgroundColor: color.bg }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs text-gray-500">Highlight</p>
        <div className="flex flex-wrap gap-2">
          {highlights.map(highlight => (
            <button
              key={highlight.name}
              onClick={() => {
                if (highlight.value) {
                  editor.chain().focus().setHighlight({ color: highlight.value }).run();
                } else {
                  editor.chain().focus().unsetHighlight().run();
                }
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 transition-colors hover:border-gray-400"
              style={{ backgroundColor: highlight.bg }}
              title={highlight.name}
            >
              {!highlight.value && <span className="text-xs text-gray-400">×</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MOBILE SELECTION OVERLAY
// =============================================================================

interface MobileSelectionOverlayProps {
  editor: Editor;
  onShowToolbar: () => void;
}

export function MobileSelectionOverlay({ editor, onShowToolbar }: MobileSelectionOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let selectionTimeout: NodeJS.Timeout;

    const handleSelectionChange = () => {
      // Clear existing timeout
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }

      // Small delay to allow selection to stabilize
      selectionTimeout = setTimeout(() => {
        const selection = window.getSelection();
        const hasSelection =
          selection && !selection.isCollapsed && selection.toString().trim().length > 0;

        if (hasSelection && editor.isFocused) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 60, // Show above selection
          });
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }, 100);
    };

    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
    };
  }, [editor]);

  if (!isVisible) return null;

  return (
    <div
      className="mobile-selection-overlay fixed z-40 -translate-x-1/2 transform rounded-full bg-blue-600 px-4 py-2 text-white shadow-lg"
      style={{
        left: position.x,
        top: Math.max(position.y, 10), // Ensure it doesn't go off-screen
      }}
    >
      <button onClick={onShowToolbar} className="whitespace-nowrap text-sm font-medium">
        Format Text
      </button>
    </div>
  );
}

// =============================================================================
// MOBILE-SPECIFIC STYLES
// =============================================================================

export const mobileStyles = `
  /* Mobile-specific touch targets */
  @media (max-width: 768px) {
    .notion-editor-content {
      font-size: 16px; /* Prevent zoom on iOS */
      line-height: 1.5;
      padding: 1rem;
    }

    /* Larger touch targets for mobile */
    .mobile-floating-toolbar button {
      min-height: 44px;
      min-width: 44px;
    }

    /* Hide desktop-only elements on mobile */
    .notion-editor-content .drag-handle {
      display: none;
    }

    /* Mobile-optimized floating menu */
    .mobile-selection-overlay {
      animation: mobile-fade-in 0.2s ease-out;
    }

    @keyframes mobile-fade-in {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(10px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
      }
    }

    /* Touch-friendly scrolling */
    .mobile-floating-toolbar {
      -webkit-overflow-scrolling: touch;
    }

    /* Disable text selection on UI elements */
    .mobile-floating-toolbar,
    .mobile-selection-overlay {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    /* Improve tap targets */
    .dropdown-menu-item {
      min-height: 44px;
      padding: 12px 16px;
    }

    /* Mobile context menu adjustments */
    .context-menu-content {
      max-height: 60vh;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    .context-menu-item {
      min-height: 44px;
      padding: 12px 16px;
    }
  }

  /* Prevent zoom on double-tap */
  @media (max-width: 768px) {
    .notion-editor-content * {
      touch-action: manipulation;
    }
  }

  /* High DPI display optimizations */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .mobile-floating-toolbar {
      border-width: 0.5px;
    }
  }
`;

// =============================================================================
// MOBILE GESTURE HANDLER
// =============================================================================

interface MobileGestureHandlerProps {
  children: React.ReactNode;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLongPress?: () => void;
}

export function MobileGestureHandler({
  children,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
}: MobileGestureHandlerProps) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      // Start long press timer
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          onLongPress();
        }, 500);
      }
    },
    [onLongPress],
  );

  const handleTouchMove = useCallback(() => {
    // Cancel long press on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = undefined;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = undefined;
      }

      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Only consider quick swipes (< 300ms)
      if (deltaTime > 300) return;

      const minSwipeDistance = 50;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Horizontal swipe
      if (absX > absY && absX > minSwipeDistance) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
      // Vertical swipe
      else if (absY > absX && absY > minSwipeDistance) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }

      touchStartRef.current = null;
    },
    [onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight],
  );

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {children}
    </div>
  );
}
