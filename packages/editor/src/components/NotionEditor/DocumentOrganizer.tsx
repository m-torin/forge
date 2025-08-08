'use client';

import {
  IconArchive,
  IconArchiveOff,
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconFile,
  IconFolder,
  IconFolderPlus,
  IconPin,
  IconPinFilled,
  IconSearch,
  IconTag,
  IconTagPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { clsx } from 'clsx';
import { useMemo, useState } from 'react';
import type {
  DocumentFolder,
  DocumentMetadata,
  DocumentTag,
  FolderTreeNode,
} from '../../hooks/use-document-organization';
import type { SavedDocument } from '../../hooks/use-document-persistence';

export interface DocumentOrganizerProps {
  documents: Record<string, SavedDocument>;
  folders: Record<string, DocumentFolder>;
  tags: Record<string, DocumentTag>;
  documentMetadata: Record<string, DocumentMetadata>;
  folderTree: FolderTreeNode[];

  // Folder operations
  onCreateFolder: (
    name: string,
    options?: { parentId?: string; color?: string; description?: string },
  ) => void;
  onUpdateFolder: (
    folderId: string,
    updates: Partial<Pick<DocumentFolder, 'name' | 'description' | 'color'>>,
  ) => void;
  onDeleteFolder: (folderId: string) => void;
  onMoveDocumentToFolder: (documentId: string, folderId?: string) => void;

  // Tag operations
  onCreateTag: (name: string, options?: { color?: string; description?: string }) => void;
  onUpdateTag: (
    tagId: string,
    updates: Partial<Pick<DocumentTag, 'name' | 'color' | 'description'>>,
  ) => void;
  onDeleteTag: (tagId: string) => void;
  onAddTagToDocument: (documentId: string, tagId: string) => void;
  onRemoveTagFromDocument: (documentId: string, tagId: string) => void;

  // Document operations
  onSelectDocument: (documentId: string) => void;
  onTogglePin: (documentId: string) => void;
  onToggleArchive: (documentId: string) => void;

  // View options
  className?: string;
  showCreateButtons?: boolean;
  enableDragDrop?: boolean;
}

type ViewMode = 'folders' | 'tags' | 'all' | 'pinned' | 'archived' | 'unorganized';

const FOLDER_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#6B7280', // gray
];

const TAG_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

export function DocumentOrganizer({
  documents,
  folders,
  tags,
  documentMetadata,
  folderTree,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onMoveDocumentToFolder: _onMoveDocumentToFolder,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onAddTagToDocument: _onAddTagToDocument,
  onRemoveTagFromDocument: _onRemoveTagFromDocument,
  onSelectDocument,
  onTogglePin,
  onToggleArchive,
  className,
  showCreateButtons = true,
  enableDragDrop: _enableDragDrop = true,
}: DocumentOrganizerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('folders');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<DocumentFolder | null>(null);
  const [editingTag, setEditingTag] = useState<DocumentTag | null>(null);

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Get documents for current view
  const filteredDocuments = useMemo(() => {
    let docs = Object.values(documents);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter(
        doc =>
          doc.title.toLowerCase().includes(query) || doc.content.text.toLowerCase().includes(query),
      );
    }

    // Apply view mode filter
    switch (viewMode) {
      case 'pinned':
        docs = docs.filter(doc => documentMetadata[doc.id]?.isPinned);
        break;
      case 'archived':
        docs = docs.filter(doc => documentMetadata[doc.id]?.isArchived);
        break;
      case 'unorganized':
        docs = docs.filter(doc => {
          const metadata = documentMetadata[doc.id];
          return !metadata?.folderId && (!metadata?.tagIds || metadata.tagIds.length === 0);
        });
        break;
    }

    return docs;
  }, [documents, documentMetadata, viewMode, searchQuery]);

  // Get documents in a specific folder
  const getDocumentsInFolder = (folderId?: string) => {
    return filteredDocuments.filter(doc => {
      const metadata = documentMetadata[doc.id];
      return metadata?.folderId === folderId;
    });
  };

  // Get documents with a specific tag
  const getDocumentsWithTag = (tagId: string) => {
    return filteredDocuments.filter(doc => {
      const metadata = documentMetadata[doc.id];
      return metadata?.tagIds.includes(tagId);
    });
  };

  // Render document item
  const renderDocument = (doc: SavedDocument) => {
    const metadata = documentMetadata[doc.id];
    const docTags = metadata?.tagIds.map(tagId => tags[tagId]).filter(Boolean) || [];

    return (
      <div
        key={doc.id}
        role="button"
        tabIndex={0}
        onClick={() => onSelectDocument(doc.id)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            onSelectDocument(doc.id);
          }
        }}
        className="group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
      >
        <IconFile size={16} className="flex-shrink-0 text-gray-500" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-medium text-gray-900 group-hover:text-blue-600">
              {doc.title}
            </h4>
            {metadata?.isPinned && (
              <IconPinFilled size={12} className="flex-shrink-0 text-yellow-500" />
            )}
            {metadata?.isArchived && (
              <IconArchive size={12} className="flex-shrink-0 text-gray-400" />
            )}
          </div>

          {docTags.length > 0 && (
            <div className="mt-1 flex items-center gap-1">
              {docTags.slice(0, 3).map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
                  style={{
                    backgroundColor: tag.color ? `${tag.color}20` : '#f3f4f6',
                    color: tag.color || '#6b7280',
                  }}
                >
                  {tag.name}
                </span>
              ))}
              {docTags.length > 3 && (
                <span className="text-xs text-gray-500">+{docTags.length - 3}</span>
              )}
            </div>
          )}

          <div className="mt-1 text-xs text-gray-500">
            {doc.wordCount} words • {new Date(doc.modified).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={e => {
              e.stopPropagation();
              onTogglePin(doc.id);
            }}
            className="rounded p-1 transition-colors hover:bg-gray-200"
            title={metadata?.isPinned ? 'Unpin' : 'Pin'}
          >
            {metadata?.isPinned ? (
              <IconPinFilled size={14} className="text-yellow-500" />
            ) : (
              <IconPin size={14} className="text-gray-400" />
            )}
          </button>

          <button
            onClick={e => {
              e.stopPropagation();
              onToggleArchive(doc.id);
            }}
            className="rounded p-1 transition-colors hover:bg-gray-200"
            title={metadata?.isArchived ? 'Unarchive' : 'Archive'}
          >
            {metadata?.isArchived ? (
              <IconArchiveOff size={14} className="text-blue-500" />
            ) : (
              <IconArchive size={14} className="text-gray-400" />
            )}
          </button>
        </div>
      </div>
    );
  };

  // Render folder tree recursively
  const renderFolderTree = (nodes: FolderTreeNode[]) => {
    return nodes.map(folder => {
      const folderDocs = getDocumentsInFolder(folder.id);
      const isExpanded = expandedFolders.has(folder.id);

      return (
        <div key={folder.id}>
          <div
            className="group flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-gray-50"
            style={{ paddingLeft: `${folder.depth * 16 + 8}px` }}
          >
            <button
              onClick={() => toggleFolder(folder.id)}
              className="rounded p-0.5 hover:bg-gray-200"
            >
              {folder.children.length > 0 ? (
                isExpanded ? (
                  <IconChevronDown size={14} />
                ) : (
                  <IconChevronRight size={14} />
                )
              ) : (
                <div className="h-3.5 w-3.5" />
              )}
            </button>

            <div
              className="h-3 w-3 flex-shrink-0 rounded"
              style={{ backgroundColor: folder.color || '#6b7280' }}
            />

            <span className="flex-1 font-medium text-gray-900">{folder.name}</span>

            <span className="text-xs text-gray-500">
              {folderDocs.length +
                folder.children.reduce(
                  (sum, child) => sum + getDocumentsInFolder(child.id).length,
                  0,
                )}
            </span>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setEditingFolder(folder);
                  setShowFolderDialog(true);
                }}
                className="rounded p-1 hover:bg-gray-200"
                title="Edit folder"
              >
                <IconEdit size={12} />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  if (
                    confirm(
                      `Delete folder "${folder.name}"? Documents will be moved to parent folder.`,
                    )
                  ) {
                    onDeleteFolder(folder.id);
                  }
                }}
                className="rounded p-1 text-red-600 hover:bg-red-100"
                title="Delete folder"
              >
                <IconTrash size={12} />
              </button>
            </div>
          </div>

          {isExpanded && (
            <div style={{ paddingLeft: `${(folder.depth + 1) * 16 + 8}px` }}>
              {folderDocs.map(renderDocument)}
            </div>
          )}

          {isExpanded && folder.children.length > 0 && renderFolderTree(folder.children)}
        </div>
      );
    });
  };

  // Render tags view
  const renderTagsView = () => {
    const sortedTags = Object.values(tags).sort((a, b) => b.documentCount - a.documentCount);

    return (
      <div className="space-y-4">
        {sortedTags.map(tag => {
          const tagDocs = getDocumentsWithTag(tag.id);

          return (
            <div key={tag.id} className="rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 rounded-t-lg bg-gray-50 p-3">
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: tag.color || '#6b7280' }}
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{tag.name}</h3>
                  {tag.description && <p className="text-sm text-gray-600">{tag.description}</p>}
                </div>
                <span className="text-sm text-gray-500">{tagDocs.length} docs</span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingTag(tag);
                      setShowTagDialog(true);
                    }}
                    className="rounded p-1 hover:bg-gray-200"
                    title="Edit tag"
                  >
                    <IconEdit size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm(`Delete tag "${tag.name}"? It will be removed from all documents.`)
                      ) {
                        onDeleteTag(tag.id);
                      }
                    }}
                    className="rounded p-1 text-red-600 hover:bg-red-100"
                    title="Delete tag"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 p-3">{tagDocs.map(renderDocument)}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={clsx('document-organizer flex h-full flex-col', className)}>
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Organize</h2>

        {showCreateButtons && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFolderDialog(true)}
              className="flex items-center gap-1 rounded px-2 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50"
              title="Create folder"
            >
              <IconFolderPlus size={16} />
            </button>
            <button
              onClick={() => setShowTagDialog(true)}
              className="flex items-center gap-1 rounded px-2 py-1 text-sm text-green-600 transition-colors hover:bg-green-50"
              title="Create tag"
            >
              <IconTagPlus size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
        {[
          { key: 'folders', label: 'Folders', icon: IconFolder },
          { key: 'tags', label: 'Tags', icon: IconTag },
          { key: 'all', label: 'All', icon: IconFile },
          { key: 'pinned', label: 'Pinned', icon: IconPin },
          { key: 'archived', label: 'Archived', icon: IconArchive },
          { key: 'unorganized', label: 'Unorganized', icon: IconSearch },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setViewMode(key as ViewMode)}
            className={clsx(
              'flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors',
              viewMode === key
                ? 'border border-gray-200 bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="border-b border-gray-200 p-3">
        <div className="relative">
          <IconSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
          />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-9 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
            >
              <IconX size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {viewMode === 'folders' && (
          <div className="space-y-1">
            <div className="space-y-1">{getDocumentsInFolder().map(renderDocument)}</div>

            {renderFolderTree(folderTree)}
          </div>
        )}

        {viewMode === 'tags' && renderTagsView()}

        {(viewMode === 'all' ||
          viewMode === 'pinned' ||
          viewMode === 'archived' ||
          viewMode === 'unorganized') && (
          <div className="space-y-2">{filteredDocuments.map(renderDocument)}</div>
        )}
      </div>

      {showFolderDialog && (
        <FolderDialog
          folder={editingFolder}
          folders={folders}
          colors={FOLDER_COLORS}
          onSave={data => {
            if (editingFolder) {
              onUpdateFolder(editingFolder.id, data);
            } else {
              onCreateFolder(data.name, data);
            }
            setShowFolderDialog(false);
            setEditingFolder(null);
          }}
          onCancel={() => {
            setShowFolderDialog(false);
            setEditingFolder(null);
          }}
        />
      )}

      {showTagDialog && (
        <TagDialog
          tag={editingTag}
          colors={TAG_COLORS}
          onSave={data => {
            if (editingTag) {
              onUpdateTag(editingTag.id, data);
            } else {
              onCreateTag(data.name, data);
            }
            setShowTagDialog(false);
            setEditingTag(null);
          }}
          onCancel={() => {
            setShowTagDialog(false);
            setEditingTag(null);
          }}
        />
      )}
    </div>
  );
}

// Folder creation/editing dialog
interface FolderDialogProps {
  folder?: DocumentFolder | null;
  folders: Record<string, DocumentFolder>;
  colors: string[];
  onSave: (data: { name: string; description?: string; color?: string; parentId?: string }) => void;
  onCancel: () => void;
}

function FolderDialog({ folder, folders, colors, onSave, onCancel }: FolderDialogProps) {
  const [name, setName] = useState(folder?.name || '');
  const [description, setDescription] = useState(folder?.description || '');
  const [color, setColor] = useState(folder?.color || colors[0]);
  const [parentId, setParentId] = useState(folder?.parentId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      parentId: parentId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold">{folder ? 'Edit Folder' : 'Create Folder'}</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Folder name"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Color</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={clsx(
                    'h-6 w-6 rounded-full border-2 transition-all',
                    color === c ? 'scale-110 border-gray-400' : 'border-gray-200',
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Parent Folder</label>
            <select
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Root Level</option>
              {Object.values(folders).map(f => (
                <option key={f.id} value={f.id} disabled={f.id === folder?.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            {folder ? 'Update' : 'Create'}
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

// Tag creation/editing dialog
interface TagDialogProps {
  tag?: DocumentTag | null;
  colors: string[];
  onSave: (data: { name: string; description?: string; color?: string }) => void;
  onCancel: () => void;
}

function TagDialog({ tag, colors, onSave, onCancel }: TagDialogProps) {
  const [name, setName] = useState(tag?.name || '');
  const [description, setDescription] = useState(tag?.description || '');
  const [color, setColor] = useState(tag?.color || colors[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold">{tag ? 'Edit Tag' : 'Create Tag'}</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Tag name"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Color</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={clsx(
                    'h-6 w-6 rounded-full border-2 transition-all',
                    color === c ? 'scale-110 border-gray-400' : 'border-gray-200',
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            {tag ? 'Update' : 'Create'}
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
