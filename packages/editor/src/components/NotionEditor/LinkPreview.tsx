'use client';

import { logError } from '@repo/observability';
import { Editor } from '@tiptap/react';
import { clsx } from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

// =============================================================================
// POPOVER PRIMITIVES (Based on Tiptap official patterns)
// =============================================================================

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

function Popover({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <div className="popover-root" data-open={open}>
      <PopoverContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
        {children}
      </PopoverContext.Provider>
    </div>
  );
}

const PopoverContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, asChild = false, className, ...props }, ref) => {
    const context = React.useContext(PopoverContext);

    const handleClick = () => {
      context.onOpenChange(!context.open);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ...props,
        onClick: handleClick,
        'aria-expanded': context.open,
        'data-state': context.open ? 'open' : 'closed',
      });
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        aria-expanded={context.open}
        data-state={context.open ? 'open' : 'closed'}
        className={clsx('popover-trigger', className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

PopoverTrigger.displayName = 'PopoverTrigger';

interface PopoverContentProps {
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, side = 'bottom', align = 'center', className, ...props }, ref) => {
    const context = React.useContext(PopoverContext);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          context.onOpenChange(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          context.onOpenChange(false);
        }
      };

      if (context.open) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [context]);

    if (!context.open) return null;

    return (
      <div
        ref={node => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        data-side={side}
        data-align={align}
        className={clsx(
          'popover-content',
          'absolute z-50 rounded-lg border border-gray-200 bg-white shadow-lg',
          'animate-in fade-in-0 zoom-in-95',
          {
            'bottom-full mb-2': side === 'top',
            'top-full mt-2': side === 'bottom',
            'right-full mr-2': side === 'left',
            'left-full ml-2': side === 'right',
          },
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

PopoverContent.displayName = 'PopoverContent';

// =============================================================================
// LINK PREVIEW COMPONENT
// =============================================================================

interface LinkPreviewProps {
  url: string;
  children: React.ReactNode;
  delay?: number;
  showPreview?: boolean;
}

function LinkPreview({ url, children, delay = 500, showPreview = true }: LinkPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMouseEnter = () => {
    if (!showPreview) return;

    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
      if (!previewData && !isLoading) {
        fetchPreviewData(url);
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    setIsOpen(false);
  };

  const fetchPreviewData = async (targetUrl: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call a backend service
      // For demo purposes, we'll simulate the response
      await new Promise<void>(resolve => setTimeout(resolve, 800));

      const mockData = generateMockPreviewData(targetUrl);
      setPreviewData(mockData);
    } catch (err) {
      setError('Failed to load preview');
      logError('Link preview error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div
        className="relative inline-block"
        role="button"
        tabIndex={0}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        {children}

        {isOpen && (
          <PopoverContent className="w-80 p-0">
            <LinkPreviewCard data={previewData} isLoading={isLoading} error={error} url={url} />
          </PopoverContent>
        )}
      </div>
    </Popover>
  );
}

// =============================================================================
// LINK PREVIEW CARD
// =============================================================================

interface LinkPreviewData {
  title: string;
  description: string;
  image?: string;
  siteName: string;
  favicon?: string;
  domain: string;
}

interface LinkPreviewCardProps {
  data: LinkPreviewData | null;
  isLoading: boolean;
  error: string | null;
  url: string;
}

function LinkPreviewCard({ data, isLoading, error, url }: LinkPreviewCardProps) {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="mb-3 h-32 rounded bg-gray-200" />
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
          <div className="mb-2 h-3 w-1/2 rounded bg-gray-200" />
          <div className="h-3 w-full rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">🔗</div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-gray-900">{new URL(url).hostname}</div>
            <div className="text-sm text-gray-500">{error || 'Link preview unavailable'}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="truncate text-xs text-gray-400">{url}</span>
          <button
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Open →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {data.image && (
        <div className="relative h-32 overflow-hidden bg-gray-100">
          <img
            src={data.image}
            alt={data.title}
            role="presentation"
            className="h-full w-full object-cover"
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 flex items-start gap-2">
          {data.favicon && (
            <img
              src={data.favicon}
              alt=""
              role="presentation"
              className="mt-0.5 h-4 w-4 flex-shrink-0"
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-semibold text-gray-900">{data.title}</h3>
            {data.description && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{data.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="font-medium">{data.siteName}</span>
            <span>•</span>
            <span>{data.domain}</span>
          </div>
          <button
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Open →
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ENHANCED LINK COMPONENT
// =============================================================================

interface EnhancedLinkProps {
  href: string;
  children: React.ReactNode;
  showPreview?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

function _EnhancedLink({
  href,
  children,
  showPreview = true,
  className,
  onClick,
}: EnhancedLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    } else {
      // Default behavior: open in new tab
      e.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const linkElement = (
    <a
      href={href}
      onClick={handleClick}
      className={clsx(
        'notion-link cursor-pointer text-blue-600 underline hover:text-blue-800',
        className,
      )}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );

  if (!showPreview) {
    return linkElement;
  }

  return (
    <LinkPreview url={href} showPreview={showPreview}>
      {linkElement}
    </LinkPreview>
  );
}

// =============================================================================
// MOCK DATA GENERATOR
// =============================================================================

function generateMockPreviewData(url: string): LinkPreviewData {
  const domain = new URL(url).hostname;

  // Mock data based on common domains
  const mockData: Record<string, LinkPreviewData> = {
    'github.com': {
      title: 'Tiptap - The headless editor framework',
      description:
        'A renderless rich-text editor for Vue.js & React.js. Built with ProseMirror. Collaborative editing, real-time collaboration, and more.',
      image: 'https://opengraph.githubassets.com/placeholder',
      siteName: 'GitHub',
      favicon: 'https://github.com/favicon.ico',
      domain: 'github.com',
    },
    'tiptap.dev': {
      title: 'Tiptap Editor - Headless Rich Text Editor',
      description:
        'Tiptap is a suite of open source packages to build better WYSIWYG editors with ProseMirror.',
      image: 'https://tiptap.dev/og-image.png',
      siteName: 'Tiptap',
      favicon: 'https://tiptap.dev/favicon.ico',
      domain: 'tiptap.dev',
    },
    'notion.so': {
      title: 'Notion – The all-in-one workspace',
      description:
        "A new tool that blends your everyday work apps into one. It's the all-in-one workspace for you and your team.",
      image: 'https://notion.so/images/meta/default.png',
      siteName: 'Notion',
      favicon: 'https://notion.so/images/favicon.ico',
      domain: 'notion.so',
    },
  };

  // Return specific mock data or generate generic data
  if (mockData[domain]) {
    return mockData[domain];
  }

  return {
    title: `Page Title from ${domain}`,
    description:
      'This is a mock description for the link preview. In a real implementation, this would be fetched from the actual page metadata.',
    siteName: domain.replace('www.', ''),
    domain: domain,
    favicon: `https://${domain}/favicon.ico`,
  };
}

// =============================================================================
// LINK EDITOR POPUP
// =============================================================================

interface LinkEditorProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
  position?: { x: number; y: number };
}

export function LinkEditor({
  editor,
  isOpen,
  onClose,
  initialUrl = '',
  position,
}: LinkEditorProps) {
  const [url, setUrl] = useState(initialUrl);
  const [displayText, setDisplayText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      // Get selected text for display text
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);
      setDisplayText(selectedText || '');

      // Focus input after a brief delay
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, initialUrl, editor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      // Remove link if URL is empty
      editor.chain().focus().unsetLink().run();
    } else {
      // Set or update link
      let finalUrl = url.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`;
      }

      if (
        displayText &&
        displayText !==
          editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
      ) {
        // Replace text and add link
        editor.chain().focus().insertContent(displayText).setLink({ href: finalUrl }).run();
      } else {
        // Just add link to existing selection
        editor.chain().focus().setLink({ href: finalUrl }).run();
      }
    }

    onClose();
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/20"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
        aria-label="Close preview"
      />

      <div
        className="relative w-96 rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
        style={
          position
            ? {
                position: 'fixed',
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -100%)',
              }
            : undefined
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">URL</label>
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Enter URL or search..."
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {displayText && (
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Display Text</label>
              <input
                type="text"
                value={displayText}
                onChange={e => setDisplayText(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {initialUrl ? 'Update' : 'Add'} Link
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>

            {initialUrl && (
              <button
                type="button"
                onClick={handleRemoveLink}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove Link
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
