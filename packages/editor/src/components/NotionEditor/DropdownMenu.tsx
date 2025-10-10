'use client';

import { Editor } from '@tiptap/react';
import { clsx } from 'clsx';
import React, { forwardRef, useEffect, useRef, useState } from 'react';

// =============================================================================
// DROPDOWN MENU PRIMITIVES (Based on Tiptap official patterns)
// =============================================================================

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  modal?: boolean;
}

function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  modal = false,
}: DropdownMenuProps) {
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
    <div className="dropdown-menu-root" data-open={open}>
      <DropdownMenuContext.Provider value={{ open, onOpenChange: handleOpenChange, modal }}>
        {children}
      </DropdownMenuContext.Provider>
    </div>
  );
}

const DropdownMenuContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modal?: boolean;
}>({
  open: false,
  onOpenChange: () => {},
});

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, asChild = false, className, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);

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
        className={clsx('dropdown-menu-trigger', className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

interface DropdownMenuContentProps {
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  portal?: boolean;
  className?: string;
}

const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, side = 'bottom', align = 'start', className, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);
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

    const content = (
      <div
        ref={node => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        data-side={side}
        data-align={align}
        className={clsx(
          'dropdown-menu-content',
          'absolute z-50 min-w-[200px] rounded-md border border-gray-200 bg-white p-1 shadow-lg',
          'animate-in fade-in-0 zoom-in-95',
          {
            'bottom-full mb-1': side === 'top',
            'top-full mt-1': side === 'bottom',
            'right-full mr-1': side === 'left',
            'left-full ml-1': side === 'right',
          },
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );

    // For now, we'll use simple positioning. In a production app, you'd want to use
    // Floating UI or similar for proper positioning
    return content;
  },
);

DropdownMenuContent.displayName = 'DropdownMenuContent';

interface DropdownMenuGroupProps {
  children: React.ReactNode;
  className?: string;
}

function DropdownMenuGroup({ children, className }: DropdownMenuGroupProps) {
  return <div className={clsx('dropdown-menu-group', 'space-y-1', className)}>{children}</div>;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  asChild?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ children, asChild = false, disabled = false, className, onClick, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);

    const handleClick = () => {
      if (!disabled) {
        onClick?.();
        context.onOpenChange(false);
      }
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ...props,
        onClick: handleClick,
        'data-disabled': disabled,
      });
    }

    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        data-disabled={disabled}
        className={clsx(
          'dropdown-menu-item',
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
          'hover:bg-gray-100 focus:bg-gray-100',
          'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

DropdownMenuItem.displayName = 'DropdownMenuItem';

// =============================================================================
// HEADING DROPDOWN MENU COMPONENT
// =============================================================================

interface HeadingDropdownMenuProps {
  editor: Editor;
  levels?: number[];
  hideWhenUnavailable?: boolean;
  portal?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function HeadingDropdownMenu({
  editor,
  levels = [1, 2, 3, 4, 5, 6],
  hideWhenUnavailable = false,
  portal = false,
  onOpenChange,
  className,
}: HeadingDropdownMenuProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const getCurrentLevel = () => {
    for (const level of levels) {
      if (editor.isActive('heading', { level })) {
        return level;
      }
    }
    if (editor.isActive('paragraph')) {
      return 0;
    }
    return null;
  };

  const currentLevel = getCurrentLevel();
  const isAvailable = editor.can().toggleHeading({ level: 1 });

  if (hideWhenUnavailable && !isAvailable) {
    return null;
  }

  const getDisplayText = () => {
    if (currentLevel === 0) return 'Paragraph';
    if (currentLevel) return `Heading ${currentLevel}`;
    return 'Text';
  };

  const getDisplayIcon = () => {
    if (currentLevel === 0) return '¶';
    if (currentLevel) return `H${currentLevel}`;
    return 'T';
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className={clsx(
            'flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium',
            'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          disabled={!isAvailable}
          data-testid="heading-dropdown-trigger"
        >
          <span className="font-mono text-xs font-bold text-gray-600">{getDisplayIcon()}</span>
          <span>{getDisplayText()}</span>
          <svg
            className={clsx('h-4 w-4 transition-transform', open && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent portal={portal} className="min-w-[160px]">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={clsx(currentLevel === 0 && 'bg-blue-50 text-blue-700')}
          >
            <span className="mr-3 font-mono text-xs font-bold text-gray-600">¶</span>
            <span>Paragraph</span>
          </DropdownMenuItem>
          {levels.map(level => (
            <DropdownMenuItem
              key={level}
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                  .run()
              }
              className={clsx(currentLevel === level && 'bg-blue-50 text-blue-700')}
            >
              <span className="mr-3 font-mono text-xs font-bold text-gray-600">H{level}</span>
              <span>Heading {level}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// =============================================================================
// LIST DROPDOWN MENU COMPONENT
// =============================================================================

interface ListDropdownMenuProps {
  editor: Editor;
  hideWhenUnavailable?: boolean;
  portal?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function ListDropdownMenu({
  editor,
  hideWhenUnavailable = false,
  portal = false,
  onOpenChange,
  className,
}: ListDropdownMenuProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const getCurrentListType = () => {
    if (editor.isActive('bulletList')) return 'bullet';
    if (editor.isActive('orderedList')) return 'ordered';
    if (editor.isActive('taskList')) return 'task';
    return null;
  };

  const currentListType = getCurrentListType();
  const isAvailable = editor.can().toggleBulletList();

  if (hideWhenUnavailable && !isAvailable) {
    return null;
  }

  const getDisplayText = () => {
    switch (currentListType) {
      case 'bullet':
        return 'Bullet List';
      case 'ordered':
        return 'Numbered List';
      case 'task':
        return 'Task List';
      default:
        return 'List';
    }
  };

  const getDisplayIcon = () => {
    switch (currentListType) {
      case 'bullet':
        return '•';
      case 'ordered':
        return '1.';
      case 'task':
        return '☐';
      default:
        return '⋮';
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className={clsx(
            'flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium',
            'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          disabled={!isAvailable}
          data-testid="list-dropdown-trigger"
        >
          <span className="font-mono text-xs font-bold text-gray-600">{getDisplayIcon()}</span>
          <span>{getDisplayText()}</span>
          <svg
            className={clsx('h-4 w-4 transition-transform', open && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent portal={portal} className="min-w-[160px]">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={clsx(currentListType === 'bullet' && 'bg-blue-50 text-blue-700')}
          >
            <span className="mr-3 font-mono text-xs font-bold text-gray-600">•</span>
            <span>Bullet List</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={clsx(currentListType === 'ordered' && 'bg-blue-50 text-blue-700')}
          >
            <span className="mr-3 font-mono text-xs font-bold text-gray-600">1.</span>
            <span>Numbered List</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={clsx(currentListType === 'task' && 'bg-blue-50 text-blue-700')}
          >
            <span className="mr-3 font-mono text-xs font-bold text-gray-600">☐</span>
            <span>Task List</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// =============================================================================
// TURN INTO DROPDOWN MENU COMPONENT
// =============================================================================

interface TurnIntoDropdownMenuProps {
  editor: Editor;
  hideWhenUnavailable?: boolean;
  portal?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function TurnIntoDropdownMenu({
  editor,
  hideWhenUnavailable = false,
  portal = false,
  onOpenChange,
  className,
}: TurnIntoDropdownMenuProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const getCurrentBlockType = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    if (editor.isActive('bulletList')) return 'bulletList';
    if (editor.isActive('orderedList')) return 'orderedList';
    if (editor.isActive('taskList')) return 'taskList';
    if (editor.isActive('blockquote')) return 'blockquote';
    if (editor.isActive('codeBlock')) return 'codeBlock';
    if (editor.isActive('paragraph')) return 'paragraph';
    return 'paragraph';
  };

  const currentBlockType = getCurrentBlockType();
  const isAvailable = editor.can().setParagraph();

  if (hideWhenUnavailable && !isAvailable) {
    return null;
  }

  const blockTypes = [
    {
      type: 'paragraph',
      label: 'Paragraph',
      icon: '¶',
      command: () => editor.chain().focus().setParagraph().run(),
    },
    {
      type: 'h1',
      label: 'Heading 1',
      icon: 'H1',
      command: () =>
        editor
          .chain()
          .focus()
          .toggleHeading({ level: 1 as const })
          .run(),
    },
    {
      type: 'h2',
      label: 'Heading 2',
      icon: 'H2',
      command: () =>
        editor
          .chain()
          .focus()
          .toggleHeading({ level: 2 as const })
          .run(),
    },
    {
      type: 'h3',
      label: 'Heading 3',
      icon: 'H3',
      command: () =>
        editor
          .chain()
          .focus()
          .toggleHeading({ level: 3 as const })
          .run(),
    },
    {
      type: 'bulletList',
      label: 'Bullet List',
      icon: '•',
      command: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      type: 'orderedList',
      label: 'Numbered List',
      icon: '1.',
      command: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      type: 'taskList',
      label: 'Task List',
      icon: '☐',
      command: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      type: 'blockquote',
      label: 'Quote',
      icon: '"',
      command: () => editor.chain().focus().setBlockquote().run(),
    },
    {
      type: 'codeBlock',
      label: 'Code Block',
      icon: '{}',
      command: () => editor.chain().focus().setCodeBlock().run(),
    },
  ];

  const currentBlock = blockTypes.find(block => block.type === currentBlockType) || blockTypes[0];

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className={clsx(
            'flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium',
            'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          disabled={!isAvailable}
          data-testid="turn-into-dropdown-trigger"
          title="Turn into"
        >
          <span className="font-mono text-xs font-bold text-gray-600">{currentBlock.icon}</span>
          <span>Turn into</span>
          <svg
            className={clsx('h-4 w-4 transition-transform', open && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent portal={portal} className="min-w-[160px]">
        <DropdownMenuGroup>
          {blockTypes.map(blockType => (
            <DropdownMenuItem
              key={blockType.type}
              onClick={blockType.command}
              className={clsx(currentBlockType === blockType.type && 'bg-blue-50 text-blue-700')}
            >
              <span className="mr-3 font-mono text-xs font-bold text-gray-600">
                {blockType.icon}
              </span>
              <span>{blockType.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
