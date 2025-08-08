'use client';

import { useLocalStorage } from '@mantine/hooks';
import { Editor } from '@tiptap/core';
import { useCallback } from 'react';
import {
  createBackup,
  downloadFile,
  exportToHTML,
  exportToJSON,
  exportToMarkdown,
  type ExportOptions,
  type ExportResult,
} from '../utils/export-utils';

export type ExportFormat = 'markdown' | 'html' | 'json' | 'backup';

export interface ExportPreferences {
  defaultFormat: ExportFormat;
  includeMetadata: boolean;
  includeAuthor: boolean;
  autoDownload: boolean;
  customTemplates: Record<string, ExportTemplate>;
}

export interface ExportTemplate {
  id: string;
  name: string;
  format: ExportFormat;
  options: ExportOptions;
  customStyles?: string;
}

export interface ExportHistoryItem {
  id: string;
  title: string;
  format: ExportFormat;
  timestamp: string;
  filename: string;
  size: number; // in bytes
}

export function useExportManager(editor: Editor | null) {
  // User export preferences
  const [exportPreferences, setExportPreferences] = useLocalStorage<ExportPreferences>({
    key: 'notion-editor-export-preferences',
    defaultValue: {
      defaultFormat: 'markdown',
      includeMetadata: true,
      includeAuthor: true,
      autoDownload: true,
      customTemplates: {},
    },
    serialize: JSON.stringify,
    deserialize: value =>
      value === undefined
        ? {
            defaultFormat: 'markdown' as ExportFormat,
            includeMetadata: true,
            includeAuthor: true,
            autoDownload: true,
            customTemplates: {},
          }
        : JSON.parse(value),
  });

  // Export history for tracking
  const [exportHistory, setExportHistory] = useLocalStorage<ExportHistoryItem[]>({
    key: 'notion-editor-export-history',
    defaultValue: [],
    serialize: JSON.stringify,
    deserialize: value => (value === undefined ? [] : JSON.parse(value)),
  });

  // Default export templates
  const defaultTemplatesValue = {
    'blog-post': {
      id: 'blog-post',
      name: 'Blog Post',
      format: 'html' as ExportFormat,
      options: {
        title: 'Blog Post',
        includeMetadata: true,
      },
      customStyles: `
        body {
          font-family: Georgia, serif;
          line-height: 1.8;
          max-width: 700px;
        }
        h1 {
          color: #2c3e50;
          border-bottom: 3px solid #3498db;
          padding-bottom: 10px;
        }
      `,
    },
    documentation: {
      id: 'documentation',
      name: 'Documentation',
      format: 'markdown' as ExportFormat,
      options: {
        title: 'Documentation',
        includeMetadata: true,
      },
    },
    'meeting-notes': {
      id: 'meeting-notes',
      name: 'Meeting Notes',
      format: 'html' as ExportFormat,
      options: {
        title: 'Meeting Notes',
        includeMetadata: true,
      },
      customStyles: `
        body {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          color: #333;
        }
        h2 {
          background: #f8f9fa;
          padding: 8px 12px;
          margin-top: 24px;
        }
      `,
    },
  };

  const [defaultTemplates, _setDefaultTemplates] = useLocalStorage<Record<string, ExportTemplate>>({
    key: 'notion-editor-default-templates',
    defaultValue: defaultTemplatesValue,
    serialize: JSON.stringify,
    deserialize: value => (value === undefined ? defaultTemplatesValue : JSON.parse(value)),
  });

  // Export with user preferences
  const exportDocument = useCallback(
    (
      format?: ExportFormat,
      customOptions?: Partial<ExportOptions>,
      templateId?: string,
    ): ExportResult | null => {
      if (!editor) return null;

      const useFormat = format || exportPreferences.defaultFormat;
      const template = templateId
        ? exportPreferences.customTemplates[templateId] || defaultTemplates[templateId]
        : undefined;

      const baseOptions: ExportOptions = {
        title: 'Untitled Document',
        includeMetadata: exportPreferences.includeMetadata,
        timestamp: new Date(),
        ...customOptions,
      };

      // Apply template options if provided
      const finalOptions = template ? { ...baseOptions, ...template.options } : baseOptions;

      let result: ExportResult;

      switch (useFormat) {
        case 'markdown':
          result = exportToMarkdown(editor, finalOptions);
          break;
        case 'html':
          result = exportToHTML(editor, finalOptions);
          // Apply custom styles if from template
          if (template?.customStyles) {
            result.content = result.content.replace(
              '</style>',
              template.customStyles + '\n  </style>',
            );
          }
          break;
        case 'json':
          result = exportToJSON(editor, finalOptions);
          break;
        case 'backup':
          result = createBackup(editor, finalOptions);
          break;
        default:
          result = exportToMarkdown(editor, finalOptions);
      }

      // Add to export history
      const historyItem: ExportHistoryItem = {
        id: Date.now().toString(),
        title: finalOptions.title || 'Untitled Document',
        format: useFormat,
        timestamp: new Date().toISOString(),
        filename: result.filename,
        size: new Blob([result.content]).size,
      };

      setExportHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 exports

      // Auto-download if enabled
      if (exportPreferences.autoDownload) {
        downloadFile(result);
      }

      return result;
    },
    [editor, exportPreferences, defaultTemplates, setExportHistory],
  );

  // Quick export with current preferences
  const quickExport = useCallback(
    (title?: string) => {
      return exportDocument(exportPreferences.defaultFormat, { title });
    },
    [exportDocument, exportPreferences.defaultFormat],
  );

  // Export with specific template
  const exportWithTemplate = useCallback(
    (templateId: string, customOptions?: Partial<ExportOptions>) => {
      const template =
        exportPreferences.customTemplates[templateId] || defaultTemplates[templateId];
      if (!template) return null;

      return exportDocument(template.format, customOptions, templateId);
    },
    [exportDocument, exportPreferences.customTemplates, defaultTemplates],
  );

  // Template management
  const saveTemplate = useCallback(
    (template: ExportTemplate) => {
      setExportPreferences(prev => ({
        ...prev,
        customTemplates: {
          ...prev.customTemplates,
          [template.id]: template,
        },
      }));
    },
    [setExportPreferences],
  );

  const deleteTemplate = useCallback(
    (templateId: string) => {
      setExportPreferences(prev => {
        const updated = { ...prev };
        delete updated.customTemplates[templateId];
        return updated;
      });
    },
    [setExportPreferences],
  );

  // Get all available templates
  const getAllTemplates = useCallback(() => {
    return {
      ...defaultTemplates,
      ...exportPreferences.customTemplates,
    };
  }, [defaultTemplates, exportPreferences.customTemplates]);

  // Clear export history
  const clearExportHistory = useCallback(() => {
    setExportHistory([]);
  }, [setExportHistory]);

  // Get export statistics
  const getExportStats = useCallback(() => {
    const totalExports = exportHistory.length;
    const formatCounts = exportHistory.reduce(
      (acc, item) => {
        acc[item.format] = (acc[item.format] || 0) + 1;
        return acc;
      },
      {} as Record<ExportFormat, number>,
    );

    const totalSize = exportHistory.reduce((sum, item) => sum + item.size, 0);
    const avgSize = totalExports > 0 ? totalSize / totalExports : 0;

    return {
      totalExports,
      formatCounts,
      totalSize,
      avgSize,
      recentExports: exportHistory.slice(0, 5),
    };
  }, [exportHistory]);

  // Update preferences helper
  const updatePreferences = useCallback(
    (updates: Partial<ExportPreferences>) => {
      setExportPreferences(prev => ({ ...prev, ...updates }));
    },
    [setExportPreferences],
  );

  return {
    // Export functions
    exportDocument,
    quickExport,
    exportWithTemplate,

    // Template management
    saveTemplate,
    deleteTemplate,
    getAllTemplates,
    defaultTemplates,

    // Preferences
    exportPreferences,
    updatePreferences,

    // History
    exportHistory,
    clearExportHistory,
    getExportStats,

    // Available formats
    formats: ['markdown', 'html', 'json', 'backup'] as ExportFormat[],
  };
}
