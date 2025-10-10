"use client";

import {
  useDebouncedCallback,
  useLocalStorage,
  useSessionStorage,
} from "@mantine/hooks";
import { logError, logWarn } from "@repo/observability";
import { Editor } from "@tiptap/core";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";

export interface DocumentMeta {
  id: string;
  title: string;
  created: string;
  modified: string;
  wordCount: number;
  characterCount: number;
  version: number;
}

export interface SavedDocument extends DocumentMeta {
  content: {
    html: string;
    json: any;
    text: string;
  };
  settings?: {
    enableEmoji?: boolean;
    enableMentions?: boolean;
    showFloatingToolbar?: boolean;
  };
}

export interface AutoSaveOptions {
  enabled: boolean;
  interval: number; // milliseconds
  onAutoSave?: (document: SavedDocument) => void;
}

export interface DocumentPersistenceOptions {
  documentId?: string;
  title?: string;
  autoSave?: AutoSaveOptions;
  enableRecovery?: boolean;
  enableCompression?: boolean;
  storageQuotaWarning?: number;
  maxStorageSize?: number;
}

export function useDocumentPersistence(
  editor: Editor | null,
  options: DocumentPersistenceOptions = {},
) {
  const {
    documentId = nanoid(),
    title = "Untitled Document",
    autoSave = { enabled: true, interval: 30000 }, // 30 seconds
    enableRecovery = true,
    enableCompression: _enableCompression = false, // Disabled by default for now
    storageQuotaWarning = 80, // Warn at 80% storage usage
    maxStorageSize = 50 * 1024 * 1024, // 50MB default limit
  } = options;

  // Storage health monitoring
  const [storageHealth, setStorageHealth] = useState({
    available: true,
    usage: 0,
    quota: 0,
    percentage: 0,
  });

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSaveContentRef = useRef<string>("");

  // Storage monitoring utilities
  const checkStorageHealth = useCallback(async () => {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || maxStorageSize;
        const percentage = quota > 0 ? (used / quota) * 100 : 0;

        setStorageHealth({
          available: percentage < 95, // Consider unavailable if over 95%
          usage: used,
          quota,
          percentage,
        });

        // Warn if approaching storage limit
        if (percentage > storageQuotaWarning) {
          logWarn(
            `Storage usage at ${percentage.toFixed(1)}% (${Math.round(used / 1024 / 1024)}MB)`,
          );
        }
      }
    } catch (error) {
      logError("Failed to check storage health:", error);
    }
  }, [maxStorageSize, storageQuotaWarning]);

  // Enhanced serialization with error handling
  const optimizedSerialize = useCallback(
    (data: any): string => {
      try {
        const serialized = JSON.stringify(data);

        // Check if the serialized data is too large
        const sizeInBytes = new Blob([serialized]).size;
        if (sizeInBytes > maxStorageSize) {
          logWarn(
            `Document size (${Math.round(sizeInBytes / 1024)}KB) exceeds recommended limit`,
          );
        }

        return serialized;
      } catch (error) {
        logError("Failed to serialize data:", error);
        throw error;
      }
    },
    [maxStorageSize],
  );

  // Enhanced deserialization with error handling
  const optimizedDeserialize = useCallback(
    (value: string | undefined, fallback: any) => {
      if (value === undefined) return fallback;

      try {
        return JSON.parse(value);
      } catch (error) {
        logError("Failed to deserialize data, using fallback:", error);
        return fallback;
      }
    },
    [],
  );

  // Persistent storage for saved documents with optimized serialization
  const [savedDocuments, setSavedDocuments] = useLocalStorage<
    Record<string, SavedDocument>
  >({
    key: "notion-editor-documents",
    defaultValue: {},
    serialize: optimizedSerialize,
    deserialize: (value) => optimizedDeserialize(value, {}),
  });

  // Session storage for current editing state (recovery)
  const [currentDraft, setCurrentDraft] = useSessionStorage<{
    documentId: string;
    content: string;
    timestamp: string;
  } | null>({
    key: "notion-editor-current-draft",
    defaultValue: null,
    serialize: optimizedSerialize,
    deserialize: (value) => optimizedDeserialize(value, null),
  });

  // User preferences for auto-save
  const [autoSavePreferences, setAutoSavePreferences] =
    useLocalStorage<AutoSaveOptions>({
      key: "notion-editor-autosave-preferences",
      defaultValue: { enabled: true, interval: 30000 },
      serialize: optimizedSerialize,
      deserialize: (value) =>
        optimizedDeserialize(value, { enabled: true, interval: 30000 }),
    });

  // Recent documents for quick access
  const [recentDocuments, setRecentDocuments] = useLocalStorage<DocumentMeta[]>(
    {
      key: "notion-editor-recent-documents",
      defaultValue: [],
      serialize: optimizedSerialize,
      deserialize: (value) => optimizedDeserialize(value, []),
    },
  );

  // Save document manually
  const saveDocument = useCallback(
    (customTitle?: string, customSettings?: any): SavedDocument | null => {
      if (!editor) return null;

      const html = editor.getHTML();
      const json = editor.getJSON();
      const text = editor.getText();

      // Don't save if content hasn't changed
      if (html === lastSaveContentRef.current) {
        return savedDocuments[documentId] || null;
      }

      const now = new Date().toISOString();
      const existingDoc = savedDocuments[documentId];

      const document: SavedDocument = {
        id: documentId,
        title: customTitle || title,
        created: existingDoc?.created || now,
        modified: now,
        wordCount: text.split(/\s+/).filter((word) => word.length > 0).length,
        characterCount: text.length,
        version: (existingDoc?.version || 0) + 1,
        content: {
          html,
          json,
          text,
        },
        settings: customSettings,
      };

      // Update saved documents
      setSavedDocuments((prev) => ({
        ...prev,
        [documentId]: document,
      }));

      // Update recent documents
      setRecentDocuments((prev) => {
        const filtered = prev.filter((doc) => doc.id !== documentId);
        const updated = [
          {
            id: document.id,
            title: document.title,
            created: document.created,
            modified: document.modified,
            wordCount: document.wordCount,
            characterCount: document.characterCount,
            version: document.version,
          },
          ...filtered,
        ].slice(0, 10); // Keep only 10 most recent

        return updated;
      });

      lastSaveContentRef.current = html;

      // Clear recovery draft since we saved successfully
      if (currentDraft?.documentId === documentId) {
        setCurrentDraft(null);
      }

      return document;
    },
    [
      editor,
      documentId,
      title,
      savedDocuments,
      setSavedDocuments,
      setRecentDocuments,
      currentDraft,
      setCurrentDraft,
    ],
  );

  // Auto-save functionality with storage health check
  const performAutoSave = useCallback(async () => {
    if (!editor || !autoSavePreferences.enabled || !storageHealth.available)
      return;

    const html = editor.getHTML();

    // Only auto-save if content has changed
    if (html !== lastSaveContentRef.current && html.trim()) {
      try {
        // Check storage health before saving
        await checkStorageHealth();

        const savedDoc = saveDocument();
        if (savedDoc && autoSave.onAutoSave) {
          autoSave.onAutoSave(savedDoc);
        }
      } catch (error) {
        logError("Auto-save failed:", error);
      }
    }
  }, [
    editor,
    autoSavePreferences.enabled,
    storageHealth.available,
    saveDocument,
    autoSave,
    checkStorageHealth,
  ]);

  // Debounced auto-save to reduce storage operations
  const debouncedAutoSave = useDebouncedCallback(performAutoSave, 1000); // Debounce by 1 second

  // Set up auto-save timer
  useEffect(() => {
    if (!editor || !autoSavePreferences.enabled) return;

    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setInterval(
      debouncedAutoSave,
      autoSavePreferences.interval,
    );

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [editor, autoSavePreferences, debouncedAutoSave]);

  // Monitor storage health periodically
  useEffect(() => {
    checkStorageHealth(); // Initial check

    const healthCheckInterval = setInterval(checkStorageHealth, 60000); // Check every minute

    return () => clearInterval(healthCheckInterval);
  }, [checkStorageHealth]);

  // Recovery draft functionality
  useEffect(() => {
    if (!editor || !enableRecovery) return;

    const updateDraft = () => {
      const html = editor.getHTML();
      if (html.trim() && html !== lastSaveContentRef.current) {
        setCurrentDraft({
          documentId,
          content: html,
          timestamp: new Date().toISOString(),
        });
      }
    };

    // Save draft every 5 seconds of activity
    const draftTimer = setInterval(updateDraft, 5000);

    return () => clearInterval(draftTimer);
  }, [editor, documentId, enableRecovery, setCurrentDraft]);

  // Load document
  const loadDocument = useCallback(
    (docId: string): boolean => {
      const document = savedDocuments[docId];
      if (!document || !editor) return false;

      try {
        // Prefer JSON content for full fidelity
        if (document.content.json) {
          editor.commands.setContent(document.content.json);
        } else if (document.content.html) {
          editor.commands.setContent(document.content.html);
        }

        lastSaveContentRef.current = document.content.html;
        return true;
      } catch (error) {
        logError("Failed to load document:", error);
        return false;
      }
    },
    [savedDocuments, editor],
  );

  // Delete document
  const deleteDocument = useCallback(
    (docId: string): boolean => {
      if (!savedDocuments[docId]) return false;

      setSavedDocuments((prev) => {
        const updated = { ...prev };
        delete updated[docId];
        return updated;
      });

      setRecentDocuments((prev) => prev.filter((doc) => doc.id !== docId));

      return true;
    },
    [savedDocuments, setSavedDocuments, setRecentDocuments],
  );

  // Recovery functions
  const hasRecoveryDraft = currentDraft?.documentId === documentId;

  const recoverFromDraft = useCallback((): boolean => {
    if (!currentDraft || !editor || currentDraft.documentId !== documentId) {
      return false;
    }

    try {
      editor.commands.setContent(currentDraft.content);
      return true;
    } catch (error) {
      logError("Failed to recover from draft:", error);
      return false;
    }
  }, [currentDraft, editor, documentId]);

  const discardRecoveryDraft = useCallback(() => {
    if (currentDraft?.documentId === documentId) {
      setCurrentDraft(null);
    }
  }, [currentDraft, documentId, setCurrentDraft]);

  // Get document statistics
  const getDocumentStats = useCallback(() => {
    if (!editor) return null;

    const text = editor.getText();
    return {
      wordCount: text.split(/\s+/).filter((word) => word.length > 0).length,
      characterCount: text.length,
      characterCountNoSpaces: text.replace(/\s/g, "").length,
    };
  }, [editor]);

  return {
    // Document operations
    saveDocument,
    loadDocument,
    deleteDocument,

    // Auto-save
    autoSavePreferences,
    setAutoSavePreferences,
    performAutoSave,
    debouncedAutoSave,

    // Recovery
    hasRecoveryDraft,
    recoverFromDraft,
    discardRecoveryDraft,
    recoveryTimestamp: currentDraft?.timestamp,

    // Data
    savedDocuments,
    recentDocuments,
    currentDocument: savedDocuments[documentId],

    // Storage health
    storageHealth,
    checkStorageHealth,

    // Statistics
    getDocumentStats,

    // State
    documentId,
  };
}
