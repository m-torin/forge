"use client";

import { useLocalStorage } from "@mantine/hooks";
import { logInfo } from "@repo/observability";
import {
  IconAlertCircle,
  IconCheck,
  IconDeviceFloppy,
  IconDownload,
  IconFolder,
  IconMenu2,
  IconSettings,
  IconX,
} from "@tabler/icons-react";
import { Editor } from "@tiptap/core";
import { clsx } from "clsx";
import { useCallback, useMemo, useState } from "react";
import { useDocumentPersistence } from "../../hooks/use-document-persistence";
import { useExportManager } from "../../hooks/use-export-manager";
import { DocumentManager } from "./DocumentManager";
import { ExportTemplateManager } from "./ExportTemplateManager";
import { NotionEditor, type NotionEditorProps } from "./NotionEditor";
import { PrivacySettings } from "./PrivacySettings";

export interface SelfHostedNotionEditorProps
  extends Omit<NotionEditorProps, "onChange" | "onUpdate"> {
  documentId?: string;
  documentTitle?: string;
  onDocumentChange?: (documentId: string, title: string) => void;
  showSidebar?: boolean;
  enableDocumentManager?: boolean;
  enablePrivacySettings?: boolean;
  enableExportTemplates?: boolean;
  autoSaveInterval?: number;
}

export function SelfHostedNotionEditor({
  documentId: initialDocumentId,
  documentTitle = "Untitled Document",
  onDocumentChange,
  showSidebar = true,
  enableDocumentManager = true,
  enablePrivacySettings = true,
  enableExportTemplates = true,
  autoSaveInterval = 30000,
  className,
  ...editorProps
}: SelfHostedNotionEditorProps) {
  const [currentDocumentId, setCurrentDocumentId] = useState(
    initialDocumentId || `doc-${Date.now()}`,
  );
  const [currentTitle, setCurrentTitle] = useState(documentTitle);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<
    "documents" | "export" | "settings"
  >("documents");
  const [saveStatus, setSaveStatus] = useState<
    "saved" | "saving" | "error" | null
  >(null);

  // Document persistence with auto-save
  const {
    saveDocument,
    loadDocument,
    deleteDocument,
    savedDocuments,
    recentDocuments,
    currentDocument,
    hasRecoveryDraft,
    recoverFromDraft,
    discardRecoveryDraft,
    getDocumentStats,
  } = useDocumentPersistence(editor, {
    documentId: currentDocumentId,
    title: currentTitle,
    autoSave: {
      enabled: true,
      interval: autoSaveInterval,
      onAutoSave: () => {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(null), 2000);
      },
    },
    enableRecovery: true,
  });

  // Export manager
  const {
    exportDocument: _exportDocument,
    quickExport,
    exportWithTemplate,
    saveTemplate,
    deleteTemplate,
    getAllTemplates,
    defaultTemplates,
    exportPreferences,
    updatePreferences,
    exportHistory,
  } = useExportManager(editor);

  // UI preferences
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [uiPreferences, setUiPreferences] = useLocalStorage({
    key: "notion-editor-ui-preferences",
    defaultValue: {
      sidebarWidth: 320,
      showWordCount: true,
      compactMode: false,
    },
  });

  // Create new document
  const handleCreateNew = useCallback(() => {
    const newDocId = `doc-${Date.now()}`;
    const newTitle = "Untitled Document";

    setCurrentDocumentId(newDocId);
    setCurrentTitle(newTitle);

    if (editor) {
      editor.commands.setContent("");
    }

    onDocumentChange?.(newDocId, newTitle);
  }, [editor, onDocumentChange]);

  // Load existing document
  const handleLoadDocument = useCallback(
    (docId: string) => {
      const success = loadDocument(docId);
      if (success) {
        const doc = savedDocuments[docId];
        setCurrentDocumentId(docId);
        setCurrentTitle(doc.title);
        onDocumentChange?.(docId, doc.title);
        setSidebarOpen(false);
      }
    },
    [loadDocument, savedDocuments, onDocumentChange],
  );

  // Save current document
  const handleSaveDocument = useCallback(() => {
    setSaveStatus("saving");
    try {
      const savedDoc = saveDocument(currentTitle);
      if (savedDoc) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (_error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }, [saveDocument, currentTitle]);

  // Export document
  const handleExportDocument = useCallback(
    (docId?: string) => {
      if (docId && docId !== currentDocumentId) {
        // Export a different document - need to temporarily load it
        const doc = savedDocuments[docId];
        if (doc && editor) {
          const originalContent = editor.getHTML();
          editor.commands.setContent(doc.content.html);
          quickExport(doc.title);
          editor.commands.setContent(originalContent);
        }
      } else {
        // Export current document
        quickExport(currentTitle);
      }
    },
    [currentDocumentId, currentTitle, savedDocuments, editor, quickExport],
  );

  // Calculate storage info for privacy settings
  const storageInfo = useMemo(() => {
    const documentsSize = Object.values(savedDocuments).reduce((size, doc) => {
      return size + JSON.stringify(doc).length;
    }, 0);

    const historySize = 1000; // Placeholder for history data
    const preferencesSize = 500; // Placeholder for preferences data

    return {
      documentsCount: Object.keys(savedDocuments).length,
      documentsSize,
      historyCount: 10, // Placeholder
      historySize,
      preferencesSize,
      totalSize: documentsSize + historySize + preferencesSize,
    };
  }, [savedDocuments]);

  // Handle editor updates
  const handleEditorUpdate = useCallback((updatedEditor: Editor) => {
    setEditor(updatedEditor);
  }, []);

  // Document stats
  const documentStats = getDocumentStats();

  return (
    <div
      className={clsx(
        "self-hosted-notion-editor flex h-screen bg-gray-50",
        className,
      )}
    >
      {showSidebar && (
        <>
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSidebarOpen(false);
                }
              }}
              aria-label="Close sidebar"
            />
          )}

          <div
            className={clsx(
              "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-transform lg:static lg:translate-x-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}
            style={{ width: uiPreferences.sidebarWidth }}
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActivePanel("documents")}
                  className={clsx(
                    "rounded-lg p-2 transition-colors",
                    activePanel === "documents"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100",
                  )}
                  title="Documents"
                >
                  <IconFolder size={18} />
                </button>
                {enableExportTemplates && (
                  <button
                    onClick={() => setActivePanel("export")}
                    className={clsx(
                      "rounded-lg p-2 transition-colors",
                      activePanel === "export"
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-600 hover:bg-gray-100",
                    )}
                    title="Export Templates"
                  >
                    <IconDownload size={18} />
                  </button>
                )}
                <button
                  onClick={() => setActivePanel("settings")}
                  className={clsx(
                    "rounded-lg p-2 transition-colors",
                    activePanel === "settings"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100",
                  )}
                  title="Settings"
                >
                  <IconSettings size={18} />
                </button>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {activePanel === "documents" && enableDocumentManager && (
                <DocumentManager
                  documents={savedDocuments}
                  recentDocuments={recentDocuments}
                  onCreateNew={handleCreateNew}
                  onLoadDocument={handleLoadDocument}
                  onDeleteDocument={deleteDocument}
                  onExportDocument={handleExportDocument}
                />
              )}

              {activePanel === "export" && enableExportTemplates && (
                <ExportTemplateManager
                  templates={getAllTemplates()}
                  defaultTemplates={defaultTemplates}
                  preferences={exportPreferences}
                  exportHistory={exportHistory}
                  onSaveTemplate={saveTemplate}
                  onDeleteTemplate={deleteTemplate}
                  onUpdatePreferences={updatePreferences}
                  onExportWithTemplate={(templateId, title) => {
                    if (editor) {
                      exportWithTemplate(templateId, {
                        title: title || currentDocument?.title,
                      });
                    }
                  }}
                  onQuickExport={(title) => {
                    if (editor) {
                      quickExport(title || currentDocument?.title);
                    }
                  }}
                />
              )}

              {activePanel === "settings" && enablePrivacySettings && (
                <PrivacySettings
                  storageInfo={storageInfo}
                  onClearAllData={() => {
                    // Implementation would clear all localStorage
                    logInfo("Clear all data");
                  }}
                  onExportAllData={() => {
                    // Implementation would export all data
                    logInfo("Export all data");
                  }}
                  onClearHistory={() => {
                    logInfo("Clear history");
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            {showSidebar && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <IconMenu2 size={18} />
              </button>
            )}

            <input
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              className="rounded border-none bg-transparent px-2 py-1 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Document title..."
            />
          </div>

          <div className="flex items-center gap-3">
            {documentStats && uiPreferences.showWordCount && (
              <div className="text-sm text-gray-500">
                {documentStats.wordCount} words
              </div>
            )}

            {saveStatus && (
              <div
                className={clsx(
                  "flex items-center gap-1 rounded px-2 py-1 text-sm",
                  saveStatus === "saved" && "bg-green-50 text-green-600",
                  saveStatus === "saving" && "bg-blue-50 text-blue-600",
                  saveStatus === "error" && "bg-red-50 text-red-600",
                )}
              >
                {saveStatus === "saved" && <IconCheck size={14} />}
                {saveStatus === "error" && <IconAlertCircle size={14} />}
                {saveStatus === "saved" && "Saved"}
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "error" && "Save failed"}
              </div>
            )}

            <button
              onClick={handleSaveDocument}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50"
              title="Save Document"
            >
              <IconDeviceFloppy size={16} />
              Save
            </button>

            <button
              onClick={() => handleExportDocument()}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors hover:bg-gray-50"
              title="Export Document"
            >
              <IconDownload size={16} />
              Export
            </button>
          </div>
        </div>

        {hasRecoveryDraft && (
          <div className="border-b border-yellow-200 bg-yellow-50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <IconAlertCircle size={16} />
                Unsaved changes detected. Would you like to recover your work?
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={recoverFromDraft}
                  className="rounded bg-yellow-600 px-3 py-1 text-sm text-white transition-colors hover:bg-yellow-700"
                >
                  Recover
                </button>
                <button
                  onClick={discardRecoveryDraft}
                  className="px-3 py-1 text-sm text-yellow-600 transition-colors hover:text-yellow-800"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <NotionEditor
            {...editorProps}
            content={currentDocument?.content.html}
            onUpdate={handleEditorUpdate}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
