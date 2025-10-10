"use client";

import {
  IconArchive,
  IconBrandHtml5,
  IconCheck,
  IconCode,
  IconCopy,
  IconDownload,
  IconEdit,
  IconEye,
  IconFileText,
  IconPlus,
  IconSettings,
  IconStar,
  IconStarFilled,
  IconTemplate,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { clsx } from "clsx";
import { useMemo, useState } from "react";
import type {
  ExportFormat,
  ExportHistoryItem,
  ExportPreferences,
  ExportTemplate,
} from "../../hooks/use-export-manager";

interface ExportTemplateManagerProps {
  templates: Record<string, ExportTemplate>;
  defaultTemplates: Record<string, ExportTemplate>;
  preferences: ExportPreferences;
  exportHistory: ExportHistoryItem[];
  onSaveTemplate: (template: ExportTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onUpdatePreferences: (updates: Partial<ExportPreferences>) => void;
  onExportWithTemplate: (templateId: string, title?: string) => void;
  onQuickExport: (title?: string) => void;
  className?: string;
}

type ViewMode = "templates" | "preferences" | "history";

const FORMAT_ICONS = {
  markdown: IconFileText,
  html: IconBrandHtml5,
  json: IconCode,
  backup: IconArchive,
} as const;

const FORMAT_COLORS = {
  markdown: "#4F46E5", // indigo
  html: "#DC2626", // red
  json: "#059669", // green
  backup: "#7C3AED", // purple
} as const;

export function ExportTemplateManager({
  templates,
  defaultTemplates,
  preferences,
  exportHistory,
  onSaveTemplate,
  onDeleteTemplate,
  onUpdatePreferences,
  onExportWithTemplate,
  onQuickExport,
  className,
}: ExportTemplateManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("templates");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExportTemplate | null>(
    null,
  );
  const [previewTemplate, setPreviewTemplate] = useState<ExportTemplate | null>(
    null,
  );

  // Combine and categorize templates
  const { userTemplates, systemTemplates } = useMemo(() => {
    const user: ExportTemplate[] = [];
    const system: ExportTemplate[] = [];

    Object.values(templates).forEach((template) => {
      if (defaultTemplates[template.id]) {
        system.push(template);
      } else {
        user.push(template);
      }
    });

    return { userTemplates: user, systemTemplates: system };
  }, [templates, defaultTemplates]);

  // Template preview
  const renderTemplatePreview = (template: ExportTemplate) => {
    const FormatIcon = FORMAT_ICONS[template.format];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="rounded-lg p-2"
            style={{ backgroundColor: `${FORMAT_COLORS[template.format]}20` }}
          >
            <FormatIcon
              size={20}
              style={{ color: FORMAT_COLORS[template.format] }}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <p className="text-sm capitalize text-gray-500">
              {template.format} format
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">
              Export Options
            </h4>
            <div className="space-y-2 rounded-lg bg-gray-50 p-3">
              <div className="flex justify-between text-sm">
                <span>Include Metadata:</span>
                <span
                  className={
                    template.options.includeMetadata
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {template.options.includeMetadata ? "Yes" : "No"}
                </span>
              </div>
              {template.options.title && (
                <div className="flex justify-between text-sm">
                  <span>Default Title:</span>
                  <span className="text-gray-600">
                    {template.options.title}
                  </span>
                </div>
              )}
            </div>
          </div>

          {template.customStyles && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-700">
                Custom Styles
              </h4>
              <div className="max-h-32 overflow-auto rounded-lg bg-gray-900 p-3 font-mono text-xs text-gray-100">
                <pre>{template.customStyles}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Templates view
  const renderTemplatesView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onQuickExport()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <IconDownload size={16} />
            Quick Export
          </button>
          <span className="text-sm text-gray-500">
            Default: {preferences.defaultFormat} format
          </span>
        </div>

        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-blue-600 transition-colors hover:bg-blue-50"
        >
          <IconPlus size={16} />
          New Template
        </button>
      </div>

      {userTemplates.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <IconTemplate size={20} />
            My Templates
          </h3>
          <div className="grid gap-3">
            {userTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isDefault={preferences.defaultFormat === template.format}
                onExport={() => onExportWithTemplate(template.id)}
                onEdit={() => {
                  setEditingTemplate(template);
                  setShowCreateDialog(true);
                }}
                onDelete={() => onDeleteTemplate(template.id)}
                onPreview={() => setPreviewTemplate(template)}
                onSetDefault={() =>
                  onUpdatePreferences({ defaultFormat: template.format })
                }
                isUserTemplate={true}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <IconSettings size={20} />
          Built-in Templates
        </h3>
        <div className="grid gap-3">
          {systemTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isDefault={preferences.defaultFormat === template.format}
              onExport={() => onExportWithTemplate(template.id)}
              onEdit={() => {
                // Create a copy for editing
                setEditingTemplate({
                  ...template,
                  id: `${template.id}-copy`,
                  name: `${template.name} (Copy)`,
                });
                setShowCreateDialog(true);
              }}
              onPreview={() => setPreviewTemplate(template)}
              onSetDefault={() =>
                onUpdatePreferences({ defaultFormat: template.format })
              }
              isUserTemplate={false}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={clsx(
        "export-template-manager flex h-full flex-col",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Export Manager</h2>
      </div>

      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
        {[
          { key: "templates", label: "Templates", icon: IconTemplate },
          { key: "preferences", label: "Settings", icon: IconSettings },
          { key: "history", label: "History", icon: IconArchive },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setViewMode(key as ViewMode)}
            className={clsx(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              viewMode === key
                ? "border border-gray-200 bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {viewMode === "templates" && renderTemplatesView()}
        {viewMode === "preferences" && (
          <PreferencesView
            preferences={preferences}
            onUpdate={onUpdatePreferences}
          />
        )}
        {viewMode === "history" && <HistoryView history={exportHistory} />}
      </div>

      {showCreateDialog && (
        <TemplateDialog
          template={editingTemplate}
          onSave={(template) => {
            onSaveTemplate(template);
            setShowCreateDialog(false);
            setEditingTemplate(null);
          }}
          onCancel={() => {
            setShowCreateDialog(false);
            setEditingTemplate(null);
          }}
        />
      )}

      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Template Preview</h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="rounded p-1 hover:bg-gray-100"
              >
                <IconX size={16} />
              </button>
            </div>
            {renderTemplatePreview(previewTemplate)}
          </div>
        </div>
      )}
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: ExportTemplate;
  isDefault: boolean;
  isUserTemplate: boolean;
  onExport: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onPreview: () => void;
  onSetDefault: () => void;
}

function TemplateCard({
  template,
  isDefault,
  isUserTemplate,
  onExport,
  onEdit,
  onDelete,
  onPreview,
  onSetDefault,
}: TemplateCardProps) {
  const FormatIcon = FORMAT_ICONS[template.format];

  return (
    <div className="group rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div
            className="flex-shrink-0 rounded-lg p-2"
            style={{ backgroundColor: `${FORMAT_COLORS[template.format]}20` }}
          >
            <FormatIcon
              size={16}
              style={{ color: FORMAT_COLORS[template.format] }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate font-medium text-gray-900">
                {template.name}
              </h4>
              {isDefault && (
                <IconStarFilled
                  size={14}
                  className="flex-shrink-0 text-yellow-500"
                />
              )}
            </div>
            <p className="text-sm capitalize text-gray-500">
              {template.format} format
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onExport}
            className="rounded p-1.5 text-green-600 transition-colors hover:bg-green-100"
            title="Export with this template"
          >
            <IconDownload size={14} />
          </button>

          <button
            onClick={onPreview}
            className="rounded p-1.5 text-blue-600 transition-colors hover:bg-blue-100"
            title="Preview template"
          >
            <IconEye size={14} />
          </button>

          <button
            onClick={onEdit}
            className="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
            title={isUserTemplate ? "Edit template" : "Create copy"}
          >
            {isUserTemplate ? <IconEdit size={14} /> : <IconCopy size={14} />}
          </button>

          {!isDefault && (
            <button
              onClick={onSetDefault}
              className="rounded p-1.5 text-yellow-600 transition-colors hover:bg-yellow-100"
              title="Set as default"
            >
              <IconStar size={14} />
            </button>
          )}

          {isUserTemplate && onDelete && (
            <button
              onClick={onDelete}
              className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-100"
              title="Delete template"
            >
              <IconTrash size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Preferences View Component
interface PreferencesViewProps {
  preferences: ExportPreferences;
  onUpdate: (updates: Partial<ExportPreferences>) => void;
}

function PreferencesView({ preferences, onUpdate }: PreferencesViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Export Preferences
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Default Export Format
            </label>
            <select
              value={preferences.defaultFormat}
              onChange={(e) =>
                onUpdate({ defaultFormat: e.target.value as ExportFormat })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="markdown">Markdown</option>
              <option value="html">HTML</option>
              <option value="json">JSON</option>
              <option value="backup">Backup</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.includeMetadata}
                onChange={(e) =>
                  onUpdate({ includeMetadata: e.target.checked })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Include metadata in exports
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.includeAuthor}
                onChange={(e) => onUpdate({ includeAuthor: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Include author information
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.autoDownload}
                onChange={(e) => onUpdate({ autoDownload: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Automatically download exports
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// History View Component
interface HistoryViewProps {
  history: ExportHistoryItem[];
}

function HistoryView({ history }: HistoryViewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Export History</h3>

      {history.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <IconArchive size={48} className="mx-auto mb-2 opacity-50" />
          <p>No exports yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item) => {
            const FormatIcon = FORMAT_ICONS[item.format];

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
              >
                <div
                  className="rounded-lg p-2"
                  style={{ backgroundColor: `${FORMAT_COLORS[item.format]}20` }}
                >
                  <FormatIcon
                    size={16}
                    style={{ color: FORMAT_COLORS[item.format] }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-medium text-gray-900">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{item.filename}</span>
                    <span>{formatFileSize(item.size)}</span>
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Template Dialog Component
interface TemplateDialogProps {
  template?: ExportTemplate | null;
  onSave: (template: ExportTemplate) => void;
  onCancel: () => void;
}

function TemplateDialog({ template, onSave, onCancel }: TemplateDialogProps) {
  const [name, setName] = useState(template?.name || "");
  const [format, setFormat] = useState<ExportFormat>(
    template?.format || "markdown",
  );
  const [includeMetadata, setIncludeMetadata] = useState(
    template?.options.includeMetadata ?? true,
  );
  const [title, setTitle] = useState(template?.options.title || "");
  const [customStyles, setCustomStyles] = useState(
    template?.customStyles || "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newTemplate: ExportTemplate = {
      id: template?.id || `template-${Date.now()}`,
      name: name.trim(),
      format,
      options: {
        title: title.trim() || undefined,
        includeMetadata,
      },
      customStyles: customStyles.trim() || undefined,
    };

    onSave(newTemplate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {template ? "Edit Template" : "Create Template"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded p-1 hover:bg-gray-100"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="My Custom Template"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Export Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="markdown">Markdown</option>
              <option value="html">HTML</option>
              <option value="json">JSON</option>
              <option value="backup">Backup</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Default Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Document title (optional)"
            />
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Include metadata in exports
              </span>
            </label>
          </div>

          {format === "html" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Custom CSS Styles
              </label>
              <textarea
                value={customStyles}
                onChange={(e) => setCustomStyles(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="body { font-family: sans-serif; }"
              />
              <p className="mt-1 text-xs text-gray-500">
                CSS styles will be injected into the HTML export
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <IconCheck size={16} className="mr-2 inline" />
            {template ? "Update Template" : "Create Template"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
