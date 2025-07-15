'use client';

import { logInfo } from '@repo/observability';
import { Editor } from '@tiptap/react';
import { clsx } from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

interface ContextMenuProps {
  editor: Editor;
  children: React.ReactNode;
}

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
}

export function ContextMenu({ editor, children }: ContextMenuProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();

      // Get the position relative to the viewport
      const rect = container.getBoundingClientRect();
      const _x = event.clientX - rect.left;
      const _y = event.clientY - rect.top;

      setContextMenu({
        isOpen: true,
        x: event.clientX,
        y: event.clientY,
      });
    };

    const handleClick = () => {
      setContextMenu(prev => ({ ...prev, isOpen: false }));
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu(prev => ({ ...prev, isOpen: false }));
      }
    };

    container.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const contextMenuItems = [
    {
      label: 'Cut',
      icon: '✂️',
      shortcut: '⌘X',
      action: () => {
        document.execCommand('cut');
        editor.chain().focus().run();
      },
      disabled: editor.state.selection.empty,
    },
    {
      label: 'Copy',
      icon: '📋',
      shortcut: '⌘C',
      action: () => {
        document.execCommand('copy');
        editor.chain().focus().run();
      },
      disabled: editor.state.selection.empty,
    },
    {
      label: 'Paste',
      icon: '📄',
      shortcut: '⌘V',
      action: () => {
        document.execCommand('paste');
        editor.chain().focus().run();
      },
      disabled: false,
    },
    {
      type: 'separator',
    },
    {
      label: 'Turn into',
      icon: '🔄',
      submenu: [
        {
          label: 'Paragraph',
          icon: '¶',
          action: () => editor.chain().focus().setParagraph().run(),
          active: editor.isActive('paragraph'),
        },
        {
          label: 'Heading 1',
          icon: 'H1',
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          active: editor.isActive('heading', { level: 1 }),
        },
        {
          label: 'Heading 2',
          icon: 'H2',
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          active: editor.isActive('heading', { level: 2 }),
        },
        {
          label: 'Heading 3',
          icon: 'H3',
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          active: editor.isActive('heading', { level: 3 }),
        },
        {
          type: 'separator',
        },
        {
          label: 'Bullet List',
          icon: '•',
          action: () => editor.chain().focus().toggleBulletList().run(),
          active: editor.isActive('bulletList'),
        },
        {
          label: 'Numbered List',
          icon: '1.',
          action: () => editor.chain().focus().toggleOrderedList().run(),
          active: editor.isActive('orderedList'),
        },
        {
          label: 'Task List',
          icon: '☐',
          action: () => editor.chain().focus().toggleTaskList().run(),
          active: editor.isActive('taskList'),
        },
        {
          type: 'separator',
        },
        {
          label: 'Quote',
          icon: '"',
          action: () => editor.chain().focus().setBlockquote().run(),
          active: editor.isActive('blockquote'),
        },
        {
          label: 'Code Block',
          icon: '{}',
          action: () => editor.chain().focus().setCodeBlock().run(),
          active: editor.isActive('codeBlock'),
        },
      ],
    },
    {
      type: 'separator',
    },
    {
      label: 'Bold',
      icon: 'B',
      shortcut: '⌘B',
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive('bold'),
      disabled: editor.state.selection.empty,
    },
    {
      label: 'Italic',
      icon: 'I',
      shortcut: '⌘I',
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive('italic'),
      disabled: editor.state.selection.empty,
    },
    {
      label: 'Underline',
      icon: 'U',
      shortcut: '⌘U',
      action: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive('underline'),
      disabled: editor.state.selection.empty,
    },
    {
      type: 'separator',
    },
    {
      label: 'Add Link',
      icon: '🔗',
      shortcut: '⌘K',
      action: () => {
        const url = window.prompt('Enter URL:');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      disabled: editor.state.selection.empty,
    },
    {
      label: 'Comment',
      icon: '💬',
      action: () => {
        logInfo('Add comment functionality');
      },
      disabled: editor.state.selection.empty,
    },
  ];

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {children}

      {contextMenu.isOpen && (
        <div className="context-menu-portal fixed inset-0 z-50" style={{ pointerEvents: 'none' }}>
          <div
            role="menu"
            className="context-menu-content absolute min-w-[200px] rounded-lg border border-gray-200 bg-white py-1 shadow-xl"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              pointerEvents: 'auto',
              animation: 'context-menu-fade-in 0.15s ease-out',
            }}
            onClick={e => e.stopPropagation()}
          >
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  @keyframes context-menu-fade-in {
                    from {
                      opacity: 0;
                      transform: scale(0.95) translateY(-4px);
                    }
                    to {
                      opacity: 1;
                      transform: scale(1) translateY(0);
                    }
                  }
                `,
              }}
            />

            {contextMenuItems.map(item => {
              if (item.type === 'separator') {
                return <div key={`separator-${item.label}`} className="my-1 h-px bg-gray-200" />;
              }

              if (item.submenu) {
                return (
                  <SubmenuItem
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    items={item.submenu}
                    onItemClick={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
                  />
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action?.();
                    setContextMenu(prev => ({ ...prev, isOpen: false }));
                  }}
                  disabled={item.disabled}
                  className={clsx(
                    'context-menu-item flex w-full items-center justify-between px-3 py-2 text-left text-sm',
                    'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    item.active && 'bg-blue-50 text-blue-700',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 text-sm">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.shortcut && <span className="text-xs text-gray-400">{item.shortcut}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface SubmenuItemProps {
  label: string;
  icon?: string;
  items: any[];
  onItemClick: () => void;
}

function SubmenuItem({ label, icon, items, onItemClick }: SubmenuItemProps) {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const submenuRef = useRef<HTMLDivElement>(null);

  return (
    <div
      role="menuitem"
      tabIndex={0}
      className="relative"
      onMouseEnter={() => setIsSubmenuOpen(true)}
      onMouseLeave={() => setIsSubmenuOpen(false)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsSubmenuOpen(!isSubmenuOpen);
        }
      }}
    >
      <div className="context-menu-item flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50">
        <div className="flex items-center gap-3">
          {icon && <span className="flex-shrink-0 text-sm">{icon}</span>}
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-xs text-gray-400">›</span>
      </div>

      {isSubmenuOpen && (
        <div
          ref={submenuRef}
          className="submenu-content absolute left-full top-0 ml-1 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-xl"
          style={{
            animation: 'context-menu-fade-in 0.1s ease-out',
          }}
        >
          {items.map(item => {
            if (item.type === 'separator') {
              return (
                <div key={`submenu-separator-${item.label}`} className="my-1 h-px bg-gray-200" />
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => {
                  item.action?.();
                  onItemClick();
                }}
                disabled={item.disabled}
                className={clsx(
                  'submenu-item flex w-full items-center gap-3 px-3 py-2 text-left text-sm',
                  'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  item.active && 'bg-blue-50 text-blue-700',
                )}
              >
                <span className="flex-shrink-0 text-sm">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
