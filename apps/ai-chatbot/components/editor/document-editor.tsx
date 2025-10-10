'use client';

import { saveDocument } from '@/app/(main)/editor/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDevelopmentMode } from '@/hooks/use-development-mode';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebounceCallback } from 'usehooks-ts';

interface DocumentEditorProps {
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

export function DocumentEditor({
  documentId,
  userId: _userId,
  initialTitle,
  initialContent,
  documentMetadata,
}: DocumentEditorProps) {
  const searchParams = useSearchParams();
  const { isDevelopment, isInitialized } = useDevelopmentMode();

  // Check if we're in localStorage mode (either dev environment or forced by URL param)
  const isLocalStorageMode = isDevelopment || searchParams.get('mode') === 'localStorage';

  // Single source of truth for document state
  const [title, setTitle] = useState(initialTitle || 'Untitled Document');
  const [content, setContent] = useState(initialContent || 'Start writing your document...');
  const [saveStatus, setSaveStatus] = useState('Loading...');

  // localStorage hooks (only used when in localStorage mode)
  const [localTitle, setLocalTitle] = useLocalStorage({
    key: `document-title-${documentId}`,
    defaultValue: initialTitle || 'Untitled Document',
  });

  const [localContent, setLocalContent] = useLocalStorage({
    key: `document-content-${documentId}`,
    defaultValue: initialContent || 'Start writing your document...',
  });

  // Initialize state based on mode
  useEffect(() => {
    if (!isInitialized) return;

    if (isLocalStorageMode) {
      // In localStorage mode, restore from localStorage if available
      setTitle(localTitle);
      setContent(localContent);
      setSaveStatus('Auto-saved locally');
    } else {
      // In server mode, use initial values from server
      setTitle(initialTitle || 'Untitled Document');
      setContent(initialContent || 'Start writing your document...');
      setSaveStatus('Saved');
    }
  }, [isLocalStorageMode, isInitialized, localTitle, localContent, initialTitle, initialContent]);

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const debouncedSave = useDebounceCallback(async () => {
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
        content,
      });
      setSaveStatus('Saved');
      toast.success('Document saved');
    } catch (_error) {
      setSaveStatus('Error');
      toast.error('Failed to save document');
    }
  }, 1000);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);

    if (isLocalStorageMode) {
      // Update localStorage
      setLocalContent(newContent);
      setSaveStatus('Auto-saving locally...');
      setTimeout(() => setSaveStatus('Auto-saved locally'), 500);
    } else {
      // Server mode
      setSaveStatus('Saving...');
      debouncedSave();
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
      debouncedSave();
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
        content,
      });
      setSaveStatus('Synced to server');
      toast.success('Document synced to server');
    } catch (_error) {
      setSaveStatus('Auto-saved locally');
      toast.error('Failed to sync to server');
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex flex-1 items-center space-x-4">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/editor" className="flex items-center">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Input
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            className="border-none px-0 text-lg font-semibold focus-visible:ring-0"
            placeholder="Untitled Document"
          />
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          {wordCount > 0 && <span>{wordCount} words</span>}
          {documentMetadata && (
            <>
              <span>•</span>
              <span>Created {formatDate(documentMetadata.createdAt)}</span>
              {/* <span>•</span>
              <span>Updated {formatDate(documentMetadata.updatedAt)}</span> */}
              {/* <span>•</span>
              <span className={`px-2 py-1 rounded text-xs ${
                documentMetadata.visibility === 'public' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
              }`}>
                {documentMetadata.visibility}
              </span>
              <span>•</span>
              <span className="capitalize">{documentMetadata.kind}</span> */}
            </>
          )}
          <span>•</span>

          {/* Mode indicator */}
          {isLocalStorageMode && (
            <>
              <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                localStorage mode
              </span>
              <span>•</span>
            </>
          )}

          {/* Save status */}
          <span
            className={`rounded px-2 py-1 text-xs ${
              saveStatus.includes('saved') ||
              saveStatus === 'Saved' ||
              saveStatus === 'Synced to server'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                : saveStatus.includes('saving') || saveStatus.includes('Syncing')
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                  : saveStatus === 'Loading...'
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
            }`}
          >
            {saveStatus}
          </span>

          {/* Sync button (only show in localStorage mode) */}
          {isLocalStorageMode && (
            <>
              <span>•</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={syncToServer}
                disabled={saveStatus.includes('Syncing')}
                className="h-6 px-2 text-xs"
              >
                {saveStatus.includes('Syncing') ? 'Syncing...' : 'Sync to Server'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto h-full max-w-4xl">
          <Textarea
            value={content}
            onChange={e => handleContentChange(e.target.value)}
            className="min-h-full w-full resize-none rounded-lg border border-muted bg-background p-6 text-base focus-visible:border-primary focus-visible:ring-0"
            placeholder="Start writing your document..."
          />
        </div>
      </div>
    </div>
  );
}
