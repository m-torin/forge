'use client';

import { ActionIcon, Badge, Button, Group, Loader, Menu, Stack, TextInput } from '@mantine/core';
import {
  IconClock,
  IconDeviceFloppy,
  IconDots,
  IconDownload,
  IconReload,
} from '@tabler/icons-react';
import { useAtom, useAtomValue } from 'jotai';
import type { FC } from 'react';
import { useCallback, useEffect } from 'react';
import {
  currentDocumentAtom,
  currentDocumentIdAtom,
  documentsAtom,
  editorAtom,
  isDirtyAtom,
  isSavingAtom,
  lastSavedAtom,
} from '../../state';
import type { DocumentMetadata, DocumentStorageAdapter } from '../../types';

export interface DocumentManagerProps {
  /** Storage adapter for loading/saving documents */
  storageAdapter: DocumentStorageAdapter;
  /** Auto-save interval in milliseconds (0 to disable) */
  autoSaveInterval?: number;
  /** Show document title editor */
  showTitleEditor?: boolean;
  /** Show save/load buttons */
  showActions?: boolean;
  /** Show document status */
  showStatus?: boolean;
  /** On document loaded */
  onDocumentLoaded?: (doc: DocumentMetadata) => void;
  /** On document saved */
  onDocumentSaved?: (doc: DocumentMetadata) => void;
  /** On export */
  onExport?: (format: 'html' | 'json' | 'markdown') => void;
}

/**
 * DocumentManager component
 *
 * Manages document metadata, loading, saving, and auto-save
 *
 * @example
 * ```tsx
 * const storageAdapter: DocumentStorageAdapter = {
 *   load: async (id) => { ... },
 *   save: async (doc) => { ... },
 *   delete: async (id) => { ... },
 * };
 *
 * <EditorRoot>
 *   <DocumentManager
 *     storageAdapter={storageAdapter}
 *     autoSaveInterval={30000}
 *     showTitleEditor
 *   />
 *   <EditorContent extensions={extensions} />
 * </EditorRoot>
 * ```
 */
export const DocumentManager: FC<DocumentManagerProps> = ({
  storageAdapter,
  autoSaveInterval = 0,
  showTitleEditor = true,
  showActions = true,
  showStatus = true,
  onDocumentLoaded,
  onDocumentSaved,
  onExport,
}) => {
  const editor = useAtomValue(editorAtom);
  const currentDocument = useAtomValue(currentDocumentAtom);
  const [, setDocuments] = useAtom(documentsAtom);
  const [currentDocumentId, setCurrentDocumentId] = useAtom(currentDocumentIdAtom);
  const isDirty = useAtomValue(isDirtyAtom);
  const [isSaving, setIsSaving] = useAtom(isSavingAtom);
  const [lastSaved, setLastSaved] = useAtom(lastSavedAtom);

  const upsertDocument = useCallback(
    (doc: DocumentMetadata) => {
      setDocuments(prev => {
        const index = prev.findIndex(item => item.id === doc.id);
        if (index === -1) {
          return [...prev, doc];
        }
        const next = [...prev];
        next[index] = doc;
        return next;
      });
      setCurrentDocumentId(doc.id);
    },
    [setDocuments, setCurrentDocumentId],
  );

  const handleSave = useCallback(async () => {
    if (!editor || !currentDocument || isSaving) return;

    setIsSaving(true);
    try {
      const updatedDoc: DocumentMetadata = {
        ...currentDocument,
        content: {
          html: editor.getHTML(),
          json: editor.getJSON(),
          text: editor.getText(),
        },
        updatedAt: new Date(),
      };

      await storageAdapter.save(updatedDoc);
      upsertDocument(updatedDoc);
      setLastSaved(new Date());
      onDocumentSaved?.(updatedDoc);
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsSaving(false);
    }
  }, [
    editor,
    currentDocument,
    isSaving,
    storageAdapter,
    setIsSaving,
    upsertDocument,
    setLastSaved,
    onDocumentSaved,
  ]);

  // Auto-save effect
  useEffect(() => {
    if (autoSaveInterval === 0 || !isDirty || !currentDocument) {
      return;
    }

    const timer = setTimeout(() => {
      void handleSave();
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [autoSaveInterval, isDirty, currentDocument, handleSave]);

  const handleLoad = async (id: string) => {
    try {
      const doc = await storageAdapter.load(id);
      upsertDocument(doc);
      if (editor && doc.content) {
        editor.commands.setContent(doc.content.json || doc.content.html || '');
      }
      onDocumentLoaded?.(doc);
    } catch (error) {
      console.error('Failed to load document:', error);
    }
  };

  const handleExport = (format: 'html' | 'json' | 'markdown') => {
    if (!editor) return;

    let content: string;
    let filename: string;

    switch (format) {
      case 'html':
        content = editor.getHTML();
        filename = `${currentDocument?.title || 'document'}.html`;
        break;
      case 'json':
        content = JSON.stringify(editor.getJSON(), null, 2);
        filename = `${currentDocument?.title || 'document'}.json`;
        break;
      case 'markdown':
        // Requires markdown extension
        content = (editor as any).storage.markdown?.getMarkdown?.() || editor.getText();
        filename = `${currentDocument?.title || 'document'}.md`;
        break;
      default:
        return;
    }

    // Create download link
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    onExport?.(format);
  };

  const getStatusColor = () => {
    if (isSaving) return 'blue';
    if (isDirty) return 'orange';
    return 'green';
  };

  const getStatusText = () => {
    if (isSaving) return 'Saving...';
    if (isDirty) return 'Unsaved changes';
    if (lastSaved) {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      if (seconds < 60) return 'Saved just now';
      if (seconds < 3600) return `Saved ${Math.floor(seconds / 60)}m ago`;
      return `Saved ${Math.floor(seconds / 3600)}h ago`;
    }
    return 'Saved';
  };

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        {showTitleEditor && currentDocument && (
          <TextInput
            value={currentDocument.title}
            onChange={e => {
              const newTitle = e.currentTarget.value;
              if (!currentDocumentId) return;
              setDocuments(prev =>
                prev.map(doc =>
                  doc.id === currentDocumentId
                    ? {
                        ...doc,
                        title: newTitle,
                        updatedAt: doc.updatedAt ?? new Date(),
                      }
                    : doc,
                ),
              );
            }}
            placeholder="Untitled document"
            variant="unstyled"
            size="lg"
            fw={600}
            style={{ flex: 1 }}
          />
        )}

        {showActions && (
          <Group gap="xs">
            {showStatus && (
              <Group gap="xs">
                {isSaving && <Loader size="xs" />}
                <Badge color={getStatusColor()} variant="light" size="sm">
                  <Group gap={4}>
                    <IconClock size={12} />
                    {getStatusText()}
                  </Group>
                </Badge>
              </Group>
            )}

            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              variant="light"
            >
              Save
            </Button>

            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="light">
                  <IconDots size={18} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Actions</Menu.Label>
                <Menu.Item
                  leftSection={<IconReload size={14} />}
                  onClick={() => currentDocumentId && handleLoad(currentDocumentId)}
                >
                  Reload
                </Menu.Item>

                <Menu.Divider />

                <Menu.Label>Export</Menu.Label>
                <Menu.Item
                  leftSection={<IconDownload size={14} />}
                  onClick={() => handleExport('html')}
                >
                  Export as HTML
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconDownload size={14} />}
                  onClick={() => handleExport('json')}
                >
                  Export as JSON
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconDownload size={14} />}
                  onClick={() => handleExport('markdown')}
                >
                  Export as Markdown
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        )}
      </Group>
    </Stack>
  );
};
