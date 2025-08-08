'use client';

import { useLocalStorage } from '@mantine/hooks';
import {
  IconClock,
  IconDownload,
  IconFile,
  IconFileText,
  IconFolder,
  IconHistory,
  IconPlus,
  IconSearch,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconZoomIn,
} from '@tabler/icons-react';
import { clsx } from 'clsx';
import { useMemo, useState } from 'react';
import type { DocumentMeta, SavedDocument } from '../../hooks/use-document-persistence';
import { DocumentSearch } from './DocumentSearch';

export interface DocumentManagerProps {
  documents: Record<string, SavedDocument>;
  recentDocuments: DocumentMeta[];
  onCreateNew: () => void;
  onLoadDocument: (documentId: string) => void;
  onDeleteDocument: (documentId: string) => void;
  onExportDocument: (documentId: string) => void;
  className?: string;
  enableAdvancedSearch?: boolean;
}

export function DocumentManager({
  documents,
  recentDocuments,
  onCreateNew,
  onLoadDocument,
  onDeleteDocument,
  onExportDocument,
  className,
  enableAdvancedSearch = true,
}: DocumentManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'modified' | 'created' | 'title' | 'wordCount'>('modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [_viewMode, _setViewMode] = useState<'list' | 'grid'>('list');
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);

  // Favorites stored in localStorage
  const [favorites, setFavorites] = useLocalStorage<string[]>({
    key: 'notion-editor-favorites',
    defaultValue: [],
  });

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    const docArray = Object.values(documents);

    // Filter by search query
    const filtered = docArray.filter(
      doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.text.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created':
          comparison = new Date(a.created).getTime() - new Date(b.created).getTime();
          break;
        case 'modified':
          comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime();
          break;
        case 'wordCount':
          comparison = a.wordCount - b.wordCount;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [documents, searchQuery, sortBy, sortOrder]);

  const toggleFavorite = (documentId: string) => {
    setFavorites(prev =>
      prev.includes(documentId) ? prev.filter(id => id !== documentId) : [...prev, documentId],
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatFileSize = (wordCount: number, characterCount: number) => {
    if (wordCount === 0) return 'Empty';
    return `${wordCount} words, ${characterCount} chars`;
  };

  return (
    <div className={clsx('document-manager', className)}>
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <IconFolder size={20} />
            Documents
          </h2>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <IconPlus size={16} />
            New Document
          </button>
        </div>

        <div className="space-y-4">
          {enableAdvancedSearch && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUseAdvancedSearch(false)}
                  className={clsx(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    !useAdvancedSearch
                      ? 'border border-blue-300 bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )}
                >
                  <IconSearch size={16} />
                  Simple Search
                </button>
                <button
                  onClick={() => setUseAdvancedSearch(true)}
                  className={clsx(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    useAdvancedSearch
                      ? 'border border-blue-300 bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )}
                >
                  <IconZoomIn size={16} />
                  Advanced Search
                </button>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <IconHistory size={12} />
                Press{' '}
                <kbd className="rounded border border-gray-300 bg-gray-100 px-1 py-0.5 text-xs">
                  ⌘K
                </kbd>{' '}
                for quick search
              </div>
            </div>
          )}

          {useAdvancedSearch ? (
            <DocumentSearch
              documents={documents}
              onSelectDocument={onLoadDocument}
              className="rounded-lg border border-gray-200 bg-white p-4"
              maxResults={20}
            />
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <IconSearch
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="modified">Last Modified</option>
                <option value="created">Date Created</option>
                <option value="title">Title</option>
                <option value="wordCount">Word Count</option>
              </select>

              <button
                onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                className="rounded-lg border border-gray-300 px-3 py-2 transition-colors hover:bg-gray-50"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          )}
        </div>

        {!useAdvancedSearch && (
          <div className="text-sm text-gray-500">
            {filteredDocuments.length} of {Object.keys(documents).length} documents
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </div>

      {recentDocuments.length > 0 && !searchQuery && !useAdvancedSearch && (
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
            <IconClock size={16} />
            Recent Documents
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentDocuments.slice(0, 5).map(doc => (
              <button
                key={doc.id}
                onClick={() => onLoadDocument(doc.id)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-colors hover:bg-gray-50"
              >
                <IconFileText size={14} />
                <span className="max-w-32 truncate">{doc.title}</span>
                <span className="text-xs text-gray-500">{formatDate(doc.modified)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!useAdvancedSearch && (
        <div className="flex-1 overflow-auto">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <IconFile size={48} className="mb-4 opacity-50" />
              <h3 className="mb-2 text-lg font-medium">
                {searchQuery ? 'No documents found' : 'No documents yet'}
              </h3>
              <p className="max-w-md text-center text-sm">
                {searchQuery
                  ? `No documents match "${searchQuery}". Try a different search term.`
                  : 'Create your first document to get started.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={onCreateNew}
                  className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <IconPlus size={16} />
                  Create Document
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredDocuments.map(doc => (
                <div
                  key={doc.id}
                  role="button"
                  tabIndex={0}
                  className="group flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-gray-50"
                  onClick={() => onLoadDocument(doc.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onLoadDocument(doc.id);
                    }
                  }}
                >
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleFavorite(doc.id);
                    }}
                    className="text-gray-400 transition-colors hover:text-yellow-500"
                  >
                    {favorites.includes(doc.id) ? (
                      <IconStarFilled size={16} className="text-yellow-500" />
                    ) : (
                      <IconStar size={16} />
                    )}
                  </button>

                  <div className="flex-shrink-0">
                    <IconFileText size={20} className="text-gray-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-gray-900 transition-colors group-hover:text-blue-600">
                      {doc.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>Modified {formatDate(doc.modified)}</span>
                      <span>{formatFileSize(doc.wordCount, doc.characterCount)}</span>
                      <span>v{doc.version}</span>
                    </div>
                    {doc.content.text && (
                      <p className="mt-1 truncate text-sm text-gray-600">
                        {doc.content.text.slice(0, 100)}...
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onExportDocument(doc.id);
                      }}
                      className="rounded-md p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      title="Export Document"
                    >
                      <IconDownload size={16} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
                          onDeleteDocument(doc.id);
                        }
                      }}
                      className="rounded-md p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Delete Document"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
