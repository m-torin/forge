'use client';

import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { mockRAGKnowledgeBase, shouldUseMockRAG, type MockRAGDocument } from '#/lib/mock-data';
import { isPrototypeMode } from '#/lib/prototype-mode';
import { useDisclosure } from '@mantine/hooks';
import { logInfo } from '@repo/observability';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Brain,
  Calendar,
  Database,
  FileText,
  Plus,
  Search,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface RAGKnowledgeBaseProps {
  className?: string;
}

export function RAGKnowledgeBase({ className }: RAGKnowledgeBaseProps) {
  const prototypeMode = isPrototypeMode();
  const useMockRAG = shouldUseMockRAG();

  // State management
  const [documents, setDocuments] = useState<MockRAGDocument[]>(
    useMockRAG ? mockRAGKnowledgeBase.getDocuments() : [],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, { open: openAddForm, close: closeAddForm }] = useDisclosure();
  const [newDocument, setNewDocument] = useState({
    title: '',
    content: '',
    category: 'general',
  });

  // Filter documents based on search and category
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        doc =>
          doc.title.toLowerCase().includes(query) ||
          doc.content.toLowerCase().includes(query) ||
          doc.metadata.category.toLowerCase().includes(query),
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.metadata.category === selectedCategory);
    }

    return filtered;
  }, [documents, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const categorySet = new Set(documents.map(doc => doc.metadata.category));
    return ['all', ...Array.from(categorySet)];
  }, [documents]);

  // Stats
  const stats = useMemo(
    () => ({
      totalDocuments: documents.length,
      totalChunks: documents.reduce((sum, doc) => sum + doc.chunks.length, 0),
      categories: new Set(documents.map(doc => doc.metadata.category)).size,
      recentlyAdded: documents.filter(
        doc =>
          new Date().getTime() - new Date(doc.metadata.addedAt).getTime() < 7 * 24 * 60 * 60 * 1000,
      ).length,
    }),
    [documents],
  );

  // Add new document
  const handleAddDocument = () => {
    if (!newDocument.title || !newDocument.content) return;

    const result = mockRAGKnowledgeBase.addDocument(newDocument.content, {
      title: newDocument.title,
      category: newDocument.category,
    });

    setDocuments(mockRAGKnowledgeBase.getDocuments());
    setNewDocument({ title: '', content: '', category: 'general' });
    closeAddForm();

    // Success message could be shown via toast notification
    logInfo('Document added to knowledge base', {
      documentId: result,
      title: newDocument.title,
    });
  };

  // Delete document
  const handleDeleteDocument = (id: string) => {
    const success = mockRAGKnowledgeBase.deleteDocument(id);
    if (success) {
      setDocuments(mockRAGKnowledgeBase.getDocuments());
    }
  };

  if (!useMockRAG) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Database className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">RAG Knowledge Base</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure your vector database to enable the knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Knowledge Base</h2>
          </div>
          <Button onClick={openAddForm} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Document
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Documents</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{stats.totalDocuments}</div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Chunks</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{stats.totalChunks}</div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Categories</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{stats.categories}</div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Recent</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{stats.recentlyAdded}</div>
          </div>
        </div>
      </div>

      {/* Add Document Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 rounded-lg border bg-muted/30 p-4"
          >
            <h3 className="font-medium">Add New Document</h3>
            <div className="space-y-3">
              <Input
                placeholder="Document title"
                value={newDocument.title}
                onChange={e => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
              />
              <div className="flex gap-2">
                <select
                  value={newDocument.category}
                  onChange={e => setNewDocument(prev => ({ ...prev, category: e.target.value }))}
                  className="rounded border bg-background px-3 py-2 text-sm"
                >
                  <option value="general">General</option>
                  <option value="web-development">Web Development</option>
                  <option value="ai-development">AI Development</option>
                  <option value="ai-concepts">AI Concepts</option>
                  <option value="documentation">Documentation</option>
                </select>
              </div>
              <textarea
                placeholder="Document content..."
                value={newDocument.content}
                onChange={e => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-24 w-full rounded border bg-background p-3 text-sm"
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddDocument}
                  size="sm"
                  disabled={!newDocument.title || !newDocument.content}
                >
                  Add Document
                </Button>
                <Button onClick={closeAddForm} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="rounded border bg-background px-3 py-2 text-sm"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Documents Grid */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              {searchQuery || selectedCategory !== 'all'
                ? 'No documents found'
                : 'No documents yet'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first document to get started with RAG.'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <Button onClick={openAddForm} className="mt-4" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map(document => (
              <DocumentCard
                key={document.id}
                document={document}
                onDelete={() => handleDeleteDocument(document.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Prototype Mode Indicator */}
      {prototypeMode && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/20">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Prototype Mode:</strong> This is a mock knowledge base with sample documents. In
            production, this would connect to your vector database.
          </p>
        </div>
      )}
    </div>
  );
}

// Document card component
interface DocumentCardProps {
  document: MockRAGDocument;
  onDelete: () => void;
}

function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const [showFullContent, { toggle: toggleContent }] = useDisclosure();

  const categoryColors = {
    'web-development': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    'ai-development': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    'ai-concepts': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    documentation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    general: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-background p-4 transition-shadow hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">{document.title}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                categoryColors[document.metadata.category as keyof typeof categoryColors] ||
                categoryColors.general
              }`}
            >
              {document.metadata.category}
            </span>
            <span className="text-xs text-muted-foreground">{document.chunks.length} chunks</span>
          </div>
        </div>
        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="h-7 w-7 shrink-0 p-0 text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Content Preview */}
      <div className="mt-3">
        <p className="line-clamp-3 text-xs text-muted-foreground">
          {showFullContent ? document.content : `${document.content.slice(0, 120)}...`}
        </p>
        {document.content.length > 120 && (
          <Button
            onClick={toggleContent}
            variant="ghost"
            size="sm"
            className="mt-1 h-auto p-0 text-xs text-primary hover:no-underline"
          >
            {showFullContent ? 'Show less' : 'Show more'}
          </Button>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{new Date(document.metadata.addedAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3" />
          <span>{document.metadata.source}</span>
        </div>
      </div>
    </motion.div>
  );
}
