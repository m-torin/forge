'use client';

import { saveDocument } from '@/app/(main)/editor/actions';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { useDevelopmentMode } from '@/hooks/use-development-mode';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';

// Layout components
import { AppHeader } from '@/components/layouts/app-header';
import { AppMainContent } from '@/components/layouts/app-layout';
import { HeaderMetadata, type MetadataItem } from '@/components/layouts/header-metadata';
import { HeaderTitle } from '@/components/layouts/header-title';

// Migrated Novel components
import { Separator } from '@/components/ui/separator';
import { defaultEditorContent } from '@/lib/editor/content';
import { defaultExtensions } from '@/lib/editor/extensions';
import GenerativeMenuSwitch from './generative/generative-menu-switch';
import { ColorSelector } from './selectors/color-selector';
import { LinkSelector } from './selectors/link-selector';
import { MathSelector } from './selectors/math-selector';
import { NodeSelector } from './selectors/node-selector';
import { TextButtons } from './selectors/text-buttons';
import { slashCommand as importedSlashCommand, suggestionItems } from './slash-command';

// Novel imports
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  handleCommandNavigation,
  type JSONContent,
} from '@repo/editing';
import { ImageResizerComponent } from '@repo/editing/extensions/image-resizer';
import { handleImageDrop, handleImagePaste } from '@repo/editing/utils/media';
import type { AnyExtension, Editor, Range } from '@tiptap/core';
import type { EditorView } from 'prosemirror-view';

interface NovelDocumentEditorProps {
  documentId: string;
  userId: string;
  initialTitle: string;
  initialContent?: string | null;
  documentMetadata?: {
    createdAt: Date;
    // updatedAt: Date;
    // kind: 'text' | 'code' | 'image' | 'sheet';
    // visibility: 'public' | 'private';
  } | null;
}

// Helper functions for content conversion
const convertToJSONContent = (content: string | null): JSONContent => {
  if (!content || content.trim() === '' || content === 'Start writing your document...') {
    return defaultEditorContent;
  }

  try {
    // Try to parse as JSON first (in case it's already JSONContent)
    const parsed = JSON.parse(content);
    if (parsed.type === 'doc' && parsed.content) {
      return parsed;
    }
  } catch {
    // If parsing fails, treat as plain text
  }

  // Convert plain text to JSONContent
  const paragraphs = content.split('\n').map(text => ({
    type: 'paragraph' as const,
    content: text.trim() ? [{ type: 'text' as const, text }] : [],
  }));

  return {
    type: 'doc',
    content: paragraphs,
  };
};

const convertFromJSONContent = (jsonContent: JSONContent): string => {
  if (!jsonContent?.content) return '';

  try {
    return JSON.stringify(jsonContent);
  } catch {
    return '';
  }
};

export function NovelDocumentEditor({
  documentId,
  userId: _userId,
  initialTitle,
  initialContent,
  documentMetadata,
}: NovelDocumentEditorProps) {
  const searchParams = useSearchParams();
  const { isDevelopment, isInitialized } = useDevelopmentMode();
  const [isClient, setIsClient] = useState(false);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if we're in localStorage mode (either dev environment or forced by URL param)
  const isLocalStorageMode = isDevelopment || searchParams.get('mode') === 'localStorage';

  // Single source of truth for document state
  const [title, setTitle] = useState(initialTitle || 'Untitled Document');
  const [content, setContent] = useState<JSONContent>(() => {
    // Ensure we always have a valid JSONContent structure
    const initialJSON = convertToJSONContent(initialContent || '');
    return initialJSON;
  });
  const [saveStatus, setSaveStatus] = useState('Loading...');

  // Bubble menu state management
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  // localStorage hooks (only used when in localStorage mode)
  const [localTitle, setLocalTitle] = useLocalStorage({
    key: `document-title-${documentId}`,
    defaultValue: initialTitle || 'Untitled Document',
  });

  const [localContent, setLocalContent] = useLocalStorage({
    key: `document-content-${documentId}`,
    defaultValue: convertFromJSONContent(convertToJSONContent(initialContent || '')),
  });

  // Image upload function for TipTap v3
  const imageUploadFn = useCallback(async (file: File, view: EditorView, pos: number) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = (await response.json()) as { url: string };
      const { schema } = view.state;
      const node = schema.nodes.image?.create({ src: data.url });
      if (node) {
        const transaction = view.state.tr.insert(pos, node);
        view.dispatch(transaction);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
    }
  }, []);

  // Use extensions from our migrated components (memoized for performance)
  const editorExtensions = useMemo<AnyExtension[]>(
    () => [...defaultExtensions, importedSlashCommand],
    [],
  );

  // Use the editorExtensions defined above

  // Initialize state based on mode (only after client-side hydration)
  useEffect(() => {
    if (!isInitialized || !isClient) return;

    if (isLocalStorageMode) {
      // In localStorage mode, restore from localStorage if available
      setTitle(localTitle);
      try {
        const parsedContent = JSON.parse(localContent);
        setContent(parsedContent);
      } catch {
        setContent(convertToJSONContent(localContent));
      }
      setSaveStatus('Auto-saved locally');
    } else {
      // In server mode, use initial values from server
      setTitle(initialTitle || 'Untitled Document');
      setContent(convertToJSONContent(initialContent || ''));
      setSaveStatus('Saved');
    }
  }, [
    isLocalStorageMode,
    isInitialized,
    isClient,
    localTitle,
    localContent,
    initialTitle,
    initialContent,
  ]);

  // Calculate word count from JSONContent (memoized for performance)
  const getWordCount = useCallback((jsonContent: JSONContent): number => {
    if (!jsonContent?.content) return 0;

    const extractText = (node: any): string => {
      if (node.type === 'text') {
        return node.text || '';
      }
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join('');
      }
      return '';
    };

    const text = jsonContent.content.map(extractText).join(' ');
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }, []);

  const wordCount = useMemo(() => getWordCount(content), [content, getWordCount]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const debouncedSave = useDebounceCallback(async (jsonContent: JSONContent) => {
    if (isLocalStorageMode) {
      // In localStorage mode, just update status
      setSaveStatus('Auto-saved locally');
      return;
    }

    // In server mode, save to server
    try {
      await saveDocument({
        documentId,
        title,
        content: convertFromJSONContent(jsonContent),
      });
      setSaveStatus('Saved');
      toast.success('Document saved');
    } catch (_error) {
      setSaveStatus('Error');
      toast.error('Failed to save document');
    }
  }, 1000);

  const handleContentChange = (newContent: JSONContent) => {
    setContent(newContent);

    if (isLocalStorageMode) {
      // Update localStorage
      setLocalContent(convertFromJSONContent(newContent));
      setSaveStatus('Auto-saving locally...');
      setTimeout(() => setSaveStatus('Auto-saved locally'), 500);
    } else {
      // Server mode
      setSaveStatus('Saving...');
      debouncedSave(newContent);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);

    if (isLocalStorageMode) {
      // Update localStorage
      setLocalTitle(newTitle);
      setSaveStatus('Auto-saving locally...');
      setTimeout(() => setSaveStatus('Auto-saved locally'), 500);
    } else {
      // Server mode
      setSaveStatus('Saving...');
      debouncedSave(content);
    }
  };

  // Sync to server function (for when database becomes available)
  const syncToServer = async () => {
    if (!isLocalStorageMode) return;

    try {
      setSaveStatus('Syncing to server...');
      await saveDocument({
        documentId,
        title,
        content: convertFromJSONContent(content),
      });
      setSaveStatus('Synced to server');
      toast.success('Document synced to server');
    } catch (_error) {
      setSaveStatus('Auto-saved locally');
      toast.error('Failed to sync to server');
    }
  };

  // Build metadata items for the header
  const getStatusVariant = (): MetadataItem['variant'] => {
    if (
      saveStatus.includes('saved') ||
      saveStatus === 'Saved' ||
      saveStatus === 'Synced to server'
    ) {
      return 'success';
    }
    if (saveStatus.includes('saving') || saveStatus.includes('Syncing')) {
      return 'warning';
    }
    if (saveStatus === 'Loading...') {
      return 'default';
    }
    return 'error';
  };

  const metadataItems: MetadataItem[] = [
    // Word count
    ...(wordCount > 0
      ? [
          {
            id: 'word-count',
            type: 'text' as const,
            content: `${wordCount} words`,
          },
        ]
      : []),

    // Document creation date
    ...(documentMetadata
      ? [
          {
            id: 'created-at',
            type: 'text' as const,
            content: `Created ${formatDate(documentMetadata.createdAt)}`,
            hideOnMobile: true,
          },
        ]
      : []),

    // LocalStorage mode indicator
    ...(isLocalStorageMode
      ? [
          {
            id: 'local-storage',
            type: 'badge' as const,
            content: 'localStorage mode',
            variant: 'info' as const,
          },
        ]
      : []),

    // Save status
    {
      id: 'save-status',
      type: 'badge' as const,
      content: saveStatus,
      variant: getStatusVariant(),
    },

    // Sync button (only in localStorage mode)
    ...(isLocalStorageMode
      ? [
          {
            id: 'sync-button',
            type: 'button' as const,
            content: saveStatus.includes('Syncing') ? 'Syncing...' : 'Sync to Server',
            onClick: syncToServer,
            disabled: saveStatus.includes('Syncing'),
          },
        ]
      : []),
  ];

  return (
    <>
      <AppHeader
        variant="editor"
        leftSlot={
          <>
            <SidebarToggle />
            <Button variant="ghost" size="sm" asChild className="mr-1 shrink-0 sm:mr-2">
              <Link href="/editor" className="flex items-center">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <HeaderTitle
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled Document"
            />
          </>
        }
        rightSlot={<HeaderMetadata items={metadataItems} />}
      />

      <AppMainContent variant="editor">
        {isClient && (
          <EditorRoot>
            <EditorContent
              initialContent={content}
              extensions={editorExtensions}
              className="relative min-h-[500px] w-full max-w-screen-lg border-muted bg-background p-6 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:p-8 sm:shadow-lg"
              editorProps={{
                handleDOMEvents: {
                  keydown: (_view: EditorView, event: KeyboardEvent) =>
                    handleCommandNavigation(event),
                },
                handlePaste: handleImagePaste(imageUploadFn),
                handleDrop: handleImageDrop(imageUploadFn),
                attributes: {
                  class:
                    'prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full',
                },
              }}
              onUpdate={({ editor }: { editor: Editor }) => {
                const json = editor.getJSON();
                handleContentChange(json);
              }}
              slotAfter={<ImageResizerComponent />}
            >
              <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
                <EditorCommandEmpty className="px-2 text-muted-foreground">
                  No results
                </EditorCommandEmpty>
                <EditorCommandList>
                  {suggestionItems.map(item => (
                    <EditorCommandItem
                      value={item.title}
                      onCommand={({ editor, range }: { editor: Editor; range: Range }) =>
                        item.command?.({ editor, range })
                      }
                      className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                      key={item.title}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </EditorCommandItem>
                  ))}
                </EditorCommandList>
              </EditorCommand>

              {/* Use migrated Novel bubble menu components */}
              <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
                <Separator orientation="vertical" />
                <NodeSelector open={openNode} onOpenChange={setOpenNode} />
                <Separator orientation="vertical" />
                <LinkSelector open={openLink} onOpenChange={setOpenLink} />
                <Separator orientation="vertical" />
                <MathSelector />
                <Separator orientation="vertical" />
                <TextButtons />
                <Separator orientation="vertical" />
                <ColorSelector open={openColor} onOpenChange={setOpenColor} />
              </GenerativeMenuSwitch>
            </EditorContent>
          </EditorRoot>
        )}
        {!isClient && (
          <div className="min-h-[400px] w-full rounded-lg bg-white px-6 py-8 text-base shadow-sm">
            <div className="animate-pulse text-muted-foreground">Loading editor...</div>
          </div>
        )}
      </AppMainContent>
    </>
  );
}
