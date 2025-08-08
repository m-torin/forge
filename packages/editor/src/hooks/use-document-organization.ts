'use client';

import { useLocalStorage, useStateHistory } from '@mantine/hooks';
import { nanoid } from 'nanoid';
import { useCallback, useMemo } from 'react';
import type { SavedDocument } from './use-document-persistence';

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created: string;
  modified: string;
  parentId?: string;
  documentIds: string[];
}

export interface DocumentTag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  created: string;
  documentCount: number;
}

export interface DocumentMetadata {
  documentId: string;
  folderId?: string;
  tagIds: string[];
  isPinned: boolean;
  isArchived: boolean;
  lastAccessed: string;
  accessCount: number;
}

export interface FolderTreeNode extends DocumentFolder {
  children: FolderTreeNode[];
  depth: number;
}

export interface UseDocumentOrganizationOptions {
  enableFolders?: boolean;
  enableTags?: boolean;
  enableArchiving?: boolean;
  enablePinning?: boolean;
  maxFolderDepth?: number;
}

export interface OrganizationAction {
  type:
    | 'move_document'
    | 'create_folder'
    | 'delete_folder'
    | 'create_tag'
    | 'delete_tag'
    | 'add_tag'
    | 'remove_tag'
    | 'pin_document'
    | 'archive_document';
  timestamp: string;
  data: any;
  description: string;
}

export function useDocumentOrganization(
  documents: Record<string, SavedDocument>,
  options: UseDocumentOrganizationOptions = {},
) {
  const {
    enableFolders = true,
    enableTags = true,
    enableArchiving = true,
    enablePinning = true,
    maxFolderDepth = 5,
  } = options;

  // Folders storage
  const [folders, setFolders] = useLocalStorage<Record<string, DocumentFolder>>({
    key: 'notion-editor-folders',
    defaultValue: {},
    serialize: JSON.stringify,
    deserialize: value => (value === undefined ? {} : JSON.parse(value)),
  });

  // Tags storage
  const [tags, setTags] = useLocalStorage<Record<string, DocumentTag>>({
    key: 'notion-editor-tags',
    defaultValue: {},
    serialize: JSON.stringify,
    deserialize: value => (value === undefined ? {} : JSON.parse(value)),
  });

  // Document metadata storage
  const [documentMetadata, setDocumentMetadata] = useLocalStorage<Record<string, DocumentMetadata>>(
    {
      key: 'notion-editor-document-metadata',
      defaultValue: {},
      serialize: JSON.stringify,
      deserialize: value => (value === undefined ? {} : JSON.parse(value)),
    },
  );

  // State history for undo/redo functionality

  const [lastAction, actionHandlers, actionHistory] = useStateHistory<OrganizationAction | null>(
    null,
  );

  // Helper function to record actions for undo/redo
  const recordAction = useCallback(
    (type: OrganizationAction['type'], data: any, description: string) => {
      const action: OrganizationAction = {
        type,
        timestamp: new Date().toISOString(),
        data,
        description,
      };
      actionHandlers.set(action);
    },
    [actionHandlers],
  );

  // Create folder
  const createFolder = useCallback(
    (
      name: string,
      options: {
        description?: string;
        color?: string;
        parentId?: string;
      } = {},
    ): DocumentFolder => {
      const { description, color, parentId } = options;

      // Check folder depth
      if (parentId && enableFolders) {
        const depth = getFolderDepth(parentId, folders);
        if (depth >= maxFolderDepth) {
          throw new Error(`Maximum folder depth of ${maxFolderDepth} exceeded`);
        }
      }

      const now = new Date().toISOString();
      const folder: DocumentFolder = {
        id: nanoid(),
        name: name.trim(),
        description,
        color,
        created: now,
        modified: now,
        parentId,
        documentIds: [],
      };

      setFolders(prev => ({
        ...prev,
        [folder.id]: folder,
      }));

      // Record action for undo/redo
      recordAction(
        'create_folder',
        { folderId: folder.id, folder },
        `Created folder "${folder.name}"`,
      );

      return folder;
    },
    [folders, setFolders, maxFolderDepth, enableFolders, recordAction],
  );

  // Update folder
  const updateFolder = useCallback(
    (
      folderId: string,
      updates: Partial<Pick<DocumentFolder, 'name' | 'description' | 'color'>>,
    ): boolean => {
      const folder = folders[folderId];
      if (!folder) return false;

      setFolders(prev => ({
        ...prev,
        [folderId]: {
          ...folder,
          ...updates,
          modified: new Date().toISOString(),
        },
      }));

      return true;
    },
    [folders, setFolders],
  );

  // Delete folder
  const deleteFolder = useCallback(
    (folderId: string, moveDocumentsToParent = true): boolean => {
      const folder = folders[folderId];
      if (!folder) return false;

      // Handle documents in the folder
      if (folder.documentIds.length > 0) {
        if (moveDocumentsToParent) {
          // Move documents to parent folder or root
          setDocumentMetadata(prev => {
            const updated = { ...prev };
            folder.documentIds.forEach(docId => {
              if (updated[docId]) {
                updated[docId] = {
                  ...updated[docId],
                  folderId: folder.parentId,
                };
              }
            });
            return updated;
          });
        } else {
          // Remove folder reference from documents
          setDocumentMetadata(prev => {
            const updated = { ...prev };
            folder.documentIds.forEach(docId => {
              if (updated[docId]) {
                updated[docId] = {
                  ...updated[docId],
                  folderId: undefined,
                };
              }
            });
            return updated;
          });
        }
      }

      // Handle child folders
      const childFolders = Object.values(folders).filter(f => f.parentId === folderId);
      childFolders.forEach(childFolder => {
        if (moveDocumentsToParent) {
          updateFolder(childFolder.id, { parentId: folder.parentId } as any);
        } else {
          deleteFolder(childFolder.id, false);
        }
      });

      // Remove folder
      setFolders(prev => {
        const updated = { ...prev };
        delete updated[folderId];
        return updated;
      });

      return true;
    },
    [folders, setFolders, setDocumentMetadata, updateFolder],
  );

  // Create tag
  const createTag = useCallback(
    (
      name: string,
      options: {
        color?: string;
        description?: string;
      } = {},
    ): DocumentTag => {
      const { color, description } = options;
      const now = new Date().toISOString();

      const tag: DocumentTag = {
        id: nanoid(),
        name: name.trim(),
        color,
        description,
        created: now,
        documentCount: 0,
      };

      setTags(prev => ({
        ...prev,
        [tag.id]: tag,
      }));

      return tag;
    },
    [setTags],
  );

  // Update tag
  const updateTag = useCallback(
    (
      tagId: string,
      updates: Partial<Pick<DocumentTag, 'name' | 'color' | 'description'>>,
    ): boolean => {
      const tag = tags[tagId];
      if (!tag) return false;

      setTags(prev => ({
        ...prev,
        [tagId]: {
          ...tag,
          ...updates,
        },
      }));

      return true;
    },
    [tags, setTags],
  );

  // Delete tag
  const deleteTag = useCallback(
    (tagId: string): boolean => {
      const tag = tags[tagId];
      if (!tag) return false;

      // Remove tag from all documents
      setDocumentMetadata(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(docId => {
          const metadata = updated[docId];
          if (metadata.tagIds.includes(tagId)) {
            updated[docId] = {
              ...metadata,
              tagIds: metadata.tagIds.filter(id => id !== tagId),
            };
          }
        });
        return updated;
      });

      // Remove tag
      setTags(prev => {
        const updated = { ...prev };
        delete updated[tagId];
        return updated;
      });

      return true;
    },
    [tags, setTags, setDocumentMetadata],
  );

  // Move document to folder
  const moveDocumentToFolder = useCallback(
    (documentId: string, folderId?: string): boolean => {
      if (!documents[documentId]) return false;
      if (folderId && !folders[folderId]) return false;

      const currentMetadata = documentMetadata[documentId];
      const now = new Date().toISOString();

      // Update document metadata
      setDocumentMetadata(prev => ({
        ...prev,
        [documentId]: {
          documentId,
          folderId,
          tagIds: currentMetadata?.tagIds || [],
          isPinned: currentMetadata?.isPinned || false,
          isArchived: currentMetadata?.isArchived || false,
          lastAccessed: now,
          accessCount: (currentMetadata?.accessCount || 0) + 1,
        },
      }));

      // Update folder document lists
      setFolders(prev => {
        const updated = { ...prev };

        // Remove from old folder
        if (currentMetadata?.folderId) {
          const oldFolder = updated[currentMetadata.folderId];
          if (oldFolder) {
            updated[currentMetadata.folderId] = {
              ...oldFolder,
              documentIds: oldFolder.documentIds.filter(id => id !== documentId),
              modified: now,
            };
          }
        }

        // Add to new folder
        if (folderId) {
          const newFolder = updated[folderId];
          if (newFolder && !newFolder.documentIds.includes(documentId)) {
            updated[folderId] = {
              ...newFolder,
              documentIds: [...newFolder.documentIds, documentId],
              modified: now,
            };
          }
        }

        return updated;
      });

      // Record action for undo/redo
      const document = documents[documentId];
      const oldFolderName = currentMetadata?.folderId
        ? folders[currentMetadata.folderId]?.name
        : 'Root';
      const newFolderName = folderId ? folders[folderId]?.name : 'Root';
      recordAction(
        'move_document',
        {
          documentId,
          oldFolderId: currentMetadata?.folderId,
          newFolderId: folderId,
        },
        `Moved "${document?.title}" from "${oldFolderName}" to "${newFolderName}"`,
      );

      return true;
    },
    [documents, folders, documentMetadata, setDocumentMetadata, setFolders, recordAction],
  );

  // Add tag to document
  const addTagToDocument = useCallback(
    (documentId: string, tagId: string): boolean => {
      if (!documents[documentId] || !tags[tagId]) return false;

      const currentMetadata = documentMetadata[documentId];
      if (currentMetadata?.tagIds.includes(tagId)) return true; // Already tagged

      const now = new Date().toISOString();

      setDocumentMetadata(prev => ({
        ...prev,
        [documentId]: {
          documentId,
          folderId: currentMetadata?.folderId,
          tagIds: [...(currentMetadata?.tagIds || []), tagId],
          isPinned: currentMetadata?.isPinned || false,
          isArchived: currentMetadata?.isArchived || false,
          lastAccessed: now,
          accessCount: (currentMetadata?.accessCount || 0) + 1,
        },
      }));

      // Update tag document count
      setTags(prev => ({
        ...prev,
        [tagId]: {
          ...prev[tagId],
          documentCount: prev[tagId].documentCount + 1,
        },
      }));

      // Record action for undo/redo
      const document = documents[documentId];
      const tag = tags[tagId];
      recordAction(
        'add_tag',
        { documentId, tagId },
        `Added tag "${tag?.name}" to "${document?.title}"`,
      );

      return true;
    },
    [documents, tags, documentMetadata, setDocumentMetadata, setTags, recordAction],
  );

  // Remove tag from document
  const removeTagFromDocument = useCallback(
    (documentId: string, tagId: string): boolean => {
      const currentMetadata = documentMetadata[documentId];
      if (!currentMetadata?.tagIds.includes(tagId)) return false;

      setDocumentMetadata(prev => ({
        ...prev,
        [documentId]: {
          ...currentMetadata,
          tagIds: currentMetadata.tagIds.filter(id => id !== tagId),
        },
      }));

      // Update tag document count
      setTags(prev => ({
        ...prev,
        [tagId]: {
          ...prev[tagId],
          documentCount: Math.max(0, prev[tagId].documentCount - 1),
        },
      }));

      return true;
    },
    [documentMetadata, setDocumentMetadata, setTags],
  );

  // Toggle document pin status
  const toggleDocumentPin = useCallback(
    (documentId: string): boolean => {
      if (!documents[documentId]) return false;

      const currentMetadata = documentMetadata[documentId];
      const now = new Date().toISOString();

      setDocumentMetadata(prev => ({
        ...prev,
        [documentId]: {
          documentId,
          folderId: currentMetadata?.folderId,
          tagIds: currentMetadata?.tagIds || [],
          isPinned: !currentMetadata?.isPinned,
          isArchived: currentMetadata?.isArchived || false,
          lastAccessed: now,
          accessCount: (currentMetadata?.accessCount || 0) + 1,
        },
      }));

      // Record action for undo/redo
      const document = documents[documentId];
      const action = !currentMetadata?.isPinned ? 'pinned' : 'unpinned';
      recordAction(
        'pin_document',
        { documentId, wasPinned: currentMetadata?.isPinned || false },
        `${action === 'pinned' ? 'Pinned' : 'Unpinned'} "${document?.title}"`,
      );

      return true;
    },
    [documents, documentMetadata, setDocumentMetadata, recordAction],
  );

  // Toggle document archive status
  const toggleDocumentArchive = useCallback(
    (documentId: string): boolean => {
      if (!documents[documentId]) return false;

      const currentMetadata = documentMetadata[documentId];
      const now = new Date().toISOString();

      setDocumentMetadata(prev => ({
        ...prev,
        [documentId]: {
          documentId,
          folderId: currentMetadata?.folderId,
          tagIds: currentMetadata?.tagIds || [],
          isPinned: currentMetadata?.isPinned || false,
          isArchived: !currentMetadata?.isArchived,
          lastAccessed: now,
          accessCount: (currentMetadata?.accessCount || 0) + 1,
        },
      }));

      // Record action for undo/redo
      const document = documents[documentId];
      const action = !currentMetadata?.isArchived ? 'archived' : 'unarchived';
      recordAction(
        'archive_document',
        { documentId, wasArchived: currentMetadata?.isArchived || false },
        `${action === 'archived' ? 'Archived' : 'Unarchived'} "${document?.title}"`,
      );

      return true;
    },
    [documents, documentMetadata, setDocumentMetadata, recordAction],
  );

  // Helper function to get folder depth
  const getFolderDepth = useCallback(
    (folderId: string, foldersMap: Record<string, DocumentFolder>): number => {
      let depth = 0;
      let currentFolder = foldersMap[folderId];

      while (currentFolder?.parentId && depth < maxFolderDepth) {
        depth++;
        currentFolder = foldersMap[currentFolder.parentId];
      }

      return depth;
    },
    [maxFolderDepth],
  );

  // Build folder tree
  const folderTree = useMemo((): FolderTreeNode[] => {
    const buildTree = (parentId?: string, depth = 0): FolderTreeNode[] => {
      return Object.values(folders)
        .filter(folder => folder.parentId === parentId)
        .map(folder => ({
          ...folder,
          children: buildTree(folder.id, depth + 1),
          depth,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    };

    return buildTree();
  }, [folders]);

  // Get documents by folder
  const getDocumentsByFolder = useCallback(
    (folderId?: string) => {
      return Object.values(documents).filter(doc => {
        const metadata = documentMetadata[doc.id];
        return metadata?.folderId === folderId;
      });
    },
    [documents, documentMetadata],
  );

  // Get documents by tag
  const getDocumentsByTag = useCallback(
    (tagId: string) => {
      return Object.values(documents).filter(doc => {
        const metadata = documentMetadata[doc.id];
        return metadata?.tagIds.includes(tagId);
      });
    },
    [documents, documentMetadata],
  );

  // Get pinned documents
  const getPinnedDocuments = useCallback(() => {
    return Object.values(documents).filter(doc => {
      const metadata = documentMetadata[doc.id];
      return metadata?.isPinned;
    });
  }, [documents, documentMetadata]);

  // Get archived documents
  const getArchivedDocuments = useCallback(() => {
    return Object.values(documents).filter(doc => {
      const metadata = documentMetadata[doc.id];
      return metadata?.isArchived;
    });
  }, [documents, documentMetadata]);

  // Get unorganized documents (no folder, no tags)
  const getUnorganizedDocuments = useCallback(() => {
    return Object.values(documents).filter(doc => {
      const metadata = documentMetadata[doc.id];
      return !metadata?.folderId && (!metadata?.tagIds || metadata.tagIds.length === 0);
    });
  }, [documents, documentMetadata]);

  // Update tag document counts
  const updateTagCounts = useCallback(() => {
    const tagCounts: Record<string, number> = {};

    Object.values(documentMetadata).forEach(metadata => {
      metadata.tagIds.forEach(tagId => {
        tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
      });
    });

    setTags(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(tagId => {
        updated[tagId] = {
          ...updated[tagId],
          documentCount: tagCounts[tagId] || 0,
        };
      });
      return updated;
    });
  }, [documentMetadata, setTags]);

  // Undo/Redo operations
  const undoAction = useCallback(() => {
    if (!lastAction) return false;

    try {
      switch (lastAction.type) {
        case 'move_document': {
          const { documentId, oldFolderId } = lastAction.data;
          return moveDocumentToFolder(documentId, oldFolderId);
        }
        case 'add_tag': {
          const { documentId, tagId } = lastAction.data;
          return removeTagFromDocument(documentId, tagId);
        }
        case 'pin_document': {
          const { documentId } = lastAction.data;
          return toggleDocumentPin(documentId);
        }
        case 'archive_document': {
          const { documentId } = lastAction.data;
          return toggleDocumentArchive(documentId);
        }
        case 'create_folder': {
          const { folderId } = lastAction.data;
          return deleteFolder(folderId, false);
        }
        default:
          return false;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to undo action:', error);
      return false;
    }
  }, [
    lastAction,
    moveDocumentToFolder,
    removeTagFromDocument,
    toggleDocumentPin,
    toggleDocumentArchive,
    deleteFolder,
  ]);

  const redoAction = useCallback(() => {
    return actionHandlers.forward();
  }, [actionHandlers]);

  const clearActionHistory = useCallback(() => {
    actionHandlers.reset();
  }, [actionHandlers]);

  return {
    // Folders
    folders,
    folderTree,
    createFolder,
    updateFolder,
    deleteFolder,
    moveDocumentToFolder,
    getDocumentsByFolder,

    // Tags
    tags,
    createTag,
    updateTag,
    deleteTag,
    addTagToDocument,
    removeTagFromDocument,
    getDocumentsByTag,
    updateTagCounts,

    // Document metadata
    documentMetadata,
    toggleDocumentPin,
    toggleDocumentArchive,
    getPinnedDocuments,
    getArchivedDocuments,
    getUnorganizedDocuments,

    // Utilities
    getFolderDepth,

    // Undo/Redo
    undoAction,
    redoAction,
    clearActionHistory,
    lastAction,
    actionHistory,
    canUndo: lastAction !== null && actionHistory.current > 0,
    canRedo: actionHistory.current < actionHistory.history.length - 1,

    // Options
    enableFolders,
    enableTags,
    enableArchiving,
    enablePinning,
    maxFolderDepth,
  };
}
